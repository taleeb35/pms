import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { handleNameInput, handlePhoneInput, validateName, validatePhone } from "@/lib/validations";

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  doctorName: string;
}

const BookAppointmentDialog = ({
  open,
  onOpenChange,
  doctorId,
  doctorName,
}: BookAppointmentDialogProps) => {
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return format(d, "yyyy-MM-dd");
  }, []);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [slots, setSlots] = useState<{ value: string; label: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);

  // Reset state when dialog opens fresh
  useEffect(() => {
    if (open) {
      setSuccess(false);
    }
  }, [open]);

  // Fetch availability + booked slots for the chosen date
  useEffect(() => {
    if (!open || !doctorId || !date) return;

    let cancelled = false;
    const load = async () => {
      setLoadingSlots(true);
      setTime("");
      setUnavailableReason(null);
      try {
        const { data, error } = await supabase.rpc("get_public_doctor_booking_availability", {
          _doctor_id: doctorId,
          _appointment_date: date,
        });

        if (error) {
          throw error;
        }

        const availability = (data ?? {}) as {
          available?: boolean;
          reason?: string | null;
          slots?: Array<{ value?: string; label?: string }>;
        };

        if (!availability.available) {
          if (!cancelled) {
            setSlots([]);
            setUnavailableReason(availability.reason || "Doctor is not available on this date.");
          }
          return;
        }

        const allSlots = (availability.slots ?? [])
          .filter((slot): slot is { value: string; label: string } => !!slot.value && !!slot.label)
          .map((slot) => ({ value: slot.value, label: slot.label }));

        // If today, hide past times
        const now = new Date();
        const isToday = date === format(now, "yyyy-MM-dd");
        const currentHM = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`;

        const free = allSlots.filter((s) => {
          if (isToday && s.value <= currentHM) return false;
          return true;
        });

        if (!cancelled) {
          setSlots(free);
          if (free.length === 0) {
            setUnavailableReason("No available time slots for this date. Please choose another day.");
          }
        }
      } catch (err) {
        console.error("Slot loading error:", err);
        if (!cancelled) {
          setSlots([]);
          setUnavailableReason("Could not load availability. Please try again.");
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, doctorId, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const nm = validateName(fullName);
    if (!nm.isValid) return toast.error(nm.message);
    const ph = validatePhone(phone);
    if (!ph.isValid) return toast.error(ph.message);
    if (!date) return toast.error("Please select a date");
    if (!time) return toast.error("Please select a time slot");

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("public_book_appointment" as any, {
        _doctor_id: doctorId,
        _full_name: fullName,
        _phone: phone,
        _appointment_date: date,
        _appointment_time: time,
        _reason: reason || null,
        _gender: gender,
      });

      if (error) throw error;
      if (!data) throw new Error("Booking failed");

      setSuccess(true);
      toast.success("Appointment booked successfully!");
    } catch (err: any) {
      console.error("Booking error:", err);
      toast.error(err.message || "Could not book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setFullName("");
    setPhone("");
    setDate(today);
    setTime("");
    setReason("");
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : resetAndClose())}>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Appointment Requested</h2>
              <p className="text-sm text-muted-foreground">
                Your appointment with <strong>{doctorName}</strong> on{" "}
                <strong>{format(new Date(date + "T00:00:00"), "PPP")}</strong> at{" "}
                <strong>{slots.find((s) => s.value === time)?.label || time}</strong> has been
                scheduled. The clinic will contact you on <strong>{phone}</strong> to confirm.
              </p>
            </div>
            <Button onClick={resetAndClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Book Appointment
              </DialogTitle>
              <DialogDescription>
                with <strong>{doctorName}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-name">Full name *</Label>
                <Input
                  id="b-name"
                  value={fullName}
                  onChange={(e) => setFullName(handleNameInput(e))}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="b-phone">Phone number *</Label>
                <Input
                  id="b-phone"
                  value={phone}
                  onChange={(e) => setPhone(handlePhoneInput(e))}
                  placeholder="03001234567"
                  inputMode="tel"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="b-date">Date *</Label>
                  <Input
                    id="b-date"
                    type="date"
                    value={date}
                    min={today}
                    max={maxDate}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-time">Time *</Label>
                  <select
                    id="b-time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={loadingSlots || slots.length === 0}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {loadingSlots ? "Loading…" : slots.length === 0 ? "Unavailable" : "Pick a slot"}
                    </option>
                    {slots.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {unavailableReason && (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-2">
                  {unavailableReason}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="b-reason">Reason for visit (optional)</Label>
                <Textarea
                  id="b-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Brief description of your symptoms or reason"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || !time || loadingSlots}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking…
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                By booking, you agree to be contacted on the number provided.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentDialog;
