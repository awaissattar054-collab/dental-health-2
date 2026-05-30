import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { Invoice } from '../types';
import { toast } from 'react-hot-toast';
import { isValidUUID } from '../lib/utils';

export function useInvoices(clinicId?: string) {
  return useQuery({
    queryKey: ['invoices', clinicId],
    queryFn: async () => {
      if (!clinicId || !isValidUUID(clinicId)) return [];
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, patient:patients(full_name)')
          .eq('clinic_id', clinicId)
          .order('invoice_number', { ascending: false });

        if (error) throw error;
        return data as Invoice[];
      } catch (err: any) {
        console.warn('Supabase query invoices failed, loading local dataset', err.message);
        const invList = localStore.getInvoices().filter(i => i.clinic_id === clinicId);
        const patientsList = localStore.getPatients();
        return invList.map(invoice => {
          const pat = patientsList.find(p => p.id === invoice.patient_id);
          return {
            ...invoice,
            patient: pat ? { full_name: pat.full_name } : { full_name: 'Unknown Patient' }
          };
        }) as any[];
      }
    },
    enabled: !!clinicId && isValidUUID(clinicId),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<Invoice, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .insert([item])
          .select()
          .single();

        if (error) throw error;
        toast.success('Invoice issued onto cloud!');
        return data as Invoice;
      } catch (err: any) {
        console.warn('Failed issuing invoice, adding to Local DB', err.message);
        const fbInvoice: Invoice = {
          ...item,
          id: `inv-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        localStore.saveInvoice(fbInvoice);
        toast.success('Invoice issued locally!');
        return fbInvoice;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Invoice) => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .update(item)
          .eq('id', item.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Invoice synchronized!');
        return data as Invoice;
      } catch (err: any) {
        console.warn('Failed syncing invoice, saving locally', err.message);
        localStore.saveInvoice(item);
        toast.success('Invoice synchronized locally!');
        return item;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
