begin;

do $$
declare
  v_user_id uuid := '11111111-1111-1111-1111-111111111111';
  v_category_count integer;
  v_account_count integer;
begin
  insert into public.profiles (
    id,
    email,
    base_currency,
    timezone
  )
  values (
    v_user_id,
    'smoke-tests@example.com',
    'ARS',
    'America/Argentina/Buenos_Aires'
  )
  on conflict (id) do nothing;

  perform public.seed_user_defaults(v_user_id, 'ARS');
  perform public.seed_user_defaults(v_user_id, 'ARS');

  select count(*)
  into v_category_count
  from public.categories
  where user_id = v_user_id
    and (
      (type = 'expense' and lower(name) = lower('General'))
      or (type = 'income' and lower(name) = lower('Sueldo'))
    );

  if v_category_count <> 2 then
    raise exception 'seed_user_defaults should create exactly 2 default categories, got %', v_category_count;
  end if;

  select count(*)
  into v_account_count
  from public.accounts
  where user_id = v_user_id
    and lower(name) = lower('Cuenta principal');

  if v_account_count <> 1 then
    raise exception 'seed_user_defaults should create exactly 1 default account, got %', v_account_count;
  end if;

  if public.currency_to_ars_rate('USD') <> 1100 then
    raise exception 'currency_to_ars_rate USD mismatch';
  end if;

  if public.currency_to_ars_rate('EUR') <> 1250 then
    raise exception 'currency_to_ars_rate EUR mismatch';
  end if;
end
$$;

rollback;
