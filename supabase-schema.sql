-- =============================================
-- شغّل الكود ده في Supabase → SQL Editor
-- =============================================

-- جدول المستخدمين (مديرين + موظفين)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'employee')),
  phone text,
  position text,
  department text,
  start_date date,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- جدول أنواع الوثائق
create table if not exists document_types (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_de text not null,
  has_expiry boolean default true,
  is_required boolean default true,
  description text,
  created_at timestamptz default now()
);

-- جدول وثائق الموظفين
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  document_type_id uuid references document_types(id),
  file_url text,
  file_name text,
  file_size integer,
  expiry_date date,
  issue_date date,
  status text default 'pending' check (status in ('pending', 'active', 'expiring_soon', 'expired', 'rejected')),
  notes text,
  uploaded_at timestamptz default now(),
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  updated_at timestamptz default now()
);

-- جدول سجل الإشعارات
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  type text not null check (type in ('expiry_30days', 'expiry_today', 'expiry_overdue', 'doc_approved', 'doc_rejected', 'doc_uploaded')),
  sent_at timestamptz default now(),
  email_sent boolean default false
);

-- أنواع الوثائق الافتراضية
insert into document_types (name_ar, name_de, has_expiry, is_required) values
  ('بطاقة الهوية', 'Personalausweis', true, true),
  ('الرقم الضريبي', 'Steuer-ID', false, true),
  ('رقم التأمين الاجتماعي', 'Sozialversicherungsnummer', false, true),
  ('رخصة القيادة', 'Führerschein', true, false),
  ('بطاقة التأمين الصحي', 'Versicherungskarte', true, true),
  ('بيانات الحساب البنكي', 'Bankkarte / IBAN', true, true),
  ('الإقامة', 'Aufenthaltstitel', true, false),
  ('عقد العمل', 'Arbeitsvertrag', false, true),
  ('شهادة العمل السابقة', 'Arbeitszeugnis', false, false),
  ('شهادة التطعيم', 'Impfnachweis', true, false);

-- Storage bucket للملفات
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

-- RLS Policies
alter table users enable row level security;
alter table documents enable row level security;
alter table notifications enable row level security;

-- السماح للمستخدم برؤية بياناته فقط (أو كل البيانات لو admin)
create policy "users_select" on users for select using (true);
create policy "docs_select" on documents for select using (true);
create policy "notifs_select" on notifications for select using (true);
create policy "docs_insert" on documents for insert with check (true);
create policy "docs_update" on documents for update using (true);

-- Storage policy
create policy "storage_select" on storage.objects for select using (bucket_id = 'documents');
create policy "storage_insert" on storage.objects for insert with check (bucket_id = 'documents');
create policy "storage_delete" on storage.objects for delete using (bucket_id = 'documents');

-- Function لتحديث updated_at تلقائياً
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();
create trigger documents_updated_at before update on documents
  for each row execute function update_updated_at();
