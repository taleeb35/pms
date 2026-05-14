import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clinicName: string;
  patientName: string;
  cardNumber: string;
  planName: string;
  color: string;
  startDate: string;
  endDate: string;
  status: string;
  discounts: { consultation: number; procedure: number; pharmacy: number };
}

export default function MembershipCardPrint({
  open, onOpenChange, clinicName, patientName, cardNumber, planName, color,
  startDate, endDate, status, discounts,
}: Props) {
  const print = () => {
    const w = window.open("", "_blank", "width=600,height=400");
    if (!w) return;
    w.document.write(`
      <html><head><title>${cardNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; }
        .card { width: 340px; height: 215px; border-radius: 16px; padding: 18px; color: white;
                background: linear-gradient(135deg, ${color}, ${shade(color, -25)}); position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .clinic { font-size: 11px; opacity: 0.85; letter-spacing: 1.5px; text-transform: uppercase; }
        .plan { font-size: 22px; font-weight: 700; margin-top: 4px; }
        .name { font-size: 16px; margin-top: 28px; font-weight: 600; }
        .num { font-family: 'Courier New', monospace; font-size: 18px; letter-spacing: 2px; margin-top: 6px; }
        .meta { display: flex; justify-content: space-between; margin-top: 18px; font-size: 10px; opacity: 0.9; }
        .badge { position: absolute; top: 16px; right: 18px; background: rgba(255,255,255,0.25); padding: 3px 9px; border-radius: 999px; font-size: 9px; font-weight: 600; letter-spacing: 1px; }
        .discounts { margin-top: 24px; font-size: 11px; color: #444; max-width: 340px; }
        .discounts strong { color: ${color}; }
        @media print { body { padding: 0; } }
      </style></head><body>
        <div class="card">
          <div class="clinic">${escapeHtml(clinicName)}</div>
          <div class="plan">${escapeHtml(planName)}</div>
          <div class="badge">${status.toUpperCase()}</div>
          <div class="name">${escapeHtml(patientName)}</div>
          <div class="num">${escapeHtml(cardNumber)}</div>
          <div class="meta">
            <div>VALID FROM<br/><strong>${format(new Date(startDate), "MMM yyyy")}</strong></div>
            <div>VALID THRU<br/><strong>${format(new Date(endDate), "MMM yyyy")}</strong></div>
          </div>
        </div>
        <div class="discounts">
          <p><strong>Member Benefits:</strong></p>
          <ul>
            ${discounts.consultation > 0 ? `<li>${discounts.consultation}% off consultation fees</li>` : ""}
            ${discounts.procedure > 0 ? `<li>${discounts.procedure}% off procedures</li>` : ""}
            ${discounts.pharmacy > 0 ? `<li>${discounts.pharmacy}% off pharmacy / inventory items</li>` : ""}
          </ul>
        </div>
        <script>window.onload = () => { window.print(); };</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Membership Card</DialogTitle></DialogHeader>
        <div className="flex justify-center py-4">
          <div
            className="rounded-2xl p-5 text-white shadow-xl relative"
            style={{ width: 340, height: 215, background: `linear-gradient(135deg, ${color}, ${shade(color, -25)})` }}
          >
            <div className="text-[10px] uppercase tracking-widest opacity-90">{clinicName}</div>
            <div className="text-xl font-bold mt-1">{planName}</div>
            <div className="absolute top-4 right-4 bg-white/25 backdrop-blur px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider">
              {status.toUpperCase()}
            </div>
            <div className="mt-7 font-semibold">{patientName}</div>
            <div className="font-mono text-base tracking-widest mt-1">{cardNumber}</div>
            <div className="flex justify-between mt-4 text-[10px] opacity-90">
              <div>VALID FROM<br /><strong>{format(new Date(startDate), "MMM yyyy")}</strong></div>
              <div>VALID THRU<br /><strong>{format(new Date(endDate), "MMM yyyy")}</strong></div>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground space-y-1 px-2">
          <p className="font-semibold text-foreground">Member benefits:</p>
          {discounts.consultation > 0 && <p>• {discounts.consultation}% off consultation fees</p>}
          {discounts.procedure > 0 && <p>• {discounts.procedure}% off procedures</p>}
          {discounts.pharmacy > 0 && <p>• {discounts.pharmacy}% off pharmacy / inventory</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={print}><Printer className="h-4 w-4 mr-2" />Print Card</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function shade(hex: string, percent: number) {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(2.55 * percent)));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
