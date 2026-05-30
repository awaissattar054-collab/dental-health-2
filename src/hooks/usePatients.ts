import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { Patient } from '../types';
import { toast } from 'react-hot-toast';
import { isValidUUID } from '../lib/utils';

export function usePatients(clinicId?: string) {
  return useQuery({
    queryKey: ['patients', clinicId],
    queryFn: async () => {
      if (!clinicId || !isValidUUID(clinicId)) return [];
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('clinic_id', clinicId)
          .order('full_name', { ascending: true });

        if (error) throw error;
        return data as Patient[];
      } catch (err: any) {
        console.warn('Supabase query patients failed, falling back to local dataset.', err.message);
        // Fallback to local storage
        return localStore.getPatients().filter(p => p.clinic_id === clinicId);
      }
    },
    enabled: !!clinicId && isValidUUID(clinicId),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Omit<Patient, 'id' | 'created_at'>) => {
      const newPatient: any = {
        ...patient,
        total_visits: Number(patient.total_visits) || 0,
        total_spent: Number(patient.total_spent) || 0,
      };

      try {
        const { data, error } = await supabase
          .from('patients')
          .insert([newPatient])
          .select()
          .single();

        if (error) throw error;
        toast.success('Patient added successfully onto Cloud DB!');
        return data as Patient;
      } catch (err: any) {
        console.warn('Failed creating patient in Supabase, saving to Local DB', err.message);
        const fbPatient: Patient = {
          ...patient,
          id: `pat-${Date.now()}`,
          created_at: new Date().toISOString(),
          total_visits: Number(patient.total_visits) || 0,
          total_spent: Number(patient.total_spent) || 0,
        };
        localStore.savePatient(fbPatient);
        toast.success('Patient created in Local Storage!');
        return fbPatient;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Patient) => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .update(patient)
          .eq('id', patient.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Patient details synchronized!');
        return data as Patient;
      } catch (err: any) {
        console.warn('Failed updating patient in Supabase, using Local DB', err.message);
        localStore.savePatient(patient);
        toast.success('Patient updated in Local Storage!');
        return patient;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Patient removed from cloud!');
      } catch (err: any) {
        console.warn('Failed deleting patient in Supabase, updating local store', err.message);
        localStore.deletePatient(id);
        toast.success('Patient deleted locally!');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
