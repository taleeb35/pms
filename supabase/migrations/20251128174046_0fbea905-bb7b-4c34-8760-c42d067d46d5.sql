-- Make doctor_id nullable and add clinic_id to support both doctor and clinic tickets
ALTER TABLE support_tickets ALTER COLUMN doctor_id DROP NOT NULL;

-- Add clinic_id column
ALTER TABLE support_tickets ADD COLUMN clinic_id uuid REFERENCES clinics(id);

-- Add a check to ensure either doctor_id or clinic_id is set (but not both)
ALTER TABLE support_tickets ADD CONSTRAINT check_ticket_owner 
  CHECK (
    (doctor_id IS NOT NULL AND clinic_id IS NULL) OR 
    (doctor_id IS NULL AND clinic_id IS NOT NULL)
  );

-- Update RLS policies for clinic tickets
CREATE POLICY "Clinics can create own tickets"
ON support_tickets
FOR INSERT
TO authenticated
WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Clinics can view own tickets"
ON support_tickets
FOR SELECT
TO authenticated
USING (clinic_id = auth.uid());