import { create } from 'zustand';
import { Patient, Appointment } from '../types';

interface PracticeState {
  patients: Patient[];
  appointments: Appointment[];
  searchQuery: string;
  
  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  removePatient: (id: string) => void;
  setSearchQuery: (query: string) => void;
  
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  removeAppointment: (id: string) => void;
}

export const useStore = create<PracticeState>((set) => ({
  patients: [
    {
      id: '1',
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '(555) 123-4567',
      urgency: 'routine',
      status: 'scheduled',
      lastVisit: '2024-03-15',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Marcus Aurelius',
      email: 'marcus.a@example.com',
      phone: '(555) 987-6543',
      urgency: 'urgent',
      status: 'scheduled',
      lastVisit: '2024-02-28',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Alice Freeman',
      email: 'alice.f@example.com',
      phone: '(555) 456-7890',
      urgency: 'routine',
      status: 'completed',
      lastVisit: '2024-03-20',
      createdAt: new Date().toISOString(),
    },
  ],
  appointments: [],
  searchQuery: '',

  addPatient: (patientData) => set((state) => {
    const newPatient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    return { patients: [newPatient, ...state.patients] };
  }),

  updatePatient: (id, updates) => set((state) => ({
    patients: state.patients.map((p) => p.id === id ? { ...p, ...updates } : p)
  })),

  removePatient: (id) => set((state) => ({
    patients: state.patients.filter((p) => p.id !== id)
  })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  addAppointment: (appointmentData) => set((state) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Math.random().toString(36).substring(2, 9),
    };
    return { appointments: [newAppointment, ...state.appointments] };
  }),

  removeAppointment: (id) => set((state) => ({
    appointments: state.appointments.filter((a) => a.id !== id)
  })),
}));
