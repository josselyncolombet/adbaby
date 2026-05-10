-- Adbaby v1 — schéma initial
-- Tables : students, completions, attempts
-- RLS : un étudiant lit/écrit ses propres données ; admin lit tout

create extension if not exists pgcrypto;

-- Roster ouvert : tout compte Google s'inscrit, l'admin bloque après coup
create table students (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  full_name   text not null,
  is_admin    boolean not null default false,
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Une ligne quand un étudiant valide un exo
create table completions (
  student_id     uuid not null references students(id) on delete cascade,
  exercise_id    text not null,
  completed_at   timestamptz not null default now(),
  attempts_count int not null default 1,
  primary key (student_id, exercise_id)
);

-- Log des tentatives (utile pour debugger un élève bloqué)
create table attempts (
  id           bigserial primary key,
  student_id   uuid not null references students(id) on delete cascade,
  exercise_id  text not null,
  payload      jsonb not null,
  is_correct   boolean not null,
  created_at   timestamptz not null default now()
);
create index attempts_student_exo_idx on attempts (student_id, exercise_id, created_at);

-- Helpers
create or replace function current_student_id() returns uuid as $$
  select id from students where email = auth.email() limit 1;
$$ language sql stable security definer;

create or replace function current_is_admin() returns boolean as $$
  select coalesce(is_admin, false) from students where email = auth.email() limit 1;
$$ language sql stable security definer;

-- RLS
alter table students enable row level security;
alter table completions enable row level security;
alter table attempts enable row level security;

-- students : lecture de soi + admin lit tout
create policy "students_read_self" on students for select
  using (email = auth.email() or current_is_admin());

-- completions : lecture/écriture de soi + admin lit tout
create policy "completions_read_self" on completions for select
  using (student_id = current_student_id() or current_is_admin());
create policy "completions_insert_self" on completions for insert
  with check (student_id = current_student_id());
create policy "completions_update_self" on completions for update
  using (student_id = current_student_id());

-- attempts : lecture/écriture de soi + admin lit
create policy "attempts_read_self" on attempts for select
  using (student_id = current_student_id() or current_is_admin());
create policy "attempts_insert_self" on attempts for insert
  with check (student_id = current_student_id());
