import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/TableSkeleton";
import { format } from "date-fns";
import { Calendar, Phone, Search, UserPlus, Sparkles } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Lead {
  id: string;
  created_at: string;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: string;
  lead_status: string | null;
  patient_id: string;
  patients: {
    full_name: string;
    phone: string | null;
    patient_id: string;
  } | null;
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

const DoctorLeads = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLeads([]); return; }
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id, created_at, appointment_date, appointment_time, reason, status, lead_status, patient_id,
          patients(full_name, phone, patient_id)
        `)
        .eq("doctor_id", user.id)
        .eq("source", "public_profile")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setLeads(((data || []) as any).filter((l: any) => l.patients));
    } catch (e: any) {
      toast({ title: "Error loading leads", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: string, value: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ lead_status: value } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, lead_status: value } : l));
    toast({ title: "Lead status updated" });
  };

  const convertToAppointment = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ source: "direct", lead_status: "converted" } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "Conversion failed", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast({ title: "Lead converted to appointment" });
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast({ title: "Lead deleted" });
  };

  const filtered = leads.filter((l) => {
    if (filter !== "all" && (l.lead_status || "active") !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.patients?.full_name?.toLowerCase().includes(q) ||
      l.patients?.phone?.toLowerCase().includes(q) ||
      l.reason?.toLowerCase().includes(q)
    );
  });

  const counts = leads.reduce((acc: Record<string, number>, l) => {
    const k = l.lead_status || "active";
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
            Appointment requests received through your public doctor profile page.
          </p>
        </div>
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
                placeholder="Search name, phone or reason"
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
              <p>No leads yet. Bookings from your public profile will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Requested Slot</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium">{l.patients?.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Received {format(new Date(l.created_at), "dd MMM, p")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {l.patients?.phone ? (
                          <a href={`tel:${l.patients.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                            <Phone className="h-3 w-3" /> {l.patients.phone}
                          </a>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(l.appointment_date), "dd MMM yyyy")}
                          <span className="text-muted-foreground">at</span>
                          {l.appointment_time?.slice(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate" title={l.reason || ""}>
                        {l.reason || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={l.lead_status || "active"}
                          onValueChange={(v) => updateStatus(l.id, v)}
                        >
                          <SelectTrigger className="w-36 h-8">
                            <Badge className={statusVariant(l.lead_status || "active")}>
                              {(l.lead_status || "active").replace(/^\w/, (c) => c.toUpperCase())}
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => convertToAppointment(l.id)}
                            title="Move this lead into your Appointments list"
                          >
                            <UserPlus className="h-3 w-3 mr-1" /> Convert
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently removes the lead. The patient record is kept.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteLead(l.id)}>Delete</AlertDialogAction>
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
    </div>
  );
};

export default DoctorLeads;
