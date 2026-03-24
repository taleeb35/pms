
-- Drop indexes that reference the enum type
DROP INDEX IF EXISTS idx_appointments_status;
DROP INDEX IF EXISTS idx_appointments_fees;

-- Drop default
ALTER TABLE appointments ALTER COLUMN status DROP DEFAULT;

-- Convert column to text
ALTER TABLE appointments ALTER COLUMN status TYPE text USING (status::text);

-- Update data
UPDATE appointments SET status = 'scheduled' WHERE status = 'confirmed';
UPDATE appointments SET status = 'cancelled' WHERE status = 'no_show';
UPDATE appointments SET status = 'start' WHERE status = 'in_progress';

-- Drop old enum type
DROP TYPE IF EXISTS appointment_status;

-- Create new enum type
CREATE TYPE appointment_status AS ENUM ('scheduled', 'start', 'cancelled', 'completed');

-- Convert column back to enum
ALTER TABLE appointments ALTER COLUMN status TYPE appointment_status USING (status::appointment_status);

-- Set default
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'scheduled'::appointment_status;

-- Recreate indexes with new enum
CREATE INDEX idx_appointments_status ON appointments USING btree (status);
CREATE INDEX idx_appointments_fees ON appointments USING btree (doctor_id, consultation_fee, other_fee) WHERE (status = 'completed'::appointment_status);
