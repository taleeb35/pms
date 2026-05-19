import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/TableSkeleton";
import { format } from "date-fns";
import { Calendar, Phone, Search, UserPlus, Sparkles, Plus, Pencil } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LeadRow {
  id: string;
  kind: "manual" | "public";
  created_at: string;
  date: string;
  time: string | null;
  name: string;
  phone: string | null;
  comment: string | null;
  status: string;
  // for public-profile appointments
  appointmentId?: string;
  // for manual leads
  leadId?: string;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

const statusVariant = (s: string | null) => {
  switch ((s || "").toLowerCase()) {
    case "active": return "bg-green-500 text-white";
    case "contacted": return "bg-blue-500 text-white";
    case "converted": return "bg-purple-500 text-white";
    case "closed": return "bg-gray-500 text-white";
    default: return "bg-muted text-foreground";
  }
};

const emptyForm = {
  name: "",
  phone: "",
  lead_date: new Date().toISOString().slice(0, 10),
  comment: "",
  status: "active",
};

const DoctorLeads = () => {
  const { toast } = useToast();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRows([]); return; }
      setDoctorId(user.id);

      const { data: doc } = await supabase
        .from("doctors")
        .select("clinic_id")
        .eq("id", user.id)
        .maybeSingle();
      setClinicId((doc as any)?.clinic_id ?? null);

      const [appsRes, leadsRes] = await Promise.all([
        supabase
          .from("appointments")
          .select(`id, created_at, appointment_date, appointment_time, reason, lead_status, patients(full_name, phone)`)
          .eq("doctor_id", user.id)
          .eq("source", "public_profile")
          .order("created_at", { ascending: false }),
        supabase
          .from("leads" as any)
          .select("*")
          .eq("doctor_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (appsRes.error) throw appsRes.error;
      if (leadsRes.error) throw leadsRes.error;

      const publicRows: LeadRow[] = (appsRes.data || [])
        .filter((a: any) => a.patients)
        .map((a: any) => ({
          id: `apt-${a.id}`,
          kind: "public",
          created_at: a.created_at,
          date: a.appointment_date,
          time: a.appointment_time,
          name: a.patients.full_name,
          phone: a.patients.phone,
          comment: a.reason,
          status: a.lead_status || "active",
          appointmentId: a.id,
        }));

      const manualRows: LeadRow[] = ((leadsRes.data as any[]) || []).map((l: any) => ({
        id: `lead-${l.id}`,
        kind: "manual",
        created_at: l.created_at,
        date: l.lead_date,
        time: null,
        name: l.name,
        phone: l.phone,
        comment: l.comment,
        status: l.status || "active",
        leadId: l.id,
      }));

      const merged = [...publicRows, ...manualRows].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRows(merged);
    } catch (e: any) {
      toast({ title: "Error loading leads", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (row: LeadRow, value: string) => {
    const { error } = row.kind === "public"
      ? await supabase.from("appointments").update({ lead_status: value } as any).eq("id", row.appointmentId!)
      : await supabase.from("leads" as any).update({ status: value } as any).eq("id", row.leadId!);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.map((l) => l.id === row.id ? { ...l, status: value } : l));
    toast({ title: "Lead status updated" });
  };

  const convertToAppointment = async (row: LeadRow) => {
    if (row.kind !== "public") return;
    const { error } = await supabase
      .from("appointments")
      .update({ source: "direct", lead_status: "converted" } as any)
      .eq("id", row.appointmentId!);
    if (error) {
      toast({ title: "Conversion failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.filter((l) => l.id !== row.id));
    toast({ title: "Lead converted to appointment" });
  };

  const deleteRow = async (row: LeadRow) => {
    const { error } = row.kind === "public"
      ? await supabase.from("appointments").delete().eq("id", row.appointmentId!)
      : await supabase.from("leads" as any).delete().eq("id", row.leadId!);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.filter((l) => l.id !== row.id));
    toast({ title: "Lead deleted" });
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (row: LeadRow) => {
    if (row.kind !== "manual") return;
    setEditingId(row.leadId!);
    setForm({
      name: row.name,
      phone: row.phone || "",
      lead_date: row.date,
      comment: row.comment || "",
      status: row.status,
    });
    setDialogOpen(true);
  };

  const saveLead = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.lead_date) {
      toast({ title: "Missing fields", description: "Name, phone and date are required", variant: "destructive" });
      return;
    }
    if (!doctorId) return;
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from("leads" as any).update({
          name: form.name.trim(),
          phone: form.phone.trim(),
          lead_date: form.lead_date,
          comment: form.comment.trim() || null,
          status: form.status,
        } as any).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Lead updated" });
      } else {
        const { error } = await supabase.from("leads" as any).insert({
          doctor_id: doctorId,
          clinic_id: clinicId,
          name: form.name.trim(),
          phone: form.phone.trim(),
          lead_date: form.lead_date,
          comment: form.comment.trim() || null,
          status: form.status,
          source: "manual",
          created_by: doctorId,
        } as any);
        if (error) throw error;
        toast({ title: "Lead added" });
      }
      setDialogOpen(false);
      fetchAll();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = rows.filter((l) => {
    if (filter !== "all" && (l.status || "active") !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.comment?.toLowerCase().includes(q)
    );
  });

  const counts = rows.reduce((acc: Record<string, number>, l) => {
    const k = l.status || "active";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">Leads</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Appointment requests from your public profile and manual leads you add yourself.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_OPTIONS.map((s) => (
          <Card key={s.value} className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{counts[s.value] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Leads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone or comment"
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No leads yet. Add a lead manually or wait for bookings from your public profile.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Added {format(new Date(l.created_at), "dd MMM, p")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {l.phone ? (
                          <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                            <Phone className="h-3 w-3" /> {l.phone}
                          </a>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(l.date), "dd MMM yyyy")}
                          {l.time && (
                            <>
                              <span className="text-muted-foreground">at</span>
                              {l.time.slice(0, 5)}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate" title={l.comment || ""}>
                        {l.comment || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {l.kind === "public" ? "Profile" : "Manual"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={l.status || "active"}
                          onValueChange={(v) => updateStatus(l, v)}
                        >
                          <SelectTrigger className="w-36 h-8">
                            <Badge className={statusVariant(l.status || "active")}>
                              {(l.status || "active").replace(/^\w/, (c) => c.toUpperCase())}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          {l.kind === "manual" && (
                            <Button size="sm" variant="outline" onClick={() => openEdit(l)}>
                              <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          )}
                          {l.kind === "public" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => convertToAppointment(l)}
                              title="Move this lead into your Appointments list"
                            >
                              <UserPlus className="h-3 w-3 mr-1" /> Convert
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently removes the lead.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRow(l)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Lead" : "Add Manual Lead"}</DialogTitle>
            <DialogDescription>
              Capture a potential patient enquiry received outside the booking flow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={form.lead_date} onChange={(e) => setForm({ ...form, lead_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={3}
                maxLength={1000}
                placeholder="Any notes about this lead"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveLead} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Lead" : "Add Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorLeads;
