create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_transfers_updated_at on public.transfers;
create trigger set_transfers_updated_at
before update on public.transfers
for each row execute function public.set_updated_at();

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

drop trigger if exists set_budgets_updated_at on public.budgets;
create trigger set_budgets_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

drop trigger if exists set_saving_goals_updated_at on public.saving_goals;
create trigger set_saving_goals_updated_at
before update on public.saving_goals
for each row execute function public.set_updated_at();

alter table public.accounts
  drop constraint if exists accounts_name_not_blank,
  alter column name set not null;

alter table public.categories
  drop constraint if exists categories_name_not_blank,
  alter column name set not null;

alter table public.transactions
  drop constraint if exists transactions_amount_positive,
  drop constraint if exists transactions_base_amount_positive,
  drop constraint if exists transactions_exchange_rate_positive,
  drop constraint if exists transactions_description_not_blank,
  alter column description set not null;

alter table public.transfers
  drop constraint if exists transfers_source_amount_positive,
  drop constraint if exists transfers_destination_amount_positive,
  drop constraint if exists transfers_exchange_rate_positive,
  drop constraint if exists transfers_base_amount_positive,
  drop constraint if exists transfers_accounts_distinct;

alter table public.budgets
  drop constraint if exists budgets_amount_positive;

alter table public.saving_goals
  drop constraint if exists saving_goals_target_amount_positive,
  drop constraint if exists saving_goals_name_not_blank;

update public.accounts
set name = 'Cuenta sin nombre'
where btrim(coalesce(name, '')) = '';

update public.categories
set name = 'Categoría sin nombre'
where btrim(coalesce(name, '')) = '';

update public.transactions
set description = case
  when is_transfer and type = 'expense' then 'Transferencia enviada'
  when is_transfer and type = 'income' then 'Transferencia recibida'
  else 'Movimiento sin descripción'
end
where btrim(coalesce(description, '')) = '';

update public.saving_goals
set name = 'Meta sin nombre'
where btrim(coalesce(name, '')) = '';

alter table public.accounts
  add constraint accounts_name_not_blank check (btrim(name) <> '');

alter table public.categories
  add constraint categories_name_not_blank check (btrim(name) <> '');

alter table public.transactions
  add constraint transactions_amount_positive check (amount::numeric > 0),
  add constraint transactions_base_amount_positive check (base_amount::numeric > 0),
  add constraint transactions_exchange_rate_positive check (exchange_rate::numeric > 0),
  add constraint transactions_description_not_blank check (btrim(description) <> '');

alter table public.transfers
  add constraint transfers_source_amount_positive check (source_amount::numeric > 0),
  add constraint transfers_destination_amount_positive check (destination_amount::numeric > 0),
  add constraint transfers_exchange_rate_positive check (exchange_rate::numeric > 0),
  add constraint transfers_base_amount_positive check (base_amount::numeric > 0),
  add constraint transfers_accounts_distinct check (from_account_id <> to_account_id);

alter table public.budgets
  add constraint budgets_amount_positive check (amount::numeric > 0);

alter table public.saving_goals
  add constraint saving_goals_target_amount_positive check (target_amount::numeric > 0),
  add constraint saving_goals_name_not_blank check (btrim(name) <> '');

create unique index if not exists budgets_user_category_month_unique
on public.budgets (user_id, category_id, month_start);

create unique index if not exists accounts_user_name_unique
on public.accounts (user_id, lower(name));

create unique index if not exists categories_user_type_name_unique
on public.categories (user_id, type, lower(name));

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id)
  references auth.users (id)
  on delete cascade;

create or replace function public.cleanup_user_data()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.budgets
  where user_id = old.id;

  delete from public.saving_goals
  where user_id = old.id;

  delete from public.transactions
  where user_id = old.id;

  delete from public.transfers
  where user_id = old.id;

  delete from public.categories
  where user_id = old.id;

  delete from public.accounts
  where user_id = old.id;

  return old;
end;
$$;

drop trigger if exists before_profile_deleted_cleanup on public.profiles;
create trigger before_profile_deleted_cleanup
before delete on public.profiles
for each row execute function public.cleanup_user_data();

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
  v_exchange_rate numeric(12,6);
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

  select coalesce(sum(
    case
      when type = 'income' then amount::numeric
      when type = 'expense' then -amount::numeric
      else 0
    end
  ), 0)
  into v_available_balance
  from public.transactions
  where account_id = p_from_account_id
    and user_id = v_user_id;

  if p_source_amount > v_available_balance then
    raise exception 'insufficient_balance';
  end if;

  v_source_amount := round(p_source_amount::numeric, 2);
  v_exchange_rate := case
    when v_from_account.currency = 'ARS' then 1
    when v_from_account.currency = 'USD' then 1200
    when v_from_account.currency = 'EUR' then 1300
    else 1
  end;
  v_base_amount := round(v_source_amount * v_exchange_rate, 2);
  v_destination_amount := round(
    case
      when v_from_account.currency = v_to_account.currency then v_source_amount
      when v_from_account.currency = 'ARS' and v_to_account.currency = 'USD' then v_source_amount / 1200
      when v_from_account.currency = 'ARS' and v_to_account.currency = 'EUR' then v_source_amount / 1300
      when v_from_account.currency = 'USD' and v_to_account.currency = 'ARS' then v_source_amount * 1200
      when v_from_account.currency = 'USD' and v_to_account.currency = 'EUR' then (v_source_amount * 1200) / 1300
      when v_from_account.currency = 'EUR' and v_to_account.currency = 'ARS' then v_source_amount * 1300
      when v_from_account.currency = 'EUR' and v_to_account.currency = 'USD' then (v_source_amount * 1300) / 1200
      else v_source_amount
    end,
    2
  );

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
    v_exchange_rate,
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
      v_exchange_rate,
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
      case
        when v_to_account.currency = 'ARS' then 1
        when v_to_account.currency = 'USD' then 1200
        when v_to_account.currency = 'EUR' then 1300
        else 1
      end,
      round(
        case
          when v_to_account.currency = 'ARS' then v_destination_amount
          when v_to_account.currency = 'USD' then v_destination_amount * 1200
          when v_to_account.currency = 'EUR' then v_destination_amount * 1300
          else v_destination_amount
        end,
        2
      ),
      coalesce(nullif(btrim(p_description), ''), 'Transferencia recibida'),
      p_transaction_date,
      true,
      'Transferencia'
    );

  return v_transfer_id;
end;
$$;

revoke all on function public.create_transfer(uuid, uuid, numeric, date, text) from public;
grant execute on function public.create_transfer(uuid, uuid, numeric, date, text) to authenticated;
