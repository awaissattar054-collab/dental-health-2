export interface Clinic {
  id: string;
  name: string;
  owner_id: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  whatsapp_number?: string;
  currency: string;
  market_mode: 'pakistan' | 'international';
  logo_url?: string;
  brand_color?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email: string;
  phone?: string;
  clinic_name?: string;
  clinic_id?: string;
  role: 'dentist' | 'receptionist' | 'admin';
  avatar_url?: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  full_name: string;
  phone: string;
  email?: string;
  cnic?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  emergency_contact?: string;
  blood_group?: string;
  allergies?: string;
  medical_history?: string;
  insurance_provider?: string;
  sehat_sahulat_eligible?: boolean;
  status: 'new' | 'active' | 'returning' | 'inactive';
  total_visits: number;
  total_spent: number;
  notes?: string;
  created_at: string;
}

export interface Case {
  id: string;
  clinic_id: string;
  patient_id: string;
  case_type: string; // e.g., "Root Canal", "Implant", "Invisalign"
  complexity: 'simple' | 'moderate' | 'complex';
  status: 'planning' | 'in_progress' | 'healing' | 'awaiting_patient' | 'completed' | 'cancelled';
  total_cost: number;
  paid_amount: number;
  lead_dentist_id?: string;
  start_date: string;
  estimated_completion_date?: string;
  notes?: string;
  created_at: string;
}

export interface CaseStage {
  id: string;
  case_id: string;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'completed' | 'skipped';
  scheduled_date?: string;
  completed_date?: string;
  notes?: string;
  cost?: number;
  photos?: string[];
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  case_id?: string;
  dentist_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  appointment_type: string; // "Consultation", "Treatment", "Follow-up"
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  reminder_sent?: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  clinic_id: string;
  patient_id: string;
  case_id?: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  notes?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  treatment_name: string;
  treatment_code?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'easypaisa' | 'jazzcash' | 'insurance';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  recorded_by?: string;
}
