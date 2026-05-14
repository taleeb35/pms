## Membership Card Feature — Implementation Plan

### Defaults I'm choosing for you
- **Discounts supported**: Consultation fee %, Procedure %, Pharmacy/Inventory % (3 independent percentages per plan)
- **Plans**: Each clinic creates their own (no forced defaults — empty starter list)
- **Card delivery**: Card number stored in patient record + printable A4/credit-card-sized PDF with QR code (no WhatsApp/email automation in v1)
- **Validity**: Fixed duration in months per plan (e.g. 6 / 12 / 24)

---

### 1. Database (new tables)

**`clinic_membership_plans`**
- clinic_id, name, price, duration_months
- consultation_discount_pct, procedure_discount_pct, pharmacy_discount_pct
- color (badge color), is_active, notes

**`patient_memberships`**
- clinic_id, patient_id, plan_id, card_number (unique, e.g. `MBR-2026-0001`)
- start_date, end_date, status (`active` / `expired` / `cancelled`)
- amount_paid, notes, created_by, cancelled_at

**Helper functions**
- `generate_membership_card_number(clinic_id)` — sequential per clinic
- `enroll_patient_membership(...)` — creates record, auto-cancels prior active membership for same patient
- `get_active_patient_membership(_patient_id)` — returns plan + discount % (used by inventory invoice UI)

**RLS**
- Clinic owner + active receptionists: full CRUD
- Doctors of the clinic: read-only (so they can see patient's status)
- Patients: not exposed (clinic-side feature)

---

### 2. New page: `/clinic/memberships`
Sidebar item under Clinic. Two tabs:

**Plans tab** — table + "New Plan" dialog
- Name, Price, Duration, 3 discount fields, Color, Active toggle
- Edit / Deactivate actions

**Members tab** — searchable list
- Columns: Card #, Patient, Plan, Start, Expires, Status, Amount Paid
- Filters: status, plan, expiring-soon (30 days)
- Actions: Print Card (PDF), Renew, Cancel
- "Enroll Patient" button → searchable patient picker + plan picker

---

### 3. Patient profile integration
- Show colored badge: `Gold Member · Expires 2026-12-31`
- "Enroll in Membership" button when no active membership
- Quick "Renew" / "View Card" when active

---

### 4. Auto-discount on Inventory Invoice
- When a patient is selected on an invoice, fetch their active membership
- Show banner: "Pharmacy member discount: 10% applied"
- Apply % to invoice subtotal and persist `discount_amount` on the invoice (uses existing field if available, else added)
- Discount source recorded in invoice notes for audit

> Consultation/procedure auto-discount is wired the same way but only where billing UI exists today. I'll connect it to the inventory invoice now (clearest billing point) and leave hooks for consultation/procedure billing once those screens have a "patient + amount" surface.

---

### 5. Printable Card (PDF)
- Client-side using existing PDF approach (jsPDF if already in project, else simple printable HTML)
- Contents: clinic name + logo, patient name, card number, plan tier, expiry, QR code linking to verification (card number only — no PHI)

---

### Files to add/edit (technical detail)

**New**
- `supabase/migrations/...` — tables, RLS, functions
- `src/pages/memberships/ClinicMemberships.tsx` (tabs container)
- `src/pages/memberships/MembershipPlansTab.tsx`
- `src/pages/memberships/MembershipMembersTab.tsx`
- `src/components/memberships/EnrollMembershipDialog.tsx`
- `src/components/memberships/MembershipCardPDF.tsx`
- `src/hooks/useActiveMembership.ts`

**Edited**
- `src/App.tsx` — route
- Sidebar component — new nav item (clinic + receptionist roles)
- Patient profile page — badge + enroll button
- `InventoryInvoiceDetail.tsx` (or invoice create flow) — apply membership discount

---

### Out of scope for v1 (call out so we don't surprise you later)
- WhatsApp/Email card delivery (can add via Resend later)
- Patient-facing portal to view their own card
- Family/dependents on one card
- Tiered loyalty points
- Auto-renew billing

---

Reply **approve** to proceed, or tell me what to change (e.g. "add WhatsApp delivery", "skip pharmacy discount", "add visit-count plans").