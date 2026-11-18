import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, addMonths, format } from "date-fns";
import { CheckCircle2, Printer, Receipt, MessageCircle, CalendarPlus, ArrowRight, Loader2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DoctorTimeSelect } from "@/components/DoctorTimeSelect";
import { isTimeSlotAvailable } from "@/lib/appointmentUtils";
import { whatsappLink } from "@/lib/phoneLinks";
import { friendlyDate, friendlyTime } from "@/lib/datetime";
import { zonedNow } from "@/lib/region";
import AskReviewButton from "@/components/AskReviewButton";
import { useToast } from "@/hooks/use-toast";

// Shown right after a visit is saved: the next things a doctor usually does, one click each.
export type PostVisitInfo = {
  followUp: { date: string; time: string } | null; // booked from the Next Visit card
  followUpBusy: boolean; // Next Visit date was set but that time was already taken
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  info: PostVisitInfo | null;
  appointment: { id: string; doctor_id: string; patient_id: string; appointment_time: string; patients: { full_name: string; phone?: string | null } };
  doctorName?: string | null;
  prescriptionText: string;
  onPrint: () => void;
  onPrintInvoice: () => void;
};

const QUICK = [
  { label: "1 week", fn: (d: Date) => addDays(d, 7) },
  { label: "2 weeks", fn: (d: Date) => addDays(d, 14) },
  { label: "1 month", fn: (d: Date) => addMonths(d, 1) },
  { label: "3 months", fn: (d: Date) => addMonths(d, 3) },
];

export const PostVisitDialog = ({ open, onOpenChange, info, appointment, doctorName, prescriptionText, onPrint, onPrintInvoice }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fuDate, setFuDate] = useState<Date | undefined>();
  const [fuTime, setFuTime] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState<{ date: string; time: string } | null>(null);
  const [nextPatient, setNextPatient] = useState<{ id: string; name: string; time: string } | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBooked(info?.followUp || null);
    setFuDate(undefined); setFuTime("");
    supabase.from("doctors").select("review_url").eq("id", appointment.doctor_id).maybeSingle()
      .then(({ data }) => setReviewUrl(((data as any)?.review_url || "").trim() || null));
    const { ymd } = zonedNow();
    supabase.from("appointments").select("id, appointment_time, patients(full_name)")
      .eq("doctor_id", appointment.doctor_id).eq("appointment_date", ymd).in("status", ["scheduled", "start"])
      .neq("id", appointment.id).order("appointment_time").limit(1)
      .then(({ data }) => {
        const a = (data as any[])?.[0];
        setNextPatient(a ? { id: a.id, name: a.patients?.full_name || "Patient", time: a.appointment_time } : null);
      });
  }, [open, info, appointment.id, appointment.doctor_id]);

  const first = appointment.patients.full_name.split(" ")[0];
  const lines = [
    `Hello ${first},`,
    `Your prescription${doctorName ? ` from ${doctorName}` : ""} (${friendlyDate(format(new Date(), "yyyy-MM-dd"))}):`,
    prescriptionText.trim() || "-",
  ];
  if (booked) lines.push(`Next visit: ${friendlyDate(booked.date)} at ${friendlyTime(booked.time)}`);
  const wa = whatsappLink(appointment.patients.phone, lines.join("\n\n"));
  const reviewWa = reviewUrl ? whatsappLink(appointment.patients.phone,
    `Hello ${first}, thank you for visiting${doctorName ? ` ${doctorName}` : ""}. If you have a moment, please leave a review: ${reviewUrl}`) : null;

  const book = async () => {
    if (!fuDate || !fuTime) return;
    setBooking(true);
    const date = format(fuDate, "yyyy-MM-dd");
    const { available } = await isTimeSlotAvailable(appointment.doctor_id, date, fuTime);
    if (!available) {
      setBooking(false);
      toast({ title: "That time is taken", description: "Please pick another time.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("appointments").insert({
      patient_id: appointment.patient_id, doctor_id: appointment.doctor_id,
      appointment_date: date, appointment_time: fuTime, duration_minutes: 30,
      status: "scheduled", reason: "Follow-up visit",
    });
    setBooking(false);
    if (error) { toast({ title: "Could not book", description: error.message, variant: "destructive" }); return; }
    setBooked({ date, time: fuTime });
    toast({ title: "Follow-up booked", description: `${friendlyDate(date)} at ${friendlyTime(fuTime)}` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Visit saved</DialogTitle>
          <DialogDescription>{appointment.patients.full_name} — what would you like to do next?</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12 justify-start" onClick={onPrint}><Printer className="mr-2 h-4 w-4" /> Print prescription</Button>
          <Button variant="outline" className="h-12 justify-start" onClick={onPrintInvoice}><Receipt className="mr-2 h-4 w-4" /> Print invoice</Button>
          {wa ? (
            <Button variant="outline" className="col-span-2 h-12 justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950" asChild>
              <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" /> Send prescription on WhatsApp</a>
            </Button>
          ) : (
            <p className="col-span-2 text-xs text-muted-foreground">Add a valid phone number to the patient to send the prescription on WhatsApp.</p>
          )}
          <div className="col-span-2 [&>button]:h-12 [&>button]:w-full [&>button]:justify-start">
            <AskReviewButton doctorId={appointment.doctor_id} patient={appointment.patients} size="default" appointmentId={appointment.id} />
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium"><CalendarPlus className="h-4 w-4 text-primary" /> Follow-up</p>
          {booked ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">Booked for {friendlyDate(booked.date)} at {friendlyTime(booked.time)}.</p>
          ) : (
            <>
              {info?.followUpBusy && <p className="mb-2 text-xs text-amber-700 dark:text-amber-400">The next-visit time you chose was already taken, so it was not booked. Pick another below.</p>}
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK.map((q) => {
                  const d = q.fn(new Date());
                  const on = fuDate && format(fuDate, "yyyy-MM-dd") === format(d, "yyyy-MM-dd");
                  return (
                    <Button key={q.label} type="button" size="sm" variant={on ? "default" : "outline"} className="h-8" onClick={() => { setFuDate(d); setFuTime(""); }}>
                      {q.label}
                    </Button>
                  );
                })}
              </div>
              {fuDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{friendlyDate(format(fuDate, "yyyy-MM-dd"))}</span>
                  <div className="flex-1">
                    <DoctorTimeSelect doctorId={appointment.doctor_id} selectedDate={fuDate} value={fuTime} onValueChange={setFuTime} placeholder="Pick a time" />
                  </div>
                  <Button size="sm" onClick={book} disabled={!fuTime || booking}>{booking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book"}</Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Stay on this visit</Button>
          {nextPatient ? (
            <Button className="min-w-0 max-w-full sm:max-w-[65%]" onClick={() => { onOpenChange(false); navigate(`/doctor/appointments/${nextPatient.id}`); }}>
              <span className="truncate">Next: {nextPatient.name} · {friendlyTime(nextPatient.time)}</span> <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          ) : (
            <Button onClick={() => { onOpenChange(false); navigate("/doctor/dashboard"); }}>Back to today <ArrowRight className="ml-2 h-4 w-4" /></Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostVisitDialog;
