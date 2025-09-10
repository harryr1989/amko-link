-- AMKO Supabase schema (jalankan di Supabase SQL editor)
create table if not exists public.kv (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);
alter table public.kv enable row level security;
create policy if not exists "kv anon read" on public.kv for select using (true);
create policy if not exists "kv anon upsert" on public.kv for insert with check (true);
create policy if not exists "kv anon update" on public.kv for update using (true);
