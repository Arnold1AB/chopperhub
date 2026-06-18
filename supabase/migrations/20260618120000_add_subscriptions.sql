alter table public.profiles
  add column if not exists trial_started_at timestamptz,
  add column if not exists subscription_status text not null default 'trialing',
  add column if not exists subscription_plan text,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists paystack_customer_code text;

update public.profiles
set trial_started_at = coalesce(trial_started_at, created_at, now())
where trial_started_at is null;

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount_kobo integer not null,
  currency text not null default 'NGN',
  status text not null,
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.subscription_payments enable row level security;

create policy "Users can read their own subscription payments"
on public.subscription_payments
for select
using (auth.uid() = user_id);

create index if not exists subscription_payments_user_id_idx
on public.subscription_payments(user_id);

create index if not exists subscription_payments_reference_idx
on public.subscription_payments(reference);
