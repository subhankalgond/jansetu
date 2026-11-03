-- JanSetu AI persistence model. Apply with Supabase migrations in production.
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_language text not null default 'English' check (preferred_language in ('English', 'हिन्दी', 'ಕನ್ನಡ')),
  state text,
  occupation text,
  profile_completion smallint not null default 0 check (profile_completion between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schemes (
  id uuid primary key default uuid_generate_v4(), name text not null, department text not null,
  level text not null check (level in ('Central', 'State')), state text, category text not null,
  description text not null, benefit text not null, eligibility jsonb not null default '[]',
  documents jsonb not null default '[]', procedure jsonb not null default '[]',
  official_link text not null, deadline text, verified_at date, archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.government_services (
  id uuid primary key default uuid_generate_v4(), name text not null, department text not null,
  category text not null, description text not null, documents jsonb not null default '[]',
  steps jsonb not null default '[]', official_link text not null, offline_process text,
  fee text, processing_time text, verified_at date, archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.eligibility_profiles (
  id uuid primary key default uuid_generate_v4(), user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.saved_schemes (
  user_id uuid not null references auth.users(id) on delete cascade, scheme_id uuid not null references public.schemes(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, scheme_id)
);
create table if not exists public.application_tracking (
  id uuid primary key default uuid_generate_v4(), user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid references public.government_services(id) on delete set null, service_name text not null,
  reference_number text not null, application_date date, tracking_link text, status text not null default 'Draft'
    check (status in ('Draft','Submitted','Under Review','Action Required','Approved','Rejected','Completed')),
  notes text, reminder_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.document_checklists (
  id uuid primary key default uuid_generate_v4(), user_id uuid not null references auth.users(id) on delete cascade,
  scheme_id uuid references public.schemes(id) on delete cascade, service_id uuid references public.government_services(id) on delete cascade,
  items jsonb not null default '[]', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (scheme_id is not null or service_id is not null)
);
create table if not exists public.user_notifications (
  id uuid primary key default uuid_generate_v4(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.ai_conversations (
  id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users(id) on delete set null,
  language text not null default 'English', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.ai_messages (
  id uuid primary key default uuid_generate_v4(), conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')), content text not null, sources jsonb not null default '[]', created_at timestamptz not null default now()
);
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade, role text not null default 'editor' check (role in ('editor','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.content_verification_logs (
  id uuid primary key default uuid_generate_v4(), admin_id uuid not null references auth.users(id) on delete restrict,
  content_type text not null check (content_type in ('scheme','service')), content_id uuid not null,
  action text not null, notes text, created_at timestamptz not null default now()
);

create index if not exists schemes_category_idx on public.schemes(category);
create index if not exists schemes_state_idx on public.schemes(state);
create index if not exists services_category_idx on public.government_services(category);
create index if not exists tracking_user_idx on public.application_tracking(user_id, updated_at desc);
create index if not exists ai_messages_conversation_idx on public.ai_messages(conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.schemes enable row level security;
alter table public.government_services enable row level security;
alter table public.eligibility_profiles enable row level security;
alter table public.saved_schemes enable row level security;
alter table public.application_tracking enable row level security;
alter table public.document_checklists enable row level security;
alter table public.user_notifications enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.admin_roles enable row level security;
alter table public.content_verification_logs enable row level security;

create policy "public can read active schemes" on public.schemes for select using (archived_at is null);
create policy "public can read active services" on public.government_services for select using (archived_at is null);
create policy "users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "users manage own eligibility" on public.eligibility_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own saved schemes" on public.saved_schemes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own applications" on public.application_tracking for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own checklists" on public.document_checklists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own notifications" on public.user_notifications for select using (auth.uid() = user_id);
create policy "users manage own conversations" on public.ai_conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own messages" on public.ai_messages for select using (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "admins manage schemes" on public.schemes for all using (exists (select 1 from public.admin_roles a where a.user_id = auth.uid()));
create policy "admins manage services" on public.government_services for all using (exists (select 1 from public.admin_roles a where a.user_id = auth.uid()));
create policy "admins manage verification logs" on public.content_verification_logs for all using (exists (select 1 from public.admin_roles a where a.user_id = auth.uid()));
