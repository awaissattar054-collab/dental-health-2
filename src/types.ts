export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  urgency: "routine" | "urgent" | "emergency";
  status: "pending" | "scheduled" | "completed";
  lastVisit?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: string; // "clean-up", "root-canal", etc.
  notes?: string;
}

export interface CDTCode {
  code: string;
  description: string;
  details: string;
  estimatedCost: number;
}

export const CDT_CODES: CDTCode[] = [
  { 
    code: "D0120", 
    description: "Periodic Oral Evaluation", 
    details: "A check-up for an established patient to determine any changes in dental and health status since a previous comprehensive or periodic evaluation.",
    estimatedCost: 75 
  },
  { 
    code: "D1110", 
    description: "Prophylaxis - Adult (Cleaning)", 
    details: "A preventative procedure to remove plaque, calculus, and stains from the tooth structures. Intended for patients with generally healthy gums.",
    estimatedCost: 120 
  },
  { 
    code: "D0210", 
    description: "Intraoral - Comprehensive Series (X-rays)", 
    details: "A complete set of radiographic images (14-22 images) that shows the entire mouth, including all teeth and surrounding bone.",
    estimatedCost: 150 
  },
  { 
    code: "D2330", 
    description: "Resin-Based Composite - One Surface, Anterior", 
    details: "A tooth-colored filling used to restore a single surface of a front tooth that has a cavity or minor fracture.",
    estimatedCost: 180 
  },
  { 
    code: "D3310", 
    description: "Endodontic Therapy - Anterior Tooth (Root Canal)", 
    details: "Treatment of the pulp (nerve) of a front tooth to save it from extraction after deep decay or trauma has caused infection.",
    estimatedCost: 900 
  },
  { 
    code: "D6010", 
    description: "Surgical Placement of Implant Body", 
    details: "The surgical placement of a titanium post into the jawbone to act as an artificial root for a replacement tooth or bridge.",
    estimatedCost: 2500 
  }
];
