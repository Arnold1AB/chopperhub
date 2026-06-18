alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists profession text,
  add column if not exists food_preference text,
  add column if not exists trial_started_at timestamptz,
  add column if not exists subscription_status text not null default 'trialing',
  add column if not exists subscription_plan text,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists paystack_customer_code text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    trial_started_at,
    subscription_status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    now(),
    'trialing'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    trial_started_at = coalesce(public.profiles.trial_started_at, excluded.trial_started_at),
    subscription_status = coalesce(public.profiles.subscription_status, excluded.subscription_status);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
