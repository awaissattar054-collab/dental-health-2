-- ==========================================================
-- REPAIR AUTH TRIGGER & BACKFILL EXISTING USERS
-- ==========================================================

-- 1. Upgrade trigger to guarantee clinic creation even with empty metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_clinic_id uuid;
  final_clinic_name text;
begin
  -- Robust handling of null or missing raw_user_meta_data
  if new.raw_user_meta_data is not null then
    final_clinic_name := coalesce(nullif(new.raw_user_meta_data->>'clinic_name', ''), 'Bright Smiles Dental Clinic');
  else
    final_clinic_name := 'Bright Smiles Dental Clinic';
  end if;
  
  -- Create the clinic (leave owner_id null for now because of FK constraint)
  insert into public.clinics (name, owner_id, currency, market_mode)
  values (final_clinic_name, null, 'PKR', 'pakistan')
  returning id into new_clinic_id;

  -- Create the profile referencing the new clinic
  insert into public.profiles (id, email, full_name, clinic_name, clinic_id, role)
  values (
    new.id,
    new.email,
    coalesce(
      case 
        when new.raw_user_meta_data is not null then nullif(new.raw_user_meta_data->>'full_name', '')
        else null
      end, 
      'Dr. Administrator'
    ),
    final_clinic_name,
    new_clinic_id,
    coalesce(
      case 
        when new.raw_user_meta_data is not null then nullif(new.raw_user_meta_data->>'role', '')
        else null
      end, 
      'dentist'
    )
  );

  -- Now update the clinic's owner_id
  update public.clinics set owner_id = new.id where id = new_clinic_id;

  return new;
end;
$$;

-- Re-assign the trigger function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. Backfill existing users who registered when the trigger was missing/faulty
do $$
declare
  user_rec record;
  new_clinic_id uuid;
  final_clinic_name text;
  final_full_name text;
  final_role text;
begin
  for user_rec in select * from auth.users loop
    -- Check if profile already exists for the user
    if not exists (select 1 from public.profiles where id = user_rec.id) then
      
      if user_rec.raw_user_meta_data is not null then
        final_clinic_name := coalesce(nullif(user_rec.raw_user_meta_data->>'clinic_name', ''), 'Bright Smiles Dental Clinic');
        final_full_name := coalesce(nullif(user_rec.raw_user_meta_data->>'full_name', ''), 'Dr. Administrator');
        final_role := coalesce(nullif(user_rec.raw_user_meta_data->>'role', ''), 'dentist');
      else
        final_clinic_name := 'Bright Smiles Dental Clinic';
        final_full_name := 'Dr. Administrator';
        final_role := 'dentist';
      end if;

      -- Check if they already own a clinic in the database
      select id into new_clinic_id from public.clinics where owner_id = user_rec.id limit 1;
      
      if new_clinic_id is null then
        -- Insert a new default clinic for this user
        insert into public.clinics (name, owner_id, currency, market_mode)
        values (final_clinic_name, null, 'PKR', 'pakistan')
        returning id into new_clinic_id;
      end if;

      -- Insert the profile referencing the clinic
      insert into public.profiles (id, email, full_name, clinic_name, clinic_id, role)
      values (
        user_rec.id,
        user_rec.email,
        final_full_name,
        final_clinic_name,
        new_clinic_id,
        final_role
      );

      -- Update the clinic to set owner_id correctly
      update public.clinics set owner_id = user_rec.id where id = new_clinic_id;

    else
      -- Profile already exists. Let's make sure it is linked to a valid clinic
      if (select clinic_id from public.profiles where id = user_rec.id) is null then
        
        if user_rec.raw_user_meta_data is not null then
          final_clinic_name := coalesce(nullif(user_rec.raw_user_meta_data->>'clinic_name', ''), 'Bright Smiles Dental Clinic');
        else
          final_clinic_name := 'Bright Smiles Dental Clinic';
        end if;
        
        -- Check if they have a clinic
        select id into new_clinic_id from public.clinics where owner_id = user_rec.id limit 1;
        
        if new_clinic_id is null then
          insert into public.clinics (name, owner_id, currency, market_mode)
          values (final_clinic_name, null, 'PKR', 'pakistan')
          returning id into new_clinic_id;
        end if;

        -- Update profile with clinic link
        update public.profiles 
        set clinic_id = new_clinic_id, clinic_name = final_clinic_name 
        where id = user_rec.id;

        -- Update ownership
        update public.clinics set owner_id = user_rec.id where id = new_clinic_id;
        
      end if;
    end if;
  end loop;
end;
$$;
