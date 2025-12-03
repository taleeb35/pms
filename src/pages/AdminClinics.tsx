import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock, CheckCircle2, MapPin, Phone, Mail, Users, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Clinic {
  id: string;
  clinic_name: string;
  city: string;
  phone_number: string;
  address: string;
  no_of_doctors: number;
  requested_doctors: number;
  status: string;
  fee_status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [doctorMonthlyFee, setDoctorMonthlyFee] = useState<number>(0);
  const [editingDoctorLimit, setEditingDoctorLimit] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClinics();
    fetchDoctorFee();
  }, []);

  const fetchDoctorFee = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "doctor_monthly_fee")
      .maybeSingle();

    if (data) {
      setDoctorMonthlyFee(Number(data.value) || 0);
    }
  };

  const fetchClinics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinics")
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch doctor counts for each clinic
      const clinicsWithCounts = await Promise.all(
        data.map(async (clinic) => {
          const { count } = await supabase
            .from("doctors")
            .select("id", { count: "exact", head: true })
            .eq("clinic_id", clinic.id);
          return { ...clinic, no_of_doctors: count || 0 };
        })
      );
      setClinics(clinicsWithCounts);
    }
    setLoading(false);
  };

  const updateClinicStatus = async (clinicId: string, newStatus: string) => {
    setUpdating(clinicId);
    const { error } = await supabase
      .from("clinics")
      .update({ status: newStatus })
      .eq("id", clinicId);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Clinic status changed to ${newStatus}`,
      });
      fetchClinics();
    }
    setUpdating(null);
  };

  const updateFeeStatus = async (clinicId: string, newFeeStatus: string) => {
    setUpdating(clinicId);
    
    // Update clinics table
    const { error } = await supabase
      .from("clinics")
      .update({ fee_status: newFeeStatus })
      .eq("id", clinicId);

    if (error) {
      toast({
        title: "Error updating fee status",
        description: error.message,
        variant: "destructive",
      });
      setUpdating(null);
      return;
    }

    // Also sync with clinic_payments for current month
    const currentMonth = format(new Date(), "yyyy-MM-01");
    const paymentStatus = newFeeStatus === "paid" ? "paid" : "pending";
    const updateData: any = { status: paymentStatus };
    if (paymentStatus === "paid") {
      updateData.payment_date = new Date().toISOString();
    } else {
      updateData.payment_date = null;
    }

    await supabase
      .from("clinic_payments")
      .update(updateData)
      .eq("clinic_id", clinicId)
      .eq("month", currentMonth);

    toast({
      title: "Fee status updated",
      description: `Payment status changed to ${newFeeStatus}`,
    });
    fetchClinics();
    setUpdating(null);
  };

  const updateDoctorLimit = async (clinicId: string, newLimit: number) => {
    if (newLimit < 1) {
      toast({
        title: "Invalid Limit",
        description: "Doctor limit must be at least 1",
        variant: "destructive",
      });
      return;
    }

    setUpdating(clinicId);
    const { error } = await supabase
      .from("clinics")
      .update({ requested_doctors: newLimit })
      .eq("id", clinicId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update doctor limit",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Doctor limit updated to ${newLimit} successfully`,
      });
      fetchClinics();
      if (selectedClinic && selectedClinic.id === clinicId) {
        setSelectedClinic({ ...selectedClinic, requested_doctors: newLimit });
      }
    }
    setUpdating(null);
    setEditingDoctorLimit(null);
  };

  const deleteClinic = async () => {
    if (!clinicToDelete) return;
    
    setDeleting(true);
    
    // First get the count of doctors and patients that will be deleted
    const { count: doctorCount } = await supabase
      .from("doctors")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicToDelete.id);

    const { data: doctors } = await supabase
      .from("doctors")
      .select("id")
      .eq("clinic_id", clinicToDelete.id);

    let patientCount = 0;
    if (doctors && doctors.length > 0) {
      const doctorIds = doctors.map(d => d.id);
      const { count } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .in("created_by", doctorIds);
      patientCount = count || 0;
    }

    // Delete the clinic (cascade will handle doctors and patients)
    const { error } = await supabase
      .from("clinics")
      .delete()
      .eq("id", clinicToDelete.id);

    if (error) {
      console.error("Clinic deletion error:", error);
      toast({
        title: "Error deleting clinic",
        description: error.message,
        variant: "destructive",
      });
      setDeleting(false);
      setClinicToDelete(null);
      return;
    }

    // Immediately update local state without waiting for refetch
    setClinics(prevClinics => prevClinics.filter(c => c.id !== clinicToDelete.id));
    
    toast({
      title: "Clinic deleted successfully",
      description: `Deleted 1 clinic, ${doctorCount || 0} doctors, and ${patientCount} patients`,
    });
    
    setSelectedClinic(null);
    setDeleting(false);
    setClinicToDelete(null);
  };

  const stats = {
    total: clinics.length,
    active: clinics.filter(c => c.status === 'active').length,
    draft: clinics.filter(c => c.status === 'draft').length,
  };

  // Pagination logic
  const totalPages = Math.ceil(clinics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClinics = clinics.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Manage Clinics</h2>
        <p className="text-muted-foreground text-base">
          Review and approve clinic registrations, manage clinic status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clinics</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Clinics Table */}
      <Card className="border-border/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            All Clinics
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="45">45</SelectItem>
                <SelectItem value="60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading clinics...</p>
          ) : clinics.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No clinics registered yet</p>
          ) : (
            <>
              <div className="rounded-md border border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Clinic Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">City</TableHead>
                      <TableHead className="font-semibold text-center">Requested</TableHead>
                      <TableHead className="font-semibold text-center">Created</TableHead>
                      <TableHead className="font-semibold text-center">Monthly Fee</TableHead>
                      <TableHead className="font-semibold">Fee Status</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentClinics.map((clinic) => (
                      <TableRow 
                        key={clinic.id} 
                        className="hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedClinic(clinic)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{clinic.clinic_name}</p>
                            <p className="text-xs text-muted-foreground">{clinic.profiles?.full_name || "Unknown"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{clinic.profiles?.email || "N/A"}</TableCell>
                        <TableCell className="text-sm">{clinic.phone_number}</TableCell>
                        <TableCell className="text-sm">{clinic.city}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-semibold text-primary border-primary/30">
                            {clinic.requested_doctors}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-semibold">
                            {clinic.no_of_doctors}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className="font-semibold bg-success text-white">
                            PKR {(doctorMonthlyFee * clinic.requested_doctors).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={clinic.fee_status}
                            onValueChange={(value) => updateFeeStatus(clinic.id, value)}
                            disabled={updating === clinic.id}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue>
                                {clinic.fee_status === "paid" && (
                                  <span className="flex items-center gap-1 text-success">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Paid
                                  </span>
                                )}
                                {clinic.fee_status === "unpaid" && (
                                  <span className="flex items-center gap-1 text-destructive">
                                    <Clock className="h-3 w-3" />
                                    Unpaid
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-destructive" />
                                  Unpaid
                                </span>
                              </SelectItem>
                              <SelectItem value="paid">
                                <span className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                  Paid
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={clinic.status}
                            onValueChange={(value) => updateClinicStatus(clinic.id, value)}
                            disabled={updating === clinic.id}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue>
                                {clinic.status === "active" && (
                                  <span className="flex items-center gap-1 text-success">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Active
                                  </span>
                                )}
                                {clinic.status === "draft" && (
                                  <span className="flex items-center gap-1 text-warning">
                                    <Clock className="h-3 w-3" />
                                    Draft
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-warning" />
                                  Draft
                                </span>
                              </SelectItem>
                              <SelectItem value="active">
                                <span className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                  Active
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(clinic.created_at), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, clinics.length)} of {clinics.length} clinics
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <PaginationItem key={page}>...</PaginationItem>;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Clinic Details Modal */}
      <Dialog open={!!selectedClinic} onOpenChange={() => {
        setSelectedClinic(null);
        setEditingDoctorLimit(null);
      }}>
        <DialogContent className="max-w-3xl animate-scale-in">
          {selectedClinic && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold mb-1">
                      {selectedClinic.clinic_name}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Managed by {selectedClinic.profiles?.full_name || "Unknown"}
                    </DialogDescription>
                  </div>
                  {selectedClinic.status === "active" ? (
                    <Badge className="bg-success/10 text-success border-success/20 px-3 py-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-warning/10 text-warning border-warning/20 px-3 py-1">
                      <Clock className="h-4 w-4 mr-1" />
                      Pending Approval
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contact Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="font-medium">{selectedClinic.profiles.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <p className="font-medium">{selectedClinic.phone_number}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </h3>
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <p className="font-medium mb-1">{selectedClinic.address}</p>
                    <p className="text-sm text-muted-foreground">{selectedClinic.city}</p>
                  </div>
                </div>

                {/* Doctor Statistics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Doctor Statistics & Billing
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-transparent">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Requested Doctors</p>
                          <p className="text-4xl font-bold text-primary">{selectedClinic.requested_doctors}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/40 bg-gradient-to-br from-success/5 to-transparent">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Doctors Created</p>
                          <p className="text-4xl font-bold text-success">{selectedClinic.no_of_doctors}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/40 bg-gradient-to-br from-amber-500/5 to-transparent">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Monthly Fee</p>
                          <p className="text-3xl font-bold text-amber-600">
                            PKR {(doctorMonthlyFee * selectedClinic.requested_doctors).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedClinic.requested_doctors} × PKR {doctorMonthlyFee.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="bg-accent/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Registered On</p>
                    <p className="font-semibold">{format(new Date(selectedClinic.created_at), "MMMM dd, yyyy 'at' HH:mm")}</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground min-w-[120px]">Doctor Limit:</span>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="number"
                        min="1"
                        value={editingDoctorLimit !== null ? editingDoctorLimit : selectedClinic.requested_doctors}
                        onChange={(e) => setEditingDoctorLimit(parseInt(e.target.value) || 1)}
                        className="w-[120px]"
                        disabled={updating === selectedClinic.id}
                      />
                      {editingDoctorLimit !== null && editingDoctorLimit !== selectedClinic.requested_doctors && (
                        <Button
                          size="sm"
                          onClick={() => updateDoctorLimit(selectedClinic.id, editingDoctorLimit)}
                          disabled={updating === selectedClinic.id}
                        >
                          Update
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        (Currently using {selectedClinic.no_of_doctors})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground min-w-[120px]">Change Status:</span>
                    <Select
                      value={selectedClinic.status}
                      onValueChange={(value) => {
                        updateClinicStatus(selectedClinic.id, value);
                        setSelectedClinic({ ...selectedClinic, status: value });
                      }}
                      disabled={updating === selectedClinic.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-warning" />
                            Draft
                          </span>
                        </SelectItem>
                        <SelectItem value="active">
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            Active
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground min-w-[120px]">Fee Status:</span>
                    <Select
                      value={selectedClinic.fee_status}
                      onValueChange={(value) => {
                        updateFeeStatus(selectedClinic.id, value);
                        setSelectedClinic({ ...selectedClinic, fee_status: value });
                      }}
                      disabled={updating === selectedClinic.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-destructive" />
                            Unpaid
                          </span>
                        </SelectItem>
                        <SelectItem value="paid">
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            Paid
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Delete Clinic Button */}
                <div className="pt-6 border-t border-border/40 mt-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClinicToDelete(selectedClinic);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Clinic Permanently
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    ⚠️ This will delete all doctors and patients associated with this clinic
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clinicToDelete} onOpenChange={() => setClinicToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Clinic - Permanent Action
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <p className="font-semibold text-foreground">
                Are you absolutely sure you want to delete "{clinicToDelete?.clinic_name}"?
              </p>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-destructive flex items-center gap-2">
                  ⚠️ Warning: Cascade Deletion
                </p>
                <p className="text-sm">This action will permanently delete:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>The clinic record</li>
                  <li>All doctors associated with this clinic</li>
                  <li>All patients created by those doctors</li>
                  <li>All appointments for those patients</li>
                  <li>All medical records, prescriptions, and documents</li>
                </ul>
              </div>

              <p className="text-sm font-semibold">
                This action cannot be undone. All data will be permanently lost.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteClinic}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Yes, Delete Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminClinics;
