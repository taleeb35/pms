# Structured Disease Templates

Transform the current free-text "prescription_template" into a **structured medicine list** per disease, so doctors can build once and reuse in appointments with one click — then tweak per patient.

## What the doctor gets

### 1. New Disease Template Editor (Doctor + Clinic)
For each disease (e.g. "Hypertension"), the doctor builds a list of medicines. Each medicine row has:

| Field | Example | Input |
|---|---|---|
| Medicine | Augmentin | Searchable dropdown from existing medicines library |
| Brand / Strength | 625mg | Free text |
| Dosage | 1 tablet | Free text |
| Frequency | 3 times a day | Preset dropdown (1/2/3/4 times daily, SOS, weekly, etc.) |
| Timing | Morning, Afternoon, Evening | Multi-select chips (Morning / Afternoon / Evening / Night) |
| Duration | 7 days | Free text |
| Meal | After meal | Dropdown (Before / After / With / Anytime) |
| Instructions | Take with water | Optional free text |

Plus **general notes** for the disease (advice, lifestyle, follow-up).

UI: Card per medicine, "+ Add Medicine" button, drag-to-reorder.

### 2. In Appointment / Prescription page
- New **"Load from Template"** button → dropdown of disease templates.
- On select → all medicines auto-fill into the prescription as editable rows.
- Doctor can edit, remove, or add more medicines for this specific patient — without changing the master template.
- Compiled into the printed/saved prescription as a clean formatted list.

### 3. Backwards compatibility
- Existing free-text `prescription_template` stays as a fallback "notes" field on the template (renamed to `general_notes`).
- Old templates still load; doctor can convert them by adding structured medicines.

## Technical changes

### Database (migration)
New table `doctor_disease_template_medicines`:
- `id`, `template_id` (FK → doctor_disease_templates), `medicine_name`, `brand`, `dosage`, `frequency`, `timing` (text[]), `duration`, `meal`, `instructions`, `sort_order`, timestamps.
- RLS: doctor owns via parent template.

Same for clinics: `clinic_disease_template_medicines` (FK → clinic_disease_templates).

Add `general_notes` text column to both `doctor_disease_templates` and `clinic_disease_templates` (keep `prescription_template` for back-compat).

### Frontend
- **Rewrite** `src/pages/DoctorTemplates.tsx` and `src/pages/ClinicTemplates.tsx` disease section into the new structured editor (Dialog with medicine rows).
- **New component** `src/components/DiseaseTemplateEditor.tsx` — reusable card-based medicine list with add/remove/reorder.
- **Appointment integration**: In the prescription editor on appointment detail page (`DoctorAppointmentDetail.tsx` / wherever prescription is composed), add "Load Disease Template" picker that expands the structured medicines into the prescription text area (or structured rows if that screen already supports it).
- **Mobile** (`MobileTemplates.tsx`): keep current simple list view but show medicine count; full editing happens on web (already linked).

### Out of scope (for now)
- Drag-to-reorder is nice-to-have; will use up/down arrows if simpler.
- Multi-disease templates (combining 2 diseases) — single disease per template only.

## Files touched (estimate)
- 1 migration
- 1 new component (`DiseaseTemplateEditor.tsx`)
- Edit `DoctorTemplates.tsx`, `ClinicTemplates.tsx`
- Edit appointment prescription composer (need to confirm which file — likely `DoctorAppointmentDetail.tsx`)
- `types.ts` regenerates after migration

## Question before I build
**How should "Load Template" work in the appointment page?**
- **(A)** Append medicines as formatted text into the existing prescription textarea (simplest, works with current print logic).
- **(B)** Replace prescription input with structured medicine rows everywhere (bigger refactor — also changes how prescriptions print and save).

I'd recommend **(A)** for now — it ships faster, keeps print/PDF unchanged, and the doctor still sees a clean editable list. We can move to (B) later if you want fully structured prescription records.

Confirm **A or B**, then I build.