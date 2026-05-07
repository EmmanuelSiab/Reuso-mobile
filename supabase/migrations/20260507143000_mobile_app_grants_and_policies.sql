-- Mobile app API access and RLS policies.
-- Fixes "permission denied for table profiles" during Expo onboarding.

grant usage on schema public to anon, authenticated;

grant select (id, account_type, display_name, business_name, business_category, is_verified)
  on table public.profiles to anon, authenticated;

grant insert (id, account_type, display_name, business_name, business_category)
  on table public.profiles to authenticated;

grant update (account_type, display_name, business_name, business_category)
  on table public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by app users" on public.profiles;
create policy "profiles are readable by app users"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

grant select on table public.listings to anon, authenticated;
grant insert, update, delete on table public.listings to authenticated;

alter table public.listings enable row level security;

drop policy if exists "listings are publicly readable" on public.listings;
create policy "listings are publicly readable"
on public.listings
for select
to anon, authenticated
using (true);

drop policy if exists "users can insert own listings" on public.listings;
create policy "users can insert own listings"
on public.listings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own listings" on public.listings;
create policy "users can update own listings"
on public.listings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own listings" on public.listings;
create policy "users can delete own listings"
on public.listings
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, delete on table public.favorites to authenticated;
alter table public.favorites enable row level security;

drop policy if exists "users manage own favorites" on public.favorites;
create policy "users manage own favorites"
on public.favorites
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert on table public.conversations to authenticated;
alter table public.conversations enable row level security;

drop policy if exists "participants read conversations" on public.conversations;
create policy "participants read conversations"
on public.conversations
for select
to authenticated
using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "buyers can create conversations" on public.conversations;
create policy "buyers can create conversations"
on public.conversations
for insert
to authenticated
with check (auth.uid() = buyer_id);

grant select, insert on table public.messages to authenticated;
alter table public.messages enable row level security;

drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  )
);

drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages"
on public.messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  )
);
