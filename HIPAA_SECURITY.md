# DentalOS HIPAA & Security Checklist

To achieve production-ready HIPAA compliance for your Dental SaaS, follow this rigorous security framework.

## 1. Data Privacy & Encryption (PHI)
- [ ] **Encryption at Rest:** All data in Cloud Firestore is encrypted by default. Ensure that any exported backups are stored in encrypted buckets.
- [ ] **Encryption in Transit:** All traffic is served over HTTPS (TLS 1.2+).
- [ ] **Data Minimization:** Only store Protected Health Information (PHI) that is strictly necessary for treatment or billing.

## 2. Access Control & Identity
- [ ] **Unique User IDs:** Every staff member must have a unique login via Firebase Auth.
- [ ] **Role-Based Access Control (RBAC):** Use Firestore Security Rules to restrict patient records to authorized doctors/staff only.
- [ ] **Automatic Logouts:** Implement session timeouts (e.g., 15 minutes of inactivity) in the React state.

## 3. Audit Logging
- [ ] **Immutable Logs:** Log all access to patient records. 
  - *Implementation:* Create a `system_logs` collection. Every time a `TreatmentNote` or `Patient` record is read/updated, write a log entry: `{ userId, action, timestamp, patientId }`.
- [ ] **Audit Trail:** Maintain logs for at least 6 years (HIPAA requirement).

## 4. AI & 3rd Party Integrations
- [ ] **BAA (Business Associate Agreement):** Ensure you have a signed BAA with Google (for Gemini/Firebase) and any other AI provider.
- [ ] **No PII in AI Training:** Gemini 3 Flash via API (Enterprise) does not use your data for training by default. Always verify your specific tier settings.
- [ ] **De-identification:** When sending data to AI for "General Insights", strip Name, SSN, and Phone.

## 5. Administrative Safeguards
- [ ] **Staff Training:** Documented security training for all dental staff.
- [ ] **Emergency Access:** Plan for database access if the primary admin is unavailable.
- [ ] **BAA Management:** Keep a repository of all vendor BAAs.

---
*Disclaimer: This is a technical checklist. Consult with a HIPAA compliance officer/attorney for official certification.*
