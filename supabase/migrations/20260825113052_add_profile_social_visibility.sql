alter table public.profiles add column if not exists show_instagram boolean not null default false;
alter table public.profiles add column if not exists show_facebook boolean not null default false;
alter table public.profiles add column if not exists show_tiktok boolean not null default false;
alter table public.profiles add column if not exists show_whatsapp boolean not null default false;

revoke update on public.profiles from authenticated;
grant update (
  full_name, phone, public_profile, bio, birth_date, gender,
  instagram, facebook, tiktok, whatsapp,
  show_instagram, show_facebook, show_tiktok, show_whatsapp
) on public.profiles to authenticated;
