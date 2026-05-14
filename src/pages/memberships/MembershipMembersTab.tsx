import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Printer, XCircle, RotateCw, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import EnrollMembershipDialog from "@/components/memberships/EnrollMembershipDialog";
import MembershipCardPrint from "@/components/memberships/MembershipCardPrint";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Row {
  id: string;
  card_number: string;
  start_date: string;
  end_date: string;
  status: string;
  amount_paid: number;
  patient_id: string;
  plan_id: string;
  patient: { full_name: string; phone: string | null; patient_id: string | null } | null;
  plan: { name: string; color: string; consultation_discount_pct: number; procedure_discount_pct: number; pharmacy_discount_pct: number } | null;
}

export default function MembershipMembersTab({ clinicId }: { clinicId: string }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [printRow, setPrintRow] = useState<Row | null>(null);
  const [cancelRow, setCancelRow] = useState<Row | null>(null);
  const [clinicName, setClinicName] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data, error }, clinicRes] = await Promise.all([
      supabase
        .from("patient_memberships")
        .select("id, card_number, start_date, end_date, status, amount_paid, patient_id, plan_id, patient:patients(full_name, phone, patient_id), plan:clinic_membership_plans(name, color, consultation_discount_pct, procedure_discount_pct, pharmacy_discount_pct)")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false }),
      supabase.from("clinics").select("clinic_name").eq("id", clinicId).maybeSingle(),
    ]);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setRows((data ?? []) as any);
    setClinicName((clinicRes.data as any)?.clinic_name ?? "Clinic");
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [clinicId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (statusFilter === "expiring" && r.status === "active") {
        const days = differenceInDays(new Date(r.end_date), new Date());
        if (days > 30 || days < 0) return false;
      }
      if (!q) return true;
      return (
        r.card_number.toLowerCase().includes(q) ||
        r.patient?.full_name?.toLowerCase().includes(q) ||
        r.patient?.phone?.includes(q) ||
        r.patient?.patient_id?.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const cancel = async () => {
    if (!cancelRow) return;
    const { error } = await supabase
      .from("patient_memberships")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", cancelRow.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Membership cancelled" });
    setCancelRow(null);
    void load();
  };

  const renderStatus = (r: Row) => {
    if (r.status === "cancelled") return <Badge variant="secondary">Cancelled</Badge>;
    if (r.status === "expired") return <Badge variant="outline">Expired</Badge>;
    const days = differenceInDays(new Date(r.end_date), new Date());
    if (days < 0) return <Badge variant="outline">Expired</Badge>;
    if (days <= 30) return <Badge className="bg-amber-500"><AlertTriangle className="h-3 w-3 mr-1" />Expires in {days}d</Badge>;
    return <Badge className="bg-emerald-500">Active</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Input placeholder="Search card # / name / phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-72" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring (≤30d)</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setEnrollOpen(true)}><Plus className="h-4 w-4 mr-2" />Enroll Patient</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No memberships found.</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-sm">{r.card_number}</TableCell>
                <TableCell>
                  <div className="font-medium">{r.patient?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{r.patient?.phone ?? ""}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: r.plan?.color ?? "#999" }} />
                    {r.plan?.name ?? "—"}
                  </div>
                </TableCell>
                <TableCell>{format(new Date(r.start_date), "dd MMM yyyy")}</TableCell>
                <TableCell>{format(new Date(r.end_date), "dd MMM yyyy")}</TableCell>
                <TableCell>{renderStatus(r)}</TableCell>
                <TableCell className="text-right">Rs {Number(r.amount_paid).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setPrintRow(r)} title="View / Print Card">
                      <Printer className="h-4 w-4" />
                    </Button>
                    {r.status === "active" && (
                      <Button size="sm" variant="ghost" onClick={() => setCancelRow(r)} title="Cancel" className="text-rose-600">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EnrollMembershipDialog open={enrollOpen} onOpenChange={setEnrollOpen} clinicId={clinicId} onEnrolled={load} />

      {printRow && printRow.plan && printRow.patient && (
        <MembershipCardPrint
          open={!!printRow}
          onOpenChange={(v) => !v && setPrintRow(null)}
          clinicName={clinicName}
          patientName={printRow.patient.full_name}
          cardNumber={printRow.card_number}
          planName={printRow.plan.name}
          color={printRow.plan.color}
          startDate={printRow.start_date}
          endDate={printRow.end_date}
          status={printRow.status}
          discounts={{
            consultation: Number(printRow.plan.consultation_discount_pct),
            procedure: Number(printRow.plan.procedure_discount_pct),
            pharmacy: Number(printRow.plan.pharmacy_discount_pct),
          }}
        />
      )}

      <AlertDialog open={!!cancelRow} onOpenChange={(v) => !v && setCancelRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Membership?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark <strong>{cancelRow?.card_number}</strong> as cancelled. The patient will lose membership discounts immediately. This cannot be undone — you'll need to enroll them again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction onClick={cancel} className="bg-rose-600 hover:bg-rose-700">Cancel Membership</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
