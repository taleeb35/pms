import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { billingAction } from "@/lib/billing";

export const CANCEL_REASONS = [
  "Too expensive",
  "Missing features I need",
  "Too hard to use",
  "Moving to another system",
  "Clinic closing or taking a break",
  "Other",
];

// Asks why before cancelling. The subscription stays active until the end of the paid period.
export default function CancelSubscriptionDialog({ open, onOpenChange, periodEnd, onDone }: {
  open: boolean; onOpenChange: (v: boolean) => void; periodEnd: string | null; onDone: () => void;
}) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const r = await billingAction<{ ends_at: string | null }>("cancel", { reason, comment });
      toast({
        title: "Subscription cancelled",
        description: r.ends_at ? `You can keep using Zonoir until ${format(parseISO(r.ends_at), "d MMM yyyy")}.` : undefined,
      });
      onOpenChange(false);
      setReason(""); setComment("");
      onDone();
    } catch (e) {
      toast({ title: "Could not cancel", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel subscription</DialogTitle>
          <DialogDescription>
            {periodEnd
              ? `Nothing more will be charged. Your account stays fully usable until ${format(parseISO(periodEnd), "d MMM yyyy")}, then becomes read-only.`
              : "Nothing more will be charged. At the end of the paid period the account becomes read-only."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Why are you cancelling?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-1">
              {CANCEL_REASONS.map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <RadioGroupItem value={r} id={`cr-${r}`} />
                  <Label htmlFor={`cr-${r}`} className="font-normal">{r}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cancel-comment">Anything else you want to tell us? (optional)</Label>
            <Textarea id="cancel-comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep subscription</Button>
          <Button variant="destructive" onClick={submit} disabled={busy || !reason || (reason === "Other" && !comment.trim())}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Cancel subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
