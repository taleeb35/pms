import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Eye, Trash2, Building2, CheckCircle2, Clock, Search } from "lucide-react";
import { TablePagination } from "@/components/TablePagination";

interface Clinic {
  id: string;
  clinic_name: string;
  city: string;
  phone_number: string;
  address: string;
  status: string;
  fee_status: string;
  no_of_doctors: number;
  requested_doctors: number;
  created_at: string;
  updated_at: string;
  trial_end_date: string | null;
  profile?: {
    email: string;
    full_name: string;
  };
  activeDoctorCount?: number;
}

const getTrialDaysRemaining = (trialEndDate: string | null): number | null => {
  if (!trialEndDate) return null;
  const trialEnd = new Date(trialEndDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = trialEnd.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const AdminClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [doctorMonthlyFee, setDoctorMonthlyFee] = useState<number>(6000);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchClinics();
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    let filtered = clinics;
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((clinic) => clinic.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((clinic) => {
        return (
          clinic.clinic_name.toLowerCase().includes(query) ||
          clinic.city.toLowerCase().includes(query) ||
          clinic.phone_number.toLowerCase().includes(query) ||
          (clinic.profile?.email?.toLowerCase().includes(query) ?? false)
        );
      });
    }
    
    setFilteredClinics(filtered);
    setCurrentPage(1);
  }, [searchQuery, clinics, statusFilter]);

  const fetchSystemSettings = async () => {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "doctor_monthly_fee")
      .maybeSingle();
    if (!error && data) {
      setDoctorMonthlyFee(Number(data.value) || 6000);
    }
  };

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const { data: clinicsData, error } = await supabase
        .from("clinics")
        .select(`*, profile:profiles!clinics_id_fkey(email, full_name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch actual approved doctor counts for each clinic
      const { data: doctorCounts, error: doctorError } = await supabase
        .from("doctors")
        .select("clinic_id, approved")
        .eq("approved", true)
        .not("clinic_id", "is", null);
      
      if (doctorError) throw doctorError;

      // Count approved doctors per clinic
      const countMap: Record<string, number> = {};
      doctorCounts?.forEach((doc) => {
        if (doc.clinic_id) {
          countMap[doc.clinic_id] = (countMap[doc.clinic_id] || 0) + 1;
        }
      });

      // Merge counts into clinic data
      const clinicsWithCounts = (clinicsData || []).map((clinic) => ({
        ...clinic,
        activeDoctorCount: countMap[clinic.id] || 0,
      }));

      setClinics(clinicsWithCounts);
      setFilteredClinics(clinicsWithCounts);
    } catch (error: any) {
      toast.error("Failed to fetch clinics: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateClinic = async (clinicId: string, status: string, doctorLimit: number) => {
    try {
      // Get the original status before update
      const originalClinic = clinics.find(c => c.id === clinicId);
      const originalStatus = originalClinic?.status;

      const { error } = await supabase.from("clinics").update({ 
        status, 
        requested_doctors: doctorLimit,
        updated_at: new Date().toISOString() 
      }).eq("id", clinicId);
      if (error) throw error;

      // Send email notification if status changed to active or suspended
      if (originalStatus !== status && (status === "active" || status === "suspended") && originalClinic?.profile?.email) {
        try {
          await supabase.functions.invoke("send-clinic-status-email", {
            body: {
              clinicName: originalClinic.clinic_name,
              email: originalClinic.profile.email,
              ownerName: originalClinic.profile.full_name || "Clinic Owner",
              status: status,
            },
          });
          console.log("Status notification email sent");
        } catch (emailError) {
          console.error("Failed to send status email:", emailError);
        }
      }

      toast.success("Clinic updated successfully");
      fetchClinics();
      setIsDetailOpen(false);
    } catch (error: any) {
      toast.error("Failed to update clinic: " + error.message);
    }
  };

  const handleDeleteClinic = async () => {
    if (!clinicToDelete) return;
    setIsDeleting(true);
    try {
      const clinicId = clinicToDelete.id;
      await supabase.from("clinic_allergies").delete().eq("clinic_id", clinicId);
      await supabase.from("clinic_diseases").delete().eq("clinic_id", clinicId);
      await supabase.from("clinic_icd_codes").delete().eq("clinic_id", clinicId);
      await supabase.from("specializations").delete().eq("clinic_id", clinicId);
      await supabase.from("clinic_payments").delete().eq("clinic_id", clinicId);
      await supabase.from("clinic_expenses").delete().eq("clinic_id", clinicId);
      await supabase.from("support_tickets").delete().eq("clinic_id", clinicId);
      const { data: doctors } = await supabase.from("doctors").select("id").eq("clinic_id", clinicId);
      if (doctors && doctors.length > 0) {
        const doctorIds = doctors.map((d) => d.id);
        for (const doctorId of doctorIds) {
          await supabase.from("doctor_schedules").delete().eq("doctor_id", doctorId);
          await supabase.from("doctor_leaves").delete().eq("doctor_id", doctorId);
          await supabase.from("doctor_disease_templates").delete().eq("doctor_id", doctorId);
          await supabase.from("doctor_test_templates").delete().eq("doctor_id", doctorId);
          await supabase.from("doctor_report_templates").delete().eq("doctor_id", doctorId);
          await supabase.from("procedures").delete().eq("doctor_id", doctorId);
          await supabase.from("wait_list").delete().eq("doctor_id", doctorId);
          const { data: patients } = await supabase.from("patients").select("id").eq("created_by", doctorId);
          if (patients && patients.length > 0) {
            const patientIds = patients.map((p) => p.id);
            await supabase.from("appointments").delete().in("patient_id", patientIds);
            await supabase.from("visit_records").delete().in("patient_id", patientIds);
            await supabase.from("medical_records").delete().in("patient_id", patientIds);
            await supabase.from("prescriptions").delete().in("patient_id", patientIds);
            await supabase.from("medical_documents").delete().in("patient_id", patientIds);
            await supabase.from("patients").delete().in("id", patientIds);
          }
          await supabase.from("appointments").delete().eq("doctor_id", doctorId);
          await supabase.from("visit_records").delete().eq("doctor_id", doctorId);
          await supabase.from("medical_records").delete().eq("doctor_id", doctorId);
          await supabase.from("prescriptions").delete().eq("doctor_id", doctorId);
        }
        await supabase.from("doctors").delete().eq("clinic_id", clinicId);
        await supabase.from("user_roles").delete().in("user_id", doctorIds);
        await supabase.from("profiles").delete().in("id", doctorIds);
        for (const doctorId of doctorIds) {
          await supabase.functions.invoke("delete-user", { body: { userId: doctorId } });
        }
      }
      const { data: receptionists } = await supabase.from("clinic_receptionists").select("user_id").eq("clinic_id", clinicId);
      if (receptionists && receptionists.length > 0) {
        const receptionistIds = receptionists.map((r) => r.user_id);
        await supabase.from("clinic_receptionists").delete().eq("clinic_id", clinicId);
        await supabase.from("user_roles").delete().in("user_id", receptionistIds);
        await supabase.from("profiles").delete().in("id", receptionistIds);
        for (const receptionistId of receptionistIds) {
          await supabase.functions.invoke("delete-user", { body: { userId: receptionistId } });
        }
      }
      await supabase.from("user_roles").delete().eq("user_id", clinicId);
      const { error: clinicError } = await supabase.from("clinics").delete().eq("id", clinicId);
      if (clinicError) throw clinicError;
      await supabase.from("profiles").delete().eq("id", clinicId);
      await supabase.functions.invoke("delete-user", { body: { userId: clinicId } });
      toast.success("Clinic and all related data deleted successfully");
      setIsDeleteOpen(false);
      setClinicToDelete(null);
      fetchClinics();
    } catch (error: any) {
      toast.error("Failed to delete clinic: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "draft": return <Badge className="bg-yellow-500">Pending</Badge>;
      case "suspended": return <Badge className="bg-red-500">Suspended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };


  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClinics = filteredClinics.slice(startIndex, startIndex + itemsPerPage);
  const totalClinics = clinics.length;
  const activeClinics = clinics.filter((c) => c.status === "active").length;
  const pendingClinics = clinics.filter((c) => c.status === "draft").length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clinic Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Clinics</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalClinics}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Clinics</CardTitle><CheckCircle2 className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeClinics}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending Clinics</CardTitle><Clock className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{pendingClinics}</div></CardContent></Card>
      </div>
      <Card><CardContent className="pt-6"><div className="flex flex-wrap gap-4 items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by clinic name, city, email, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Status:</span><Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Pending</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select></div></div>{searchQuery && <p className="text-sm text-muted-foreground mt-2">Found {filteredClinics.length} clinic{filteredClinics.length !== 1 ? "s" : ""}</p>}</CardContent></Card>
      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Clinic Name</TableHead><TableHead>Email</TableHead><TableHead>City</TableHead><TableHead>Status</TableHead><TableHead>Trial Status</TableHead><TableHead>Doctors</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{paginatedClinics.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{searchQuery ? "No clinics found matching your search" : "No clinics found"}</TableCell></TableRow> : paginatedClinics.map((clinic) => { const trialDays = getTrialDaysRemaining(clinic.trial_end_date); return (<TableRow key={clinic.id}><TableCell className="font-medium">{clinic.clinic_name}</TableCell><TableCell>{clinic.profile?.email || "N/A"}</TableCell><TableCell>{clinic.city}</TableCell><TableCell>{getStatusBadge(clinic.status)}</TableCell><TableCell>{trialDays !== null ? (trialDays <= 0 ? <Badge variant="destructive">Expired</Badge> : <Badge variant="outline">{trialDays} days left</Badge>) : <span className="text-muted-foreground">N/A</span>}</TableCell><TableCell>{clinic.activeDoctorCount ?? 0} / {clinic.requested_doctors}</TableCell><TableCell><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setSelectedClinic(clinic); setIsDetailOpen(true); }}><Eye className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={() => { setClinicToDelete(clinic); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>);})}</TableBody></Table><TablePagination currentPage={currentPage} totalPages={totalPages} pageSize={itemsPerPage} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }} /></CardContent></Card>
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{selectedClinic?.clinic_name}</DialogTitle><DialogDescription>Clinic details and management</DialogDescription></DialogHeader>{selectedClinic && <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium text-muted-foreground">Email</label><p>{selectedClinic.profile?.email || "N/A"}</p></div><div><label className="text-sm font-medium text-muted-foreground">Phone</label><p>{selectedClinic.phone_number}</p></div><div><label className="text-sm font-medium text-muted-foreground">City</label><p>{selectedClinic.city}</p></div><div><label className="text-sm font-medium text-muted-foreground">Address</label><p>{selectedClinic.address}</p></div><div><label className="text-sm font-medium text-muted-foreground">Registered On</label><p>{format(new Date(selectedClinic.created_at), "PPP")}</p></div><div><label className="text-sm font-medium text-muted-foreground">Doctors ({selectedClinic.activeDoctorCount ?? 0} / {selectedClinic.requested_doctors})</label><p>Monthly Fee: PKR {(selectedClinic.requested_doctors * doctorMonthlyFee).toLocaleString()}</p></div><div><label className="text-sm font-medium text-muted-foreground">Trial Status</label><p className={getTrialDaysRemaining(selectedClinic.trial_end_date) !== null && getTrialDaysRemaining(selectedClinic.trial_end_date)! <= 0 ? "text-destructive font-semibold" : ""}>{getTrialDaysRemaining(selectedClinic.trial_end_date) !== null ? (getTrialDaysRemaining(selectedClinic.trial_end_date)! <= 0 ? "Expired" : `${getTrialDaysRemaining(selectedClinic.trial_end_date)} days left`) : "N/A"}</p></div><div><label className="text-sm font-medium text-muted-foreground">Trial End Date</label><p>{selectedClinic.trial_end_date ? format(new Date(selectedClinic.trial_end_date), "PPP") : "N/A"}</p></div></div>{getTrialDaysRemaining(selectedClinic.trial_end_date) !== null && getTrialDaysRemaining(selectedClinic.trial_end_date)! <= 0 && selectedClinic.status === "active" && (<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"><p className="text-sm text-destructive font-medium mb-2">⚠️ Trial has expired. Click "End Trial" to suspend this clinic's access.</p><Button variant="destructive" size="sm" onClick={() => { setSelectedClinic({ ...selectedClinic, status: "suspended" }); }}>End Trial</Button></div>)}<div><label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label><Select value={selectedClinic.status} onValueChange={(value) => setSelectedClinic({ ...selectedClinic, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Pending</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select></div><div><label className="text-sm font-medium text-muted-foreground mb-2 block">Doctor Limit</label><Input type="number" min={1} value={selectedClinic.requested_doctors} onChange={(e) => { const newLimit = parseInt(e.target.value) || 1; setSelectedClinic({ ...selectedClinic, requested_doctors: newLimit }); }} className="w-24" /></div><div className="flex justify-end pt-4"><Button onClick={() => updateClinic(selectedClinic.id, selectedClinic.status, selectedClinic.requested_doctors)}>Update</Button></div></div>}</DialogContent></Dialog>
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Clinic</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{clinicToDelete?.clinic_name}"? This action cannot be undone and will permanently delete the clinic along with all associated data including doctors, patients, appointments, and records.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteClinic} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete Clinic"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
};

export default AdminClinics;
