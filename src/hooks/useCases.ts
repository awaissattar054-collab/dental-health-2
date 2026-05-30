import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { Case } from '../types';
import { toast } from 'react-hot-toast';
import { isValidUUID } from '../lib/utils';

export function useCases(clinicId?: string) {
  return useQuery({
    queryKey: ['cases', clinicId],
    queryFn: async () => {
      if (!clinicId || !isValidUUID(clinicId)) return [];
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*, patient:patients(full_name)')
          .eq('clinic_id', clinicId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Case[];
      } catch (err: any) {
        console.warn('Supabase query cases failed, loading local dataset', err.message);
        // Include patient names from local dataset
        const casesList = localStore.getCases().filter(c => c.clinic_id === clinicId);
        const patientsList = localStore.getPatients();
        return casesList.map(c => {
          const pat = patientsList.find(p => p.id === c.patient_id);
          return {
            ...c,
            patient: pat ? { full_name: pat.full_name } : { full_name: 'Unknown Patient' }
          };
        }) as any[];
      }
    },
    enabled: !!clinicId && isValidUUID(clinicId),
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<Case, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .insert([item])
          .select()
          .single();

        if (error) throw error;
        toast.success('Clinical case registered!');
        return data as Case;
      } catch (err: any) {
        console.warn('DB action failed, writing case to Local DB', err.message);
        const fbCase: Case = {
          ...item,
          id: `case-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        localStore.saveCase(fbCase);
        toast.success('Clinical case saved locally!');
        return fbCase;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Case) => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .update(item)
          .eq('id', item.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Case updated!');
        return data as Case;
      } catch (err: any) {
        console.warn('Failed to update case on Cloud DB, using Local DB', err.message);
        localStore.saveCase(item);
        toast.success('Case saved locally!');
        return item;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
