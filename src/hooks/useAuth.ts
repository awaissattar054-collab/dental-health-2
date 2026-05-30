import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Clinic } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize or fetch details for clinic
  const fetchClinicAndProfile = async (sessionUser: any) => {
    try {
      // 1. Fetch profile
      let { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (profErr || !prof) {
        // Create a default profile if it doesn't exist
        const defaultProfile: Profile = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name: sessionUser.user_metadata?.full_name || 'Dr. Administrator',
          role: 'admin',
        };

        const { data: newProf, error: insertProfErr } = await supabase
          .from('profiles')
          .insert([defaultProfile])
          .select()
          .single();

        if (!insertProfErr && newProf) {
          prof = newProf;
        } else {
          prof = defaultProfile;
        }
      }

      setProfile(prof);

      // 2. Fetch or create association with clinic
      if (prof?.clinic_id) {
        const { data: cl, error: clErr } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', prof.clinic_id)
          .single();

        if (!clErr && cl) {
          setClinic(cl);
        }
      } else {
        // Try to find if user owns any clinic
        const { data: clList } = await supabase
          .from('clinics')
          .select('*')
          .eq('owner_id', sessionUser.id);

        if (clList && clList.length > 0) {
          setClinic(clList[0]);
          // Link profile to clinic
          await supabase
            .from('profiles')
            .update({ clinic_id: clList[0].id, clinic_name: clList[0].name })
            .eq('id', sessionUser.id);
        } else {
          // Create default clinic
          const newClinic: Partial<Clinic> = {
            name: 'Bright Smiles Dental Clinic',
            owner_id: sessionUser.id,
            currency: 'PKR',
            market_mode: 'pakistan',
          };

          const { data: createdCl, error: createClErr } = await supabase
            .from('clinics')
            .insert([newClinic])
            .select()
            .single();

          if (!createClErr && createdCl) {
            setClinic(createdCl);
            // Link profile
            const updatedProf = { ...prof, clinic_id: createdCl.id, clinic_name: createdCl.name };
            await supabase
              .from('profiles')
              .update({ clinic_id: createdCl.id, clinic_name: createdCl.name })
              .eq('id', sessionUser.id);
            setProfile(updatedProf);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching auth metadata:', err);
      // Clean exit on fetch/association failure
      setClinic(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check current session
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        setUser(session.user);
        fetchClinicAndProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
        fetchClinicAndProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setClinic(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await (supabase.auth as any).signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
    return data;
  };

  const signup = async (email: string, password: string, fullName: string, clinicName: string) => {
    setLoading(true);
    const { data, error } = await (supabase.auth as any).signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          clinic_name: clinicName,
        }
      }
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    return data;
  };

  const logout = async () => {
    setLoading(true);
    await (supabase.auth as any).signOut();
    setUser(null);
    setProfile(null);
    setClinic(null);
    setLoading(false);
  };

  const updateClinic = async (updates: Partial<Clinic>) => {
    if (!clinic?.id) return;
    const { data, error } = await supabase
      .from('clinics')
      .update(updates)
      .eq('id', clinic.id)
      .select()
      .single();

    if (error) throw error;
    setClinic(data);
    return data;
  };

  return {
    user,
    profile,
    clinic,
    loading,
    login,
    signup,
    logout,
    updateClinic,
  };
}
