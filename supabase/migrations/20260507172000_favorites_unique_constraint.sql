delete from public.favorites a
using public.favorites b
where a.ctid < b.ctid
  and a.user_id = b.user_id
  and a.listing_id = b.listing_id;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'favorites_user_listing_unique'
      and conrelid = 'public.favorites'::regclass
  ) then
    alter table public.favorites
      add constraint favorites_user_listing_unique unique (user_id, listing_id);
  end if;
end $$;
