-- ==========================================================
-- 1. UTILS, ENUMS AND EXTENSIONS
-- ==========================================================
create extension if not exists "uuid-ossp";

-- ==========================================================
-- 2. CLINICS TABLE
-- ==========================================================
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid, -- Will be set/linked to public.profiles.id
  address text,
  city text,
  phone text,
  email text,
  whatsapp_number text,
  currency text default 'PKR',
  market_mode text check (market_mode in ('pakistan', 'international')) default 'pakistan',
  logo_url text,
  brand_color text default '#00BCD4',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================================
-- 3. PROFILES TABLE (Extends Supabase auth.users)
-- ==========================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  clinic_name text,
  clinic_id uuid references public.clinics(id),
  role text check (role in ('admin', 'dentist', 'receptionist', 'assistant')) default 'dentist',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Establish foreign key relationship back on clinics (owner_id references profiles)
alter table public.clinics add constraint fk_clinics_owner foreign key (owner_id) references public.profiles(id);

-- ==========================================================
-- 4. AUTO-CREATE PROFILE TRIGGER FOR NEW SIGNUPS
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_clinic_id uuid;
begin
  -- Optional: Create a clinic automatically if clinic_name metadata is provided
  if new.raw_user_meta_data->>'clinic_name' is not null then
    insert into public.clinics (name)
    values (new.raw_user_meta_data->>'clinic_name')
    returning id into new_clinic_id;
  end if;

  insert into public.profiles (id, email, full_name, clinic_name, clinic_id, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'clinic_name',
    new_clinic_id,
    coalesce(new.raw_user_meta_data->>'role', 'dentist')
  );

  -- If clinic was created, assign the owner ID
  if new_clinic_id is not null then
    update public.clinics set owner_id = new.id where id = new_clinic_id;
  end if;

  return new;
end;
$$;

-- Create the trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================================
-- 5. PATIENTS TABLE
-- ==========================================================
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) not null,
  full_name text not null,
  phone text,
  email text,
  cnic text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  address text,
  city text,
  emergency_contact text,
  blood_group text,
  allergies text[],
  medical_history text,
  insurance_provider text,
  sehat_sahulat_eligible boolean default false,
  status text check (status in ('new', 'active', 'returning', 'inactive')) default 'new',
  total_visits integer default 0,
  total_spent numeric default 0,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_patients_clinic on public.patients(clinic_id);
create index idx_patients_phone on public.patients(phone);

-- ==========================================================
-- 6. CASES TABLE (Multi-stage clinical treatment)
-- ==========================================================
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) not null,
  patient_id uuid references public.patients(id) not null,
  case_type text not null, -- 'single_implant', 'full_arch', 'veneers', 'rct_crown', 'full_mouth_rehab', etc.
  complexity text check (complexity in ('simple', 'moderate', 'complex')) default 'moderate',
  status text check (status in ('planning', 'in_progress', 'healing', 'awaiting_patient', 'completed', 'cancelled')) default 'planning',
  total_cost numeric,
  paid_amount numeric default 0,
  lead_dentist_id uuid references public.profiles(id),
  start_date date default current_date,
  estimated_completion_date date,
  actual_completion_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.case_stages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete cascade not null,
  stage_name text not null,
  stage_order integer not null,
  status text check (status in ('pending', 'scheduled', 'in_progress', 'completed', 'skipped')) default 'pending',
  scheduled_date date,
  completed_date date,
  notes text,
  cost numeric default 0,
  photos text[] default '{}',
  created_at timestamptz default now()
);

create index idx_cases_clinic on public.cases(clinic_id);
create index idx_cases_patient on public.cases(patient_id);
create index idx_stages_case on public.case_stages(case_id);

-- ==========================================================
-- 7. APPOINTMENTS TABLE
-- ==========================================================
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) not null,
  patient_id uuid references public.patients(id),
  case_id uuid references public.cases(id),
  dentist_id uuid references public.profiles(id),
  scheduled_at timestamptz not null,
  duration_minutes integer default 30,
  appointment_type text,
  status text check (status in ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) default 'scheduled',
  notes text,
  reminder_sent boolean default false,
  created_at timestamptz default now()
);

create index idx_appointments_clinic on public.appointments(clinic_id);
create index idx_appointments_date on public.appointments(scheduled_at);

-- ==========================================================
-- 8. INVOICES, ITEMS & PAYMENTS
-- ==========================================================
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) not null,
  patient_id uuid references public.patients(id) not null,
  case_id uuid references public.cases(id),
  invoice_number text unique not null,
  total_amount numeric not null,
  paid_amount numeric default 0,
  status text check (status in ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled')) default 'draft',
  due_date date,
  notes text,
  created_at timestamptz default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  treatment_name text not null,
  treatment_code text,
  quantity integer default 1,
  unit_price numeric not null,
  total_price numeric not null
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) not null,
  amount numeric not null,
  payment_method text,
  payment_date timestamptz default now(),
  reference_number text,
  notes text,
  recorded_by uuid references public.profiles(id)
);

-- ==========================================================
-- 9. AUDIT LOGS
-- ==========================================================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id),
  user_id uuid references public.profiles(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index idx_audit_clinic on public.audit_logs(clinic_id);
create index idx_audit_created on public.audit_logs(created_at desc);

-- ==========================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable security on all tables
alter table public.profiles enable row level security;
alter table public.clinics enable row level security;
alter table public.patients enable row level security;
alter table public.cases enable row level security;
alter table public.case_stages enable row level security;
alter table public.appointments enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

-- PROFILE POLICIES
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- CLINIC POLICIES
create policy "Users can read their clinic"
  on public.clinics for select
  using (
    id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

-- PATIENT POLICIES
create policy "Clinic members can view patients"
  on public.patients for select
  using (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

create policy "Clinic members can insert patients"
  on public.patients for insert
  with check (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

create policy "Clinic members can update patients"
  on public.patients for update
  using (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

create policy "Only admins can delete patients"
  on public.patients for delete
  using (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- CASES POLICIES
create policy "Clinic members can view cases"
  on public.cases for select
  using (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

create policy "Clinic members can manage cases"
  on public.cases for all
  using (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

-- CASE STAGES POLICIES
create policy "Clinic members can manage case stages"
  on public.case_stages for all
  using (
    case_id in (
      select id from public.cases 
      where clinic_id in (
        select clinic_id from public.profiles 
        where id = auth.uid()
      )
    )
  );

-- APPOINTMENTS POLICIES
create policy "Clinic members can manage appointments"
  on public.appointments for all
  using (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

-- INVOICES POLICIES
create policy "Clinic members can manage invoices"
  on public.invoices for all
  using (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

-- INVOICE ITEMS POLICIES
create policy "Clinic members can manage invoice items"
  on public.invoice_items for all
  using (
    invoice_id in (
      select id from public.invoices 
      where clinic_id in (
        select clinic_id from public.profiles 
        where id = auth.uid()
      )
    )
  );

-- PAYMENTS POLICIES
create policy "Clinic members can manage payments"
  on public.payments for all
  using (
    invoice_id in (
      select id from public.invoices 
      where clinic_id in (
        select clinic_id from public.profiles 
        where id = auth.uid()
      )
    )
  );

-- AUDIT LOGS POLICIES
create policy "Clinic members can view audit logs"
  on public.audit_logs for select
  using (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );

create policy "Clinic members can append audit logs"
  on public.audit_logs for insert
  with check (
    clinic_id in (
      select clinic_id from public.profiles 
      where id = auth.uid()
    )
  );
