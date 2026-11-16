import { Phone, MessageCircle } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/phoneLinks";

/** Phone number with one-tap Call and WhatsApp buttons (clicks don't open the row). */
export const PhoneWithActions = ({ phone }: { phone?: string | null }) => {
  const tel = telLink(phone); const wa = whatsappLink(phone);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{phone || "—"}</span>
      {tel && (
        <a href={tel} onClick={(e) => e.stopPropagation()} aria-label={`Call ${phone}`} title="Call"
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Phone className="h-3.5 w-3.5" /></a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} aria-label={`WhatsApp ${phone}`} title="WhatsApp"
          className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"><MessageCircle className="h-3.5 w-3.5" /></a>
      )}
    </span>
  );
};
export default PhoneWithActions;
