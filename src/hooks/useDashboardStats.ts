import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { isValidUUID } from '../lib/utils';

export function useDashboardStats(clinicId?: string) {
  return useQuery({
    queryKey: ['dashboard-stats', clinicId],
    queryFn: async () => {
      if (!clinicId || !isValidUUID(clinicId)) {
        return {
          totalPatients: 0,
          activeCases: 0,
          revenueThisMonth: 0,
          pendingAmount: 0,
          upcomingAppointments: 0,
        };
      }

      try {
        // 1. Total Patients Count
        const { count: patientCount, error: pErr } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId);

        if (pErr) throw pErr;

        // 2. In Progress/Active Treatment Cases
        const { count: caseCount, error: cErr } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId)
          .in('status', ['in_progress', 'planning', 'healing', 'awaiting_patient']);

        if (cErr) throw cErr;

        // 3. Upcoming Appointments Count
        const { count: apptCount, error: aErr } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId)
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString());

        if (aErr) throw aErr;

        // 4. Financial Statistics
        const { data: invoices, error: invErr } = await supabase
          .from('invoices')
          .select('total_amount, paid_amount')
          .eq('clinic_id', clinicId);

        if (invErr) throw invErr;

        let totalInvoiced = 0;
        let totalCollected = 0;

        if (invoices) {
          invoices.forEach(inv => {
            totalInvoiced += Number(inv.total_amount) || 0;
            totalCollected += Number(inv.paid_amount) || 0;
          });
        }

        return {
          totalPatients: patientCount || 0,
          activeCases: caseCount || 0,
          revenueThisMonth: totalCollected,
          pendingAmount: Math.max(0, totalInvoiced - totalCollected),
          upcomingAppointments: apptCount || 0,
        };
      } catch (err: any) {
        console.warn('Dashboard stats loader failed. Utilizing local storage calculations.', err.message);

        // Fallback calculations using local storage
        const localPatients = localStore.getPatients().filter(p => p.clinic_id === clinicId);
        const localCases = localStore.getCases().filter(c => c.clinic_id === clinicId);
        const localAppts = localStore.getAppointments().filter(a => a.clinic_id === clinicId);
        const localInvoices = localStore.getInvoices().filter(i => i.clinic_id === clinicId);

        // Active cases filter
        const activeCasesCount = localCases.filter(c => ['in_progress', 'planning', 'healing', 'awaiting_patient'].includes(c.status)).length;
        
        // Upcoming appointments filter
        const upcomingApptsCount = localAppts.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at).getTime() >= Date.now()).length;

        // Financial totals
        let totalVal = 0;
        let totalPaid = 0;
        localInvoices.forEach(inv => {
          totalVal += Number(inv.total_amount) || 0;
          totalPaid += Number(inv.paid_amount) || 0;
        });

        return {
          totalPatients: localPatients.length,
          activeCases: activeCasesCount,
          revenueThisMonth: totalPaid,
          pendingAmount: Math.max(0, totalVal - totalPaid),
          upcomingAppointments: upcomingApptsCount,
        };
      }
    },
    enabled: !!clinicId && isValidUUID(clinicId),
  });
}
