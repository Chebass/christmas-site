-- Navidad para dos: esquema inicial.
-- Ejecutar en Supabase > SQL Editor. Antes, en Authentication > Sign In / Providers,
-- desactivar "Allow new users to sign up" y crear las 2 cuentas a mano.

-- ───────── Perfiles ─────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  color text not null default '#c8434a',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "perfiles: ver" on public.profiles for select to authenticated using (true);
create policy "perfiles: editar el propio" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ───────── Listas de deseos (papelote tldraw) ─────────
create table public.wishlists (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb,
  updated_at timestamptz not null default now()
);

alter table public.wishlists enable row level security;
create policy "listas: ver" on public.wishlists for select to authenticated using (true);
create policy "listas: crear la propia" on public.wishlists for insert to authenticated
  with check (owner_id = auth.uid());
create policy "listas: editar la propia" on public.wishlists for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ───────── Cartas ─────────
create table public.letters (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default '',
  body text not null,
  stamp text not null default 'estrella',
  reply_to_id uuid references public.letters(id) on delete set null,
  deliver_at timestamptz not null default now(),
  opened_at timestamptz,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
create index on public.letters (recipient_id, deliver_at desc);
create index on public.letters (sender_id, created_at desc);

alter table public.letters enable row level security;

-- Remitente: ve todo lo suyo. Destinatario: solo lo ya entregado (el cuerpo nunca se filtra antes).
create policy "cartas: ver" on public.letters for select to authenticated
  using (sender_id = auth.uid() or (recipient_id = auth.uid() and deliver_at <= now()));
create policy "cartas: enviar" on public.letters for insert to authenticated
  with check (sender_id = auth.uid());
create policy "cartas: borrar programada propia" on public.letters for delete to authenticated
  using (sender_id = auth.uid() and deliver_at > now());

-- Marcar como abierta (solo el destinatario, solo si ya fue entregada).
create or replace function public.open_letter(letter_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.letters set opened_at = coalesce(opened_at, now())
  where id = letter_id and recipient_id = auth.uid() and deliver_at <= now();
$$;

-- Buzón del destinatario: incluye las cartas selladas SIN cuerpo ni asunto.
create or replace function public.my_inbox()
returns table (
  id uuid, sender_id uuid, subject text, body text, stamp text,
  reply_to_id uuid, deliver_at timestamptz, opened_at timestamptz, sealed boolean
)
language sql stable security definer set search_path = public as $$
  select l.id, l.sender_id,
         case when l.deliver_at <= now() then l.subject end,
         case when l.deliver_at <= now() then l.body end,
         l.stamp, l.reply_to_id, l.deliver_at, l.opened_at,
         l.deliver_at > now()
  from public.letters l
  where l.recipient_id = auth.uid()
  order by l.deliver_at desc;
$$;

-- Realtime para listas y cartas.
alter publication supabase_realtime add table public.wishlists, public.letters;

-- ───────── Storage ─────────
-- Buckets públicos de lectura (nombres de archivo con UUID); escritura solo en la carpeta propia.
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('wish-assets', 'wish-assets', true)
on conflict (id) do nothing;

create policy "storage: subir en carpeta propia" on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars','wish-assets') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "storage: actualizar en carpeta propia" on storage.objects for update to authenticated
  using (bucket_id in ('avatars','wish-assets') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "storage: borrar en carpeta propia" on storage.objects for delete to authenticated
  using (bucket_id in ('avatars','wish-assets') and (storage.foldername(name))[1] = auth.uid()::text);
