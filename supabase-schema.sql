create table if not exists public.archive_files (
  id text primary key,
  section_id text not null,
  name text not null,
  description text default '',
  size bigint not null,
  type text not null,
  date text not null,
  created_at bigint not null,
  storage_path text not null unique
);

alter table public.archive_files enable row level security;

create policy "Anyone can view archive files"
  on public.archive_files for select
  using (true);

create policy "Anyone can add archive files"
  on public.archive_files for insert
  with check (true);

create policy "Anyone can edit archive files"
  on public.archive_files for update
  using (true)
  with check (true);

create policy "Anyone can delete archive files"
  on public.archive_files for delete
  using (true);

insert into storage.buckets (id, name, public)
values ('archive-files', 'archive-files', true)
on conflict (id) do nothing;

create policy "Anyone can view archive uploads"
  on storage.objects for select
  using (bucket_id = 'archive-files');

create policy "Anyone can upload archive files"
  on storage.objects for insert
  with check (bucket_id = 'archive-files');

create policy "Anyone can update archive files"
  on storage.objects for update
  using (bucket_id = 'archive-files');

create policy "Anyone can delete archive files"
  on storage.objects for delete
  using (bucket_id = 'archive-files');

create table if not exists public.follow_up_forms (
  id text primary key,
  title text not null,
  date text not null,
  responsible text default '',
  status text not null default 'قيد المتابعة',
  notes text default '',
  created_at bigint not null
);

alter table public.follow_up_forms enable row level security;

create policy "Anyone can view follow up forms"
  on public.follow_up_forms for select
  using (true);

create policy "Anyone can add follow up forms"
  on public.follow_up_forms for insert
  with check (true);

create policy "Anyone can edit follow up forms"
  on public.follow_up_forms for update
  using (true)
  with check (true);

create policy "Anyone can delete follow up forms"
  on public.follow_up_forms for delete
  using (true);
