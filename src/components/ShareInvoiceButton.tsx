import { useState } from "react";
import { Loader2, Share2, Copy, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { whatsappLink } from "@/lib/phoneLinks";

// F4: send the patient a link to their invoice (WhatsApp or copy). The link is made once per visit.
export default function ShareInvoiceButton({ appointmentId, patient, size = "sm" }: {
  appointmentId: string; patient: { full_name: string; phone?: string | null }; size?: "sm" | "default";
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const getLink = async () => {
    setBusy(true);
    const { data, error } = await (supabase as any).rpc("share_invoice", { p_appointment: appointmentId });
    setBusy(false);
    if (error || !data) { toast({ title: "Could not make the invoice link", description: error?.message, variant: "destructive" }); return null; }
    return `${window.location.origin}/invoice/${data}`;
  };

  const viaWhatsApp = async () => {
    const link = await getLink(); if (!link) return;
    const first = patient.full_name.split(" ")[0];
    const wa = whatsappLink(patient.phone, `Hello ${first}, here is your invoice: ${link}`);
    if (!wa) { toast({ title: "No valid phone number", description: "Copy the link instead.", variant: "destructive" }); return; }
    window.open(wa, "_blank", "noopener,noreferrer");
  };
  const copy = async () => {
    const link = await getLink(); if (!link) return;
    try { await navigator.clipboard.writeText(link); toast({ title: "Invoice link copied" }); }
    catch { toast({ title: "Invoice link", description: link }); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size={size} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />} Share invoice
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={viaWhatsApp}><MessageCircle className="mr-2 h-4 w-4" /> Send on WhatsApp</DropdownMenuItem>
        <DropdownMenuItem onClick={copy}><Copy className="mr-2 h-4 w-4" /> Copy link</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
