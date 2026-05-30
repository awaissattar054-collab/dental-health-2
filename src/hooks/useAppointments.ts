import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { Appointment } from '../types';
import { toast } from 'react-hot-toast';
import { isValidUUID } from '../lib/utils';

export function useAppointments(clinicId?: string) {
  return useQuery({
    queryKey: ['appointments', clinicId],
    queryFn: async () => {
      if (!clinicId || !isValidUUID(clinicId)) return [];
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*, patient:patients(full_name, phone)')
          .eq('clinic_id', clinicId)
          .order('scheduled_at', { ascending: true });

        if (error) throw error;
        return data as Appointment[];
      } catch (err: any) {
        console.warn('Supabase query appointments failed, loading local dataset', err.message);
        const apptsList = localStore.getAppointments().filter(a => a.clinic_id === clinicId);
        const patientsList = localStore.getPatients();
        return apptsList.map(a => {
          const pat = patientsList.find(p => p.id === a.patient_id);
          return {
            ...a,
            patient: pat ? { full_name: pat.full_name, phone: pat.phone } : { full_name: 'Unknown Patient', phone: '' }
          };
        }) as any[];
      }
    },
    enabled: !!clinicId && isValidUUID(clinicId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<Appointment, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([item])
          .select()
          .single();

        if (error) throw error;
        toast.success('Appointment scheduled in Cloud!');
        return data as Appointment;
      } catch (err: any) {
        console.warn('Failed scheduling in Supabase, using Local DB', err.message);
        const fbAppt: Appointment = {
          ...item,
          id: `appt-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        localStore.saveAppointment(fbAppt);
        toast.success('Appointment saved locally!');
        return fbAppt;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Appointment) => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .update(item)
          .eq('id', item.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Appointment status modified!');
        return data as Appointment;
      } catch (err: any) {
        console.warn('Failed updating appointment on cloud, updating local cache', err.message);
        localStore.saveAppointment(item);
        toast.success('Appointment adjusted locally!');
        return item;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
