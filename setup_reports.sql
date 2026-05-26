-- Run this in Supabase SQL Editor to enable the reporting system

create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  problem_id uuid references problems(id) on delete cascade,
  reason text not null,
  details text,
  status text default 'pending',
  reported_at timestamp with time zone default now()
);

alter table reports enable row level security;

create policy "Anyone can submit report" on reports
  for insert with check (true);

create policy "Only admin can read reports" on reports
  for select using (false);

-- Add moderation_status to problems table
alter table problems add column if not exists moderation_status text default 'approved';
alter table problems add column if not exists report_count integer default 0;

-- Grant access
grant select, insert on public.reports to anon, authenticated, service_role;
grant select, update on public.problems to anon, authenticated, service_role;
