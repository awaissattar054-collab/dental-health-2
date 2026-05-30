import { Patient, Case, Appointment, Invoice, InvoiceItem, Payment, Clinic } from '../types';

const FALLBACK_CLINIC_UUID = '00000000-0000-0000-0000-000000000000';

// Initial Mock Datasets
const initialPatients: Patient[] = [
  {
    id: 'pat-1',
    clinic_id: FALLBACK_CLINIC_UUID,
    full_name: 'Muhammad Ahmed',
    phone: '0300-1234567',
    email: 'ahmed.m@gmail.com',
    cnic: '35202-1234567-1',
    date_of_birth: '1988-05-14',
    gender: 'male',
    address: 'Gulberg III',
    city: 'Lahore',
    emergency_contact: '0321-7654321',
    blood_group: 'B+',
    allergies: 'Penicillin',
    medical_history: 'Diabetes Type 2',
    status: 'active',
    total_visits: 5,
    total_spent: 45000,
    notes: 'Patient requires local anesthesia caution due to diabetic profile.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'pat-2',
    clinic_id: FALLBACK_CLINIC_UUID,
    full_name: 'Ayesha Khan',
    phone: '0312-9876543',
    email: 'ayesha.k@outlook.com',
    cnic: '42201-9876543-2',
    date_of_birth: '1995-11-22',
    gender: 'female',
    address: 'DHA Phase 6',
    city: 'Karachi',
    emergency_contact: '0333-1112223',
    blood_group: 'O+',
    allergies: 'None',
    medical_history: 'None',
    status: 'active',
    total_visits: 2,
    total_spent: 120000,
    notes: 'Undergoing orthodontic case (clear aligners).',
    created_at: new Date().toISOString(),
  },
  {
    id: 'pat-3',
    clinic_id: FALLBACK_CLINIC_UUID,
    full_name: 'Zainab Fatima',
    phone: '0345-4455667',
    email: 'zainab.fatima@yahoo.com',
    cnic: '37405-1122334-4',
    date_of_birth: '1992-02-08',
    gender: 'female',
    address: 'Saddar',
    city: 'Rawalpindi',
    emergency_contact: '0300-9988776',
    blood_group: 'A-',
    allergies: 'Sulfa Drugs',
    medical_history: 'Asthma',
    status: 'new',
    total_visits: 1,
    total_spent: 35000,
    notes: 'Came for teeth scaling and general hygiene checkup.',
    created_at: new Date().toISOString(),
  },
];

const initialCases: Case[] = [
  {
    id: 'case-1',
    clinic_id: FALLBACK_CLINIC_UUID,
    patient_id: 'pat-1',
    case_type: 'Root Canal Treatment (Molar)',
    complexity: 'moderate',
    status: 'in_progress',
    total_cost: 25000,
    paid_amount: 15000,
    start_date: new Date().toISOString(),
    notes: 'Completed access cavity. Oburation scheduled next session.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'case-2',
    clinic_id: FALLBACK_CLINIC_UUID,
    patient_id: 'pat-2',
    case_type: 'Orthodontic Braces / Aligners',
    complexity: 'complex',
    status: 'in_progress',
    total_cost: 180000,
    paid_amount: 80000,
    start_date: new Date().toISOString(),
    notes: 'Clear aligners trace. Scheduled tray tracking appointments.',
    created_at: new Date().toISOString(),
  }
];

const initialAppointments: Appointment[] = [
  {
    id: 'appt-1',
    clinic_id: FALLBACK_CLINIC_UUID,
    patient_id: 'pat-1',
    case_id: 'case-1',
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    duration_minutes: 45,
    appointment_type: 'Treatment',
    status: 'scheduled',
    notes: 'Root Canal second session / obturation.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'appt-2',
    clinic_id: FALLBACK_CLINIC_UUID,
    patient_id: 'pat-2',
    case_id: 'case-2',
    scheduled_at: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // tomorrow
    duration_minutes: 30,
    appointment_type: 'Follow-up',
    status: 'scheduled',
    notes: 'Orthodontic tray transition checkup.',
    created_at: new Date().toISOString(),
  }
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    clinic_id: FALLBACK_CLINIC_UUID,
    patient_id: 'pat-1',
    case_id: 'case-1',
    invoice_number: 'INV-2026-001',
    total_amount: 25000,
    paid_amount: 15000,
    status: 'partial',
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    clinic_id: FALLBACK_CLINIC_UUID,
    patient_id: 'pat-2',
    case_id: 'case-2',
    invoice_number: 'INV-2026-002',
    total_amount: 180000,
    paid_amount: 80000,
    status: 'partial',
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }
];

// Helper to initialize and retrieve local storage items
function getLocalItem<T>(key: string, initialValue: T[]): T[] {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(initialValue));
    return initialValue;
  }
  return JSON.parse(item);
}

function setLocalItem<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localStore = {
  getPatients: () => getLocalItem<Patient>('dos_patients', initialPatients),
  savePatient: (patient: Patient) => {
    const list = getLocalItem<Patient>('dos_patients', initialPatients);
    const idx = list.findIndex(p => p.id === patient.id);
    if (idx >= 0) {
      list[idx] = patient;
    } else {
      list.push(patient);
    }
    setLocalItem('dos_patients', list);
    return patient;
  },
  deletePatient: (id: string) => {
    const list = getLocalItem<Patient>('dos_patients', initialPatients);
    const filtered = list.filter(p => p.id !== id);
    setLocalItem('dos_patients', filtered);
  },

  getCases: () => getLocalItem<Case>('dos_cases', initialCases),
  saveCase: (c: Case) => {
    const list = getLocalItem<Case>('dos_cases', initialCases);
    const idx = list.findIndex(item => item.id === c.id);
    if (idx >= 0) {
      list[idx] = c;
    } else {
      list.push(c);
    }
    setLocalItem('dos_cases', list);
    return c;
  },

  getAppointments: () => getLocalItem<Appointment>('dos_appointments', initialAppointments),
  saveAppointment: (appt: Appointment) => {
    const list = getLocalItem<Appointment>('dos_appointments', initialAppointments);
    const idx = list.findIndex(item => item.id === appt.id);
    if (idx >= 0) {
      list[idx] = appt;
    } else {
      list.push(appt);
    }
    setLocalItem('dos_appointments', list);
    return appt;
  },

  getInvoices: () => getLocalItem<Invoice>('dos_invoices', initialInvoices),
  saveInvoice: (inv: Invoice) => {
    const list = getLocalItem<Invoice>('dos_invoices', initialInvoices);
    const idx = list.findIndex(item => item.id === inv.id);
    if (idx >= 0) {
      list[idx] = inv;
    } else {
      list.push(inv);
    }
    setLocalItem('dos_invoices', list);
    return inv;
  }
};
