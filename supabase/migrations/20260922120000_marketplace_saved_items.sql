-- Saved Marketplace items (per-user bookmarks).
--
-- LOCAL MIGRATION ONLY - review and apply manually (Supabase SQL editor or
-- `supabase db push` against the intended project). Not applied remotely.
--
-- item_id is stored as text on purpose: saved items are addressed by
-- (item_source, item_id) so the same table can hold listings today and other
-- Marketplace item kinds later without assuming the referenced table's
-- primary-key type. There is therefore no foreign key; the app ignores saved
-- rows whose item no longer exists (e.g. a deleted or inactive listing).

create table if not exists public.marketplace_saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  item_source text not null default 'listing'
    check (item_source in ('listing')),
  item_id text not null check (length(item_id) between 1 and 200),
  created_at timestamptz not null default now(),
  constraint marketplace_saved_items_user_item_key
    unique (user_id, item_source, item_id)
);

-- The unique constraint's index covers lookups by user_id (leading column).
-- This index supports cleanup/lookups by item across users.
create index if not exists marketplace_saved_items_item_idx
  on public.marketplace_saved_items (item_source, item_id);

alter table public.marketplace_saved_items enable row level security;

drop policy if exists "Users can view their saved items"
  on public.marketplace_saved_items;
create policy "Users can view their saved items"
  on public.marketplace_saved_items
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can save items"
  on public.marketplace_saved_items;
create policy "Users can save items"
  on public.marketplace_saved_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their saved items"
  on public.marketplace_saved_items;
create policy "Users can remove their saved items"
  on public.marketplace_saved_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- No UPDATE policy: rows are immutable (save = insert, unsave = delete).

grant select, insert, delete on public.marketplace_saved_items to authenticated;
