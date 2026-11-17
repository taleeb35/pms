import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { whatsappLink } from "@/lib/phoneLinks";

// #11 "Ask for a review": sends the doctor's review link (or the clinic's, if the doctor has none) to the
// patient on WhatsApp. When no link is saved yet, it asks for one first and saves it.
type Props = {
  doctorId: string;
  patient: { full_name: string; phone?: string | null };
  size?: "sm" | "default";
};

export default function AskReviewButton({ doctorId, patient, size = "sm" }: Props) {
  const { toast } = useToast();
  const [link, setLink] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [isClinicUser, setIsClinicUser] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: doc } = await supabase.from("doctors").select("review_url, clinic_id, profiles(full_name)").eq("id", doctorId).maybeSingle();
      let url = ((doc as any)?.review_url || "").trim();
      const cid = (doc as any)?.clinic_id || null;
      if (!url && cid) {
        const { data: cl } = await supabase.from("clinics").select("review_url").eq("id", cid).maybeSingle();
        url = ((cl as any)?.review_url || "").trim();
      }
      if (!alive) return;
      setLink(url || null);
      setClinicId(cid);
      setIsClinicUser(!!user && !!cid && user.id === cid);
      setDoctorName((doc as any)?.profiles?.full_name || "");
    })();
    return () => { alive = false; };
  }, [doctorId]);

  const first = patient.full_name.split(" ")[0];
  const message = (url: string) => `Hello ${first}, thank you for visiting${doctorName ? ` ${doctorName}` : ""}. If you have a moment, please leave a review: ${url}`;

  const send = (url: string) => {
    const wa = whatsappLink(patient.phone, message(url));
    if (!wa) { toast({ title: "No valid phone number", description: "Add the patient's mobile number to send on WhatsApp.", variant: "destructive" }); return; }
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  const click = () => { if (link) send(link); else { setDraft(""); setOpen(true); } };

  const saveAndSend = async () => {
    const url = draft.trim();
    if (!/^https?:\/\/\S+\.\S+/.test(url)) { toast({ title: "Paste the full link", description: "It should start with https://", variant: "destructive" }); return; }
    setBusy(true);
    // A clinic owner saves the clinic's link (used for all its doctors); a doctor saves their own.
    const res = isClinicUser && clinicId
      ? await supabase.from("clinics").update({ review_url: url } as any).eq("id", clinicId)
      : await supabase.from("doctors").update({ review_url: url } as any).eq("id", doctorId);
    setBusy(false);
    if (res.error) { toast({ title: "Could not save the link", description: res.error.message, variant: "destructive" }); return; }
    setLink(url); setOpen(false);
    toast({ title: "Review link saved", description: isClinicUser ? "Used for all your doctors who have no link of their own." : "You can change it in Profile." });
    send(url);
  };

  return (
    <>
      <Button type="button" variant="outline" size={size} onClick={click} title="Send your review link to the patient on WhatsApp">
        <Star className="mr-2 h-4 w-4 text-amber-500" /> Ask for review
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add your review link</DialogTitle>
            <DialogDescription>
              Paste the link where patients can review {isClinicUser ? "your clinic" : "you"}, for example your Google review link. It is saved for next time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="review-link">Review link</Label>
            <Input id="review-link" type="url" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://g.page/r/..." autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveAndSend} disabled={busy || !draft.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save and send"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
