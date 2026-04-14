create or replace function public.currency_to_ars_rate(p_currency text)
returns numeric
language plpgsql
immutable
as $$
begin
  case upper(coalesce(p_currency, ''))
    when 'ARS' then
      return 1;
    when 'USD' then
      return 1100;
    when 'EUR' then
      return 1250;
    else
      raise exception 'unsupported_currency';
  end case;
end;
$$;

create or replace function public.seed_user_defaults(
  p_user_id uuid,
  p_base_currency text default 'ARS'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_currency public.accounts.currency%type := case
    when upper(coalesce(p_base_currency, 'ARS')) in ('ARS', 'USD', 'EUR')
      then upper(coalesce(p_base_currency, 'ARS'))
    else 'ARS'
  end;
begin
  if p_user_id is null then
    raise exception 'invalid_user_id';
  end if;

  insert into public.categories (
    user_id,
    name,
    type
  )
  select
    p_user_id,
    'General',
    'expense'
  where not exists (
    select 1
    from public.categories
    where user_id = p_user_id
      and type = 'expense'
      and lower(name) = lower('General')
  );

  insert into public.categories (
    user_id,
    name,
    type
  )
  select
    p_user_id,
    'Sueldo',
    'income'
  where not exists (
    select 1
    from public.categories
    where user_id = p_user_id
      and type = 'income'
      and lower(name) = lower('Sueldo')
  );

  insert into public.accounts (
    user_id,
    name,
    type,
    currency
  )
  select
    p_user_id,
    'Cuenta principal',
    'bank',
    v_currency
  where not exists (
    select 1
    from public.accounts
    where user_id = p_user_id
      and lower(name) = lower('Cuenta principal')
  );

  perform public.record_audit_event(
    'user_defaults_seeded',
    p_user_id,
    'profile',
    p_user_id,
    jsonb_build_object('base_currency', v_currency)
  );
end;
$$;

revoke all on function public.seed_user_defaults(uuid, text) from public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base_currency public.profiles.base_currency%type := case
    when upper(coalesce(new.raw_user_meta_data ->> 'base_currency', '')) in ('ARS', 'USD', 'EUR')
      then upper(new.raw_user_meta_data ->> 'base_currency')
    else 'ARS'
  end;
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    base_currency,
    timezone
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    v_base_currency,
    'America/Argentina/Buenos_Aires'
  )
  on conflict (id) do update
  set email = excluded.email;

  perform public.seed_user_defaults(new.id, v_base_currency::text);
  perform public.record_audit_event(
    'user_created',
    new.id,
    'profile',
    new.id,
    jsonb_build_object('email', new.email, 'base_currency', v_base_currency)
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  event_type text not null,
  entity_type text null,
  entity_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists audit_events_user_created_idx
on public.audit_events (user_id, created_at desc);

create index if not exists audit_events_event_created_idx
on public.audit_events (event_type, created_at desc);

create or replace function public.record_audit_event(
  p_event_type text,
  p_user_id uuid default null,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_events (
    user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_user_id,
    p_event_type,
    p_entity_type,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on table public.audit_events from public;
grant select on public.audit_events to authenticated;
revoke all on function public.record_audit_event(text, uuid, text, uuid, jsonb) from public;

create or replace function public.get_account_available_balance(
  p_account_id uuid,
  p_user_id uuid,
  p_excluded_transaction_id uuid default null
)
returns numeric
language sql
stable
set search_path = public
as $$
  select coalesce(sum(
    case
      when type = 'income' then amount::numeric
      when type = 'expense' then -amount::numeric
      else 0
    end
  ), 0)
  from public.transactions
  where account_id = p_account_id
    and user_id = p_user_id
    and (p_excluded_transaction_id is null or id <> p_excluded_transaction_id);
$$;

create or replace function public.create_account(
  p_name text,
  p_type text,
  p_currency text default 'ARS'
)
returns public.accounts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_type public.accounts.type%type;
  v_currency public.accounts.currency%type;
  v_account public.accounts;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_name = '' then
    raise exception 'blank_account_name';
  end if;

  if p_type not in ('cash', 'bank', 'card') then
    raise exception 'invalid_account_type';
  end if;

  perform public.currency_to_ars_rate(p_currency);
  v_type := p_type;
  v_currency := upper(p_currency);

  if exists (
    select 1
    from public.accounts
    where user_id = v_user_id
      and lower(name) = lower(v_name)
  ) then
    raise exception 'duplicate_account_name';
  end if;

  insert into public.accounts (
    user_id,
    name,
    type,
    currency
  )
  values (
    v_user_id,
    v_name,
    v_type,
    v_currency
  )
  returning * into v_account;

  perform public.record_audit_event(
    'account_created',
    v_user_id,
    'account',
    v_account.id,
    jsonb_build_object('name', v_account.name, 'currency', v_account.currency, 'type', v_account.type)
  );

  return v_account;
end;
$$;

revoke all on function public.create_account(text, text, text) from public;
grant execute on function public.create_account(text, text, text) to authenticated;

create or replace function public.update_account(
  p_account_id uuid,
  p_name text,
  p_currency text default null
)
returns public.accounts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_currency public.accounts.currency%type;
  v_account public.accounts;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_name = '' then
    raise exception 'blank_account_name';
  end if;

  select *
  into v_account
  from public.accounts
  where id = p_account_id
    and user_id = v_user_id;

  if not found then
    raise exception 'account_not_found';
  end if;

  v_currency := upper(coalesce(nullif(btrim(p_currency), ''), v_account.currency::text));
  perform public.currency_to_ars_rate(v_currency::text);

  if exists (
    select 1
    from public.accounts
    where user_id = v_user_id
      and id <> p_account_id
      and lower(name) = lower(v_name)
  ) then
    raise exception 'duplicate_account_name';
  end if;

  update public.accounts
  set name = v_name,
      currency = v_currency,
      updated_at = timezone('utc', now())
  where id = p_account_id
  returning * into v_account;

  perform public.record_audit_event(
    'account_updated',
    v_user_id,
    'account',
    v_account.id,
    jsonb_build_object('name', v_account.name, 'currency', v_account.currency)
  );

  return v_account;
end;
$$;

revoke all on function public.update_account(uuid, text, text) from public;
grant execute on function public.update_account(uuid, text, text) to authenticated;

create or replace function public.delete_account(
  p_account_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_account public.accounts;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select *
  into v_account
  from public.accounts
  where id = p_account_id
    and user_id = v_user_id;

  if not found then
    raise exception 'account_not_found';
  end if;

  if v_account.is_system then
    raise exception 'system_account_delete_forbidden';
  end if;

  if exists (
    select 1
    from public.transactions
    where user_id = v_user_id
      and account_id = p_account_id
  ) then
    raise exception 'account_has_transactions';
  end if;

  if exists (
    select 1
    from public.saving_goals
    where user_id = v_user_id
      and account_id = p_account_id
  ) then
    raise exception 'account_has_saving_goals';
  end if;

  delete from public.accounts
  where id = p_account_id;

  perform public.record_audit_event(
    'account_deleted',
    v_user_id,
    'account',
    p_account_id,
    jsonb_build_object('name', v_account.name)
  );

  return p_account_id;
end;
$$;

revoke all on function public.delete_account(uuid) from public;
grant execute on function public.delete_account(uuid) to authenticated;

create or replace function public.create_category(
  p_name text,
  p_type text
)
returns public.categories
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_type public.categories.type%type;
  v_category public.categories;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_name = '' then
    raise exception 'blank_category_name';
  end if;

  if p_type not in ('income', 'expense') then
    raise exception 'invalid_category_type';
  end if;

  v_type := p_type;

  if exists (
    select 1
    from public.categories
    where user_id = v_user_id
      and type = v_type
      and lower(name) = lower(v_name)
  ) then
    raise exception 'duplicate_category_name';
  end if;

  insert into public.categories (
    user_id,
    name,
    type
  )
  values (
    v_user_id,
    v_name,
    v_type
  )
  returning * into v_category;

  perform public.record_audit_event(
    'category_created',
    v_user_id,
    'category',
    v_category.id,
    jsonb_build_object('name', v_category.name, 'type', v_category.type)
  );

  return v_category;
end;
$$;

revoke all on function public.create_category(text, text) from public;
grant execute on function public.create_category(text, text) to authenticated;

create or replace function public.update_category(
  p_category_id uuid,
  p_name text
)
returns public.categories
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_current public.categories;
  v_category public.categories;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_name = '' then
    raise exception 'blank_category_name';
  end if;

  select *
  into v_current
  from public.categories
  where id = p_category_id
    and user_id = v_user_id;

  if not found then
    raise exception 'category_not_found';
  end if;

  if exists (
    select 1
    from public.categories
    where user_id = v_user_id
      and id <> p_category_id
      and type = v_current.type
      and lower(name) = lower(v_name)
  ) then
    raise exception 'duplicate_category_name';
  end if;

  update public.categories
  set name = v_name,
      updated_at = timezone('utc', now())
  where id = p_category_id
  returning * into v_category;

  perform public.record_audit_event(
    'category_updated',
    v_user_id,
    'category',
    v_category.id,
    jsonb_build_object('name', v_category.name, 'type', v_category.type)
  );

  return v_category;
end;
$$;

revoke all on function public.update_category(uuid, text) from public;
grant execute on function public.update_category(uuid, text) to authenticated;

create or replace function public.delete_category(
  p_category_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.categories
    where id = p_category_id
      and user_id = v_user_id
  ) then
    raise exception 'category_not_found';
  end if;

  if exists (
    select 1
    from public.transactions
    where user_id = v_user_id
      and category_id = p_category_id
  ) then
    raise exception 'category_has_transactions';
  end if;

  if exists (
    select 1
    from public.budgets
    where user_id = v_user_id
      and category_id = p_category_id
  ) then
    raise exception 'category_has_budgets';
  end if;

  delete from public.categories
  where id = p_category_id;

  perform public.record_audit_event(
    'category_deleted',
    v_user_id,
    'category',
    p_category_id,
    '{}'::jsonb
  );

  return p_category_id;
end;
$$;

revoke all on function public.delete_category(uuid) from public;
grant execute on function public.delete_category(uuid) to authenticated;

create or replace function public.create_budget(
  p_category_id uuid,
  p_amount numeric,
  p_month_start date
)
returns public.budgets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_budget public.budgets;
  v_amount numeric(12,2);
  v_month_start date;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_budget_amount';
  end if;

  if p_month_start is null then
    raise exception 'invalid_budget_month';
  end if;

  v_amount := round(p_amount::numeric, 2);
  v_month_start := date_trunc('month', p_month_start)::date;

  if not exists (
    select 1
    from public.categories
    where id = p_category_id
      and user_id = v_user_id
      and type = 'expense'
  ) then
    raise exception 'invalid_budget_category';
  end if;

  if exists (
    select 1
    from public.budgets
    where user_id = v_user_id
      and category_id = p_category_id
      and month_start = v_month_start
  ) then
    raise exception 'duplicate_budget_month';
  end if;

  insert into public.budgets (
    user_id,
    category_id,
    month_start,
    amount,
    currency
  )
  values (
    v_user_id,
    p_category_id,
    v_month_start,
    v_amount,
    'ARS'
  )
  returning * into v_budget;

  perform public.record_audit_event(
    'budget_created',
    v_user_id,
    'budget',
    v_budget.id,
    jsonb_build_object('category_id', v_budget.category_id, 'month_start', v_budget.month_start)
  );

  return v_budget;
end;
$$;

revoke all on function public.create_budget(uuid, numeric, date) from public;
grant execute on function public.create_budget(uuid, numeric, date) to authenticated;

create or replace function public.update_budget(
  p_budget_id uuid,
  p_category_id uuid,
  p_amount numeric,
  p_month_start date
)
returns public.budgets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_budget public.budgets;
  v_amount numeric(12,2);
  v_month_start date;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_budget_amount';
  end if;

  if p_month_start is null then
    raise exception 'invalid_budget_month';
  end if;

  select *
  into v_budget
  from public.budgets
  where id = p_budget_id
    and user_id = v_user_id;

  if not found then
    raise exception 'budget_not_found';
  end if;

  v_amount := round(p_amount::numeric, 2);
  v_month_start := date_trunc('month', p_month_start)::date;

  if not exists (
    select 1
    from public.categories
    where id = p_category_id
      and user_id = v_user_id
      and type = 'expense'
  ) then
    raise exception 'invalid_budget_category';
  end if;

  if exists (
    select 1
    from public.budgets
    where user_id = v_user_id
      and id <> p_budget_id
      and category_id = p_category_id
      and month_start = v_month_start
  ) then
    raise exception 'duplicate_budget_month';
  end if;

  update public.budgets
  set category_id = p_category_id,
      amount = v_amount,
      month_start = v_month_start,
      updated_at = timezone('utc', now())
  where id = p_budget_id
  returning * into v_budget;

  perform public.record_audit_event(
    'budget_updated',
    v_user_id,
    'budget',
    v_budget.id,
    jsonb_build_object('category_id', v_budget.category_id, 'month_start', v_budget.month_start)
  );

  return v_budget;
end;
$$;

revoke all on function public.update_budget(uuid, uuid, numeric, date) from public;
grant execute on function public.update_budget(uuid, uuid, numeric, date) to authenticated;

create or replace function public.delete_budget(
  p_budget_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.budgets
    where id = p_budget_id
      and user_id = v_user_id
  ) then
    raise exception 'budget_not_found';
  end if;

  delete from public.budgets
  where id = p_budget_id;

  perform public.record_audit_event(
    'budget_deleted',
    v_user_id,
    'budget',
    p_budget_id,
    '{}'::jsonb
  );

  return p_budget_id;
end;
$$;

revoke all on function public.delete_budget(uuid) from public;
grant execute on function public.delete_budget(uuid) to authenticated;

create or replace function public.create_saving_goal(
  p_account_id uuid,
  p_name text,
  p_target_amount numeric,
  p_target_date date,
  p_currency text
)
returns public.saving_goals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_currency public.saving_goals.currency%type;
  v_goal public.saving_goals;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_name = '' then
    raise exception 'blank_saving_goal_name';
  end if;

  if p_target_amount is null or p_target_amount <= 0 then
    raise exception 'invalid_saving_goal_amount';
  end if;

  if p_target_date is null then
    raise exception 'invalid_saving_goal_date';
  end if;

  if not exists (
    select 1
    from public.accounts
    where id = p_account_id
      and user_id = v_user_id
  ) then
    raise exception 'account_not_found';
  end if;

  perform public.currency_to_ars_rate(p_currency);
  v_currency := upper(p_currency);

  insert into public.saving_goals (
    user_id,
    account_id,
    name,
    target_amount,
    currency,
    target_date
  )
  values (
    v_user_id,
    p_account_id,
    v_name,
    round(p_target_amount::numeric, 2),
    v_currency,
    p_target_date
  )
  returning * into v_goal;

  perform public.record_audit_event(
    'saving_goal_created',
    v_user_id,
    'saving_goal',
    v_goal.id,
    jsonb_build_object('account_id', v_goal.account_id, 'name', v_goal.name)
  );

  return v_goal;
end;
$$;

revoke all on function public.create_saving_goal(uuid, text, numeric, date, text) from public;
grant execute on function public.create_saving_goal(uuid, text, numeric, date, text) to authenticated;

create or replace function public.update_saving_goal(
  p_saving_goal_id uuid,
  p_account_id uuid,
  p_name text,
  p_target_amount numeric,
  p_target_date date,
  p_currency text
)
returns public.saving_goals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_currency public.saving_goals.currency%type;
  v_goal public.saving_goals;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_name = '' then
    raise exception 'blank_saving_goal_name';
  end if;

  if p_target_amount is null or p_target_amount <= 0 then
    raise exception 'invalid_saving_goal_amount';
  end if;

  if p_target_date is null then
    raise exception 'invalid_saving_goal_date';
  end if;

  select *
  into v_goal
  from public.saving_goals
  where id = p_saving_goal_id
    and user_id = v_user_id;

  if not found then
    raise exception 'saving_goal_not_found';
  end if;

  if not exists (
    select 1
    from public.accounts
    where id = p_account_id
      and user_id = v_user_id
  ) then
    raise exception 'account_not_found';
  end if;

  perform public.currency_to_ars_rate(p_currency);
  v_currency := upper(p_currency);

  update public.saving_goals
  set account_id = p_account_id,
      name = v_name,
      target_amount = round(p_target_amount::numeric, 2),
      currency = v_currency,
      target_date = p_target_date,
      updated_at = timezone('utc', now())
  where id = p_saving_goal_id
  returning * into v_goal;

  perform public.record_audit_event(
    'saving_goal_updated',
    v_user_id,
    'saving_goal',
    v_goal.id,
    jsonb_build_object('account_id', v_goal.account_id, 'name', v_goal.name)
  );

  return v_goal;
end;
$$;

revoke all on function public.update_saving_goal(uuid, uuid, text, numeric, date, text) from public;
grant execute on function public.update_saving_goal(uuid, uuid, text, numeric, date, text) to authenticated;

create or replace function public.delete_saving_goal(
  p_saving_goal_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.saving_goals
    where id = p_saving_goal_id
      and user_id = v_user_id
  ) then
    raise exception 'saving_goal_not_found';
  end if;

  delete from public.saving_goals
  where id = p_saving_goal_id;

  perform public.record_audit_event(
    'saving_goal_deleted',
    v_user_id,
    'saving_goal',
    p_saving_goal_id,
    '{}'::jsonb
  );

  return p_saving_goal_id;
end;
$$;

revoke all on function public.delete_saving_goal(uuid) from public;
grant execute on function public.delete_saving_goal(uuid) to authenticated;

create or replace function public.create_transaction(
  p_account_id uuid,
  p_category_id uuid,
  p_type text,
  p_amount numeric,
  p_transaction_date date,
  p_description text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_account public.accounts;
  v_category public.categories;
  v_transaction public.transactions;
  v_type public.transactions.type%type;
  v_amount numeric(12,2);
  v_exchange_rate numeric(12,6);
  v_base_amount numeric(12,2);
  v_available_balance numeric(12,2);
  v_description text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_type not in ('income', 'expense') then
    raise exception 'invalid_transaction_type';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  v_type := p_type;

  select *
  into v_account
  from public.accounts
  where id = p_account_id
    and user_id = v_user_id;

  if not found then
    raise exception 'account_not_found';
  end if;

  select *
  into v_category
  from public.categories
  where id = p_category_id
    and user_id = v_user_id
    and type = v_type;

  if not found then
    raise exception 'invalid_category';
  end if;

  v_amount := round(p_amount::numeric, 2);

  if v_type = 'expense' then
    v_available_balance := public.get_account_available_balance(p_account_id, v_user_id);

    if v_amount > v_available_balance then
      raise exception 'insufficient_balance';
    end if;
  end if;

  v_exchange_rate := public.currency_to_ars_rate(v_account.currency::text);
  v_base_amount := round(v_amount * v_exchange_rate, 2);
  v_description := coalesce(nullif(btrim(coalesce(p_description, '')), ''), 'Movimiento sin descripcion');

  insert into public.transactions (
    user_id,
    account_id,
    category_id,
    type,
    amount,
    currency,
    exchange_rate,
    base_amount,
    description,
    transaction_date,
    is_transfer,
    category_name_snapshot
  )
  values (
    v_user_id,
    p_account_id,
    p_category_id,
    v_type,
    v_amount,
    v_account.currency,
    v_exchange_rate,
    v_base_amount,
    v_description,
    p_transaction_date,
    false,
    v_category.name
  )
  returning * into v_transaction;

  perform public.record_audit_event(
    'transaction_created',
    v_user_id,
    'transaction',
    v_transaction.id,
    jsonb_build_object('account_id', v_transaction.account_id, 'type', v_transaction.type, 'amount', v_transaction.amount)
  );

  return v_transaction;
end;
$$;

revoke all on function public.create_transaction(uuid, uuid, text, numeric, date, text) from public;
grant execute on function public.create_transaction(uuid, uuid, text, numeric, date, text) to authenticated;

create or replace function public.update_transaction(
  p_transaction_id uuid,
  p_account_id uuid,
  p_category_id uuid,
  p_type text,
  p_amount numeric,
  p_transaction_date date,
  p_description text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_current public.transactions;
  v_account public.accounts;
  v_category public.categories;
  v_transaction public.transactions;
  v_type public.transactions.type%type;
  v_amount numeric(12,2);
  v_exchange_rate numeric(12,6);
  v_base_amount numeric(12,2);
  v_available_balance numeric(12,2);
  v_description text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_type not in ('income', 'expense') then
    raise exception 'invalid_transaction_type';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  v_type := p_type;

  select *
  into v_current
  from public.transactions
  where id = p_transaction_id
    and user_id = v_user_id;

  if not found then
    raise exception 'transaction_not_found';
  end if;

  if v_current.is_transfer then
    raise exception 'transfer_transaction_locked';
  end if;

  select *
  into v_account
  from public.accounts
  where id = p_account_id
    and user_id = v_user_id;

  if not found then
    raise exception 'account_not_found';
  end if;

  select *
  into v_category
  from public.categories
  where id = p_category_id
    and user_id = v_user_id
    and type = v_type;

  if not found then
    raise exception 'invalid_category';
  end if;

  v_amount := round(p_amount::numeric, 2);

  if v_type = 'expense' then
    v_available_balance := public.get_account_available_balance(
      p_account_id,
      v_user_id,
      p_transaction_id
    );

    if v_amount > v_available_balance then
      raise exception 'insufficient_balance';
    end if;
  end if;

  v_exchange_rate := public.currency_to_ars_rate(v_account.currency::text);
  v_base_amount := round(v_amount * v_exchange_rate, 2);
  v_description := coalesce(nullif(btrim(coalesce(p_description, '')), ''), 'Movimiento sin descripcion');

  update public.transactions
  set account_id = p_account_id,
      category_id = p_category_id,
      type = v_type,
      amount = v_amount,
      currency = v_account.currency,
      exchange_rate = v_exchange_rate,
      base_amount = v_base_amount,
      description = v_description,
      transaction_date = p_transaction_date,
      category_name_snapshot = v_category.name,
      updated_at = timezone('utc', now())
  where id = p_transaction_id
  returning * into v_transaction;

  perform public.record_audit_event(
    'transaction_updated',
    v_user_id,
    'transaction',
    v_transaction.id,
    jsonb_build_object('account_id', v_transaction.account_id, 'type', v_transaction.type, 'amount', v_transaction.amount)
  );

  return v_transaction;
end;
$$;

revoke all on function public.update_transaction(uuid, uuid, uuid, text, numeric, date, text) from public;
grant execute on function public.update_transaction(uuid, uuid, uuid, text, numeric, date, text) to authenticated;

create or replace function public.delete_transaction(
  p_transaction_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_transaction public.transactions;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select *
  into v_transaction
  from public.transactions
  where id = p_transaction_id
    and user_id = v_user_id;

  if not found then
    raise exception 'transaction_not_found';
  end if;

  if v_transaction.is_transfer then
    raise exception 'transfer_transaction_locked';
  end if;

  delete from public.transactions
  where id = p_transaction_id;

  perform public.record_audit_event(
    'transaction_deleted',
    v_user_id,
    'transaction',
    p_transaction_id,
    jsonb_build_object('type', v_transaction.type, 'amount', v_transaction.amount)
  );

  return p_transaction_id;
end;
$$;

revoke all on function public.delete_transaction(uuid) from public;
grant execute on function public.delete_transaction(uuid) to authenticated;

create or replace function public.create_transfer(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_source_amount numeric,
  p_transaction_date date,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_from_account public.accounts%rowtype;
  v_to_account public.accounts%rowtype;
  v_transfer_id uuid := gen_random_uuid();
  v_source_amount numeric(12,2);
  v_destination_amount numeric(12,2);
  v_source_exchange_rate numeric(12,6);
  v_destination_exchange_rate numeric(12,6);
  v_base_amount numeric(12,2);
  v_available_balance numeric(12,2);
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_from_account_id = p_to_account_id then
    raise exception 'same_account_transfer';
  end if;

  if p_source_amount is null or p_source_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  select *
  into v_from_account
  from public.accounts
  where id = p_from_account_id
    and user_id = v_user_id;

  if not found then
    raise exception 'from_account_not_found';
  end if;

  select *
  into v_to_account
  from public.accounts
  where id = p_to_account_id
    and user_id = v_user_id;

  if not found then
    raise exception 'to_account_not_found';
  end if;

  v_source_amount := round(p_source_amount::numeric, 2);
  v_available_balance := public.get_account_available_balance(p_from_account_id, v_user_id);

  if v_source_amount > v_available_balance then
    raise exception 'insufficient_balance';
  end if;

  v_source_exchange_rate := public.currency_to_ars_rate(v_from_account.currency::text);
  v_destination_exchange_rate := public.currency_to_ars_rate(v_to_account.currency::text);
  v_base_amount := round(v_source_amount * v_source_exchange_rate, 2);
  v_destination_amount := round(v_base_amount / v_destination_exchange_rate, 2);

  insert into public.transfers (
    id,
    user_id,
    from_account_id,
    to_account_id,
    description,
    transaction_date,
    source_amount,
    source_currency,
    destination_amount,
    destination_currency,
    exchange_rate,
    base_amount
  )
  values (
    v_transfer_id,
    v_user_id,
    p_from_account_id,
    p_to_account_id,
    nullif(btrim(coalesce(p_description, '')), ''),
    p_transaction_date,
    v_source_amount,
    v_from_account.currency,
    v_destination_amount,
    v_to_account.currency,
    v_source_exchange_rate,
    v_base_amount
  );

  insert into public.transactions (
    user_id,
    account_id,
    category_id,
    transfer_id,
    type,
    amount,
    currency,
    exchange_rate,
    base_amount,
    description,
    transaction_date,
    is_transfer,
    category_name_snapshot
  )
  values
    (
      v_user_id,
      p_from_account_id,
      null,
      v_transfer_id,
      'expense',
      v_source_amount,
      v_from_account.currency,
      v_source_exchange_rate,
      v_base_amount,
      coalesce(nullif(btrim(p_description), ''), 'Transferencia enviada'),
      p_transaction_date,
      true,
      'Transferencia'
    ),
    (
      v_user_id,
      p_to_account_id,
      null,
      v_transfer_id,
      'income',
      v_destination_amount,
      v_to_account.currency,
      v_destination_exchange_rate,
      v_base_amount,
      coalesce(nullif(btrim(p_description), ''), 'Transferencia recibida'),
      p_transaction_date,
      true,
      'Transferencia'
    );

  perform public.record_audit_event(
    'transfer_created',
    v_user_id,
    'transfer',
    v_transfer_id,
    jsonb_build_object(
      'from_account_id', p_from_account_id,
      'to_account_id', p_to_account_id,
      'source_amount', v_source_amount,
      'destination_amount', v_destination_amount
    )
  );

  return v_transfer_id;
end;
$$;

revoke all on function public.create_transfer(uuid, uuid, numeric, date, text) from public;
grant execute on function public.create_transfer(uuid, uuid, numeric, date, text) to authenticated;
