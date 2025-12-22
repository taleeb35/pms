import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, CheckCircle2, Clock, Building2, Calendar, RefreshCw, Users, Search, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, subMonths } from "date-fns";

interface ClinicPayment {
  id: string;
  clinic_id: string;
  month: string;
  amount: number;
  doctor_count: number;
  status: string;
  payment_date: string | null;
  notes: string | null;
  clinic: {
    clinic_name: string;
    requested_doctors: number;
    profiles: {
      email: string;
      phone: string | null;
    };
  };
}

interface DoctorPayment {
  id: string;
  doctor_id: string;
  month: string;
  amount: number;
  status: string;
  payment_date: string | null;
  notes: string | null;
  doctor: {
    profiles: {
      full_name: string;
      email: string;
      phone: string | null;
    };
    specialization: string;
    city: string | null;
  };
}

const AdminFinance = () => {
  const [clinicPayments, setClinicPayments] = useState<ClinicPayment[]>([]);
  const [doctorPayments, setDoctorPayments] = useState<DoctorPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [doctorMonthlyFee, setDoctorMonthlyFee] = useState(0);
  const [singleDoctorFee, setSingleDoctorFee] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("clinics");
  const { toast } = useToast();

  // Generate last 12 months for dropdown
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(startOfMonth(date), "yyyy-MM-dd"),
      label: format(date, "MMMM yyyy"),
    };
  });

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (doctorMonthlyFee > 0 || singleDoctorFee > 0) {
      fetchPayments();
    }
  }, [selectedMonth, doctorMonthlyFee, singleDoctorFee]);

  const fetchSystemSettings = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["doctor_monthly_fee", "single_doctor_fee"]);

    if (data) {
      data.forEach(setting => {
        if (setting.key === "doctor_monthly_fee") {
          setDoctorMonthlyFee(parseFloat(setting.value) || 0);
        } else if (setting.key === "single_doctor_fee") {
          setSingleDoctorFee(parseFloat(setting.value) || 0);
        }
      });
      // Default single doctor fee to same as clinic doctor fee if not set
      if (!data.find(s => s.key === "single_doctor_fee")) {
        const clinicFee = data.find(s => s.key === "doctor_monthly_fee");
        if (clinicFee) {
          setSingleDoctorFee(parseFloat(clinicFee.value) || 0);
        }
      }
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchClinicPayments(), fetchDoctorPayments()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicPayments = async () => {
    try {
      // Get all active clinics
      const { data: clinics, error: clinicsError } = await supabase
        .from("clinics")
        .select(`
          id,
          clinic_name,
          requested_doctors,
          created_at,
          profiles(email, phone)
        `)
        .eq("status", "active");

      if (clinicsError) throw clinicsError;

      // Filter clinics registered before selected month
      const selectedMonthEnd = new Date(selectedMonth);
      selectedMonthEnd.setMonth(selectedMonthEnd.getMonth() + 1);
      selectedMonthEnd.setDate(0);
      
      const eligibleClinics = (clinics || []).filter(clinic => {
        const clinicCreatedAt = new Date(clinic.created_at);
        return clinicCreatedAt <= selectedMonthEnd;
      });

      // Fetch existing payments for selected month
      const { data: existingPayments, error: paymentsError } = await supabase
        .from("clinic_payments")
        .select("*")
        .eq("month", selectedMonth);

      if (paymentsError) throw paymentsError;

      const paymentsMap = new Map(existingPayments?.map(p => [p.clinic_id, p]) || []);
      
      const allPayments: ClinicPayment[] = [];
      
      for (const clinic of eligibleClinics) {
        const { count: doctorCount } = await supabase
          .from("doctors")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinic.id);

        const existingPayment = paymentsMap.get(clinic.id);
        
        if (existingPayment) {
          allPayments.push({
            ...existingPayment,
            clinic: clinic as any,
          });
        } else {
          const amount = (doctorCount || 0) * doctorMonthlyFee;
          const { data: newPayment, error: insertError } = await supabase
            .from("clinic_payments")
            .insert({
              clinic_id: clinic.id,
              month: selectedMonth,
              amount,
              doctor_count: doctorCount || 0,
              status: "pending",
            })
            .select()
            .single();

          if (!insertError && newPayment) {
            allPayments.push({
              ...newPayment,
              clinic: clinic as any,
            });
          }
        }
      }

      setClinicPayments(allPayments);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchDoctorPayments = async () => {
    try {
      // Get all single doctors (without clinic)
      const { data: doctors, error: doctorsError } = await supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          city,
          created_at,
          profiles(full_name, email, phone)
        `)
        .is("clinic_id", null)
        .eq("approved", true);

      if (doctorsError) throw doctorsError;

      // Filter doctors registered before selected month
      const selectedMonthEnd = new Date(selectedMonth);
      selectedMonthEnd.setMonth(selectedMonthEnd.getMonth() + 1);
      selectedMonthEnd.setDate(0);
      
      const eligibleDoctors = (doctors || []).filter(doctor => {
        const doctorCreatedAt = new Date(doctor.created_at);
        return doctorCreatedAt <= selectedMonthEnd;
      });

      // Fetch existing payments for selected month
      const { data: existingPayments, error: paymentsError } = await supabase
        .from("doctor_payments")
        .select("*")
        .eq("month", selectedMonth);

      if (paymentsError) throw paymentsError;

      const paymentsMap = new Map(existingPayments?.map(p => [p.doctor_id, p]) || []);
      
      const allPayments: DoctorPayment[] = [];
      
      for (const doctor of eligibleDoctors) {
        const existingPayment = paymentsMap.get(doctor.id);
        
        if (existingPayment) {
          allPayments.push({
            ...existingPayment,
            doctor: doctor as any,
          });
        } else {
          const amount = singleDoctorFee || doctorMonthlyFee;
          const { data: newPayment, error: insertError } = await supabase
            .from("doctor_payments")
            .insert({
              doctor_id: doctor.id,
              month: selectedMonth,
              amount,
              status: "pending",
            })
            .select()
            .single();

          if (!insertError && newPayment) {
            allPayments.push({
              ...newPayment,
              doctor: doctor as any,
            });
          }
        }
      }

      setDoctorPayments(allPayments);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateClinicPaymentStatus = async (paymentId: string, clinicId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === "paid") {
        updateData.payment_date = new Date().toISOString();
      } else {
        updateData.payment_date = null;
      }

      const { error } = await supabase
        .from("clinic_payments")
        .update(updateData)
        .eq("id", paymentId);

      if (error) throw error;

      const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");
      if (selectedMonth === currentMonth) {
        const feeStatus = status === "paid" ? "paid" : "unpaid";
        await supabase
          .from("clinics")
          .update({ fee_status: feeStatus })
          .eq("id", clinicId);
      }

      toast({
        title: "Success",
        description: `Payment marked as ${status}`,
      });

      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateDoctorPaymentStatus = async (paymentId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === "paid") {
        updateData.payment_date = new Date().toISOString();
      } else {
        updateData.payment_date = null;
      }

      const { error } = await supabase
        .from("doctor_payments")
        .update(updateData)
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment marked as ${status}`,
      });

      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Combined statistics
  const clinicPendingAmount = clinicPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const clinicPaidAmount = clinicPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const doctorPendingAmount = doctorPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const doctorPaidAmount = doctorPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  
  const totalEstimated = clinicPayments.reduce((sum, p) => sum + p.amount, 0) + doctorPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = clinicPaidAmount + doctorPaidAmount;
  const totalPending = clinicPendingAmount + doctorPendingAmount;

  // Filter clinic payments
  const filteredClinicPayments = clinicPayments.filter((payment) => {
    if (statusFilter !== "all" && payment.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const clinicName = payment.clinic?.clinic_name?.toLowerCase() || "";
    const email = payment.clinic?.profiles?.email?.toLowerCase() || "";
    const phone = payment.clinic?.profiles?.phone?.toLowerCase() || "";
    return clinicName.includes(query) || email.includes(query) || phone.includes(query);
  });

  // Filter doctor payments
  const filteredDoctorPayments = doctorPayments.filter((payment) => {
    if (statusFilter !== "all" && payment.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const doctorName = payment.doctor?.profiles?.full_name?.toLowerCase() || "";
    const email = payment.doctor?.profiles?.email?.toLowerCase() || "";
    const phone = payment.doctor?.profiles?.phone?.toLowerCase() || "";
    return doctorName.includes(query) || email.includes(query) || phone.includes(query);
  });

  // Pagination for active tab
  const currentPayments = activeTab === "clinics" ? filteredClinicPayments : filteredDoctorPayments;
  const totalPages = Math.ceil(currentPayments.length / itemsPerPage);
  const paginatedPayments = currentPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Tracking</h1>
          <p className="text-muted-foreground">Track monthly payments from clinics and single doctors</p>
        </div>
        <Button onClick={fetchPayments} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Estimated</CardTitle>
            <Banknote className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalEstimated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">For {format(new Date(selectedMonth), "MMM yyyy")}</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">For {format(new Date(selectedMonth), "MMM yyyy")}</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
            <Clock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">For {format(new Date(selectedMonth), "MMM yyyy")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/40">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="75">75</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="clinics" className="gap-2">
            <Building2 className="h-4 w-4" />
            Clinics ({clinicPayments.length})
          </TabsTrigger>
          <TabsTrigger value="doctors" className="gap-2">
            <Stethoscope className="h-4 w-4" />
            Single Doctors ({doctorPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinics">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Clinic Payments - {format(new Date(selectedMonth), "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
              ) : filteredClinicPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No clinics match your search" : "No active clinics found"}
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Clinic Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead className="text-center">Doctors</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(paginatedPayments as ClinicPayment[]).map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-accent/30">
                            <TableCell className="font-medium">{payment.clinic?.clinic_name || "N/A"}</TableCell>
                            <TableCell className="text-muted-foreground">{payment.clinic?.profiles?.email || "N/A"}</TableCell>
                            <TableCell className="text-muted-foreground">{payment.clinic?.profiles?.phone || "N/A"}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="gap-1">
                                <Users className="h-3 w-3" />
                                {payment.doctor_count}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{payment.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              {payment.status === "paid" ? (
                                <Badge className="bg-success/10 text-success border-success/20 gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Paid
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {payment.payment_date 
                                ? format(new Date(payment.payment_date), "MMM dd, yyyy")
                                : "-"
                              }
                            </TableCell>
                            <TableCell className="text-center">
                              {payment.status === "pending" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-success hover:text-success hover:bg-success/10"
                                  onClick={() => updateClinicPaymentStatus(payment.id, payment.clinic_id, "paid")}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Mark Paid
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-amber-600 hover:text-amber-600 hover:bg-amber-500/10"
                                  onClick={() => updateClinicPaymentStatus(payment.id, payment.clinic_id, "pending")}
                                >
                                  <Clock className="h-3 w-3" />
                                  Mark Pending
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Single Doctor Payments - {format(new Date(selectedMonth), "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
              ) : filteredDoctorPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No doctors match your search" : "No single doctors found"}
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doctor Name</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(paginatedPayments as DoctorPayment[]).map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-accent/30">
                            <TableCell className="font-medium">{payment.doctor?.profiles?.full_name || "N/A"}</TableCell>
                            <TableCell className="text-muted-foreground">{payment.doctor?.specialization || "N/A"}</TableCell>
                            <TableCell className="text-muted-foreground">{payment.doctor?.profiles?.email || "N/A"}</TableCell>
                            <TableCell className="text-muted-foreground">{payment.doctor?.city || "N/A"}</TableCell>
                            <TableCell className="text-right font-semibold">{payment.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              {payment.status === "paid" ? (
                                <Badge className="bg-success/10 text-success border-success/20 gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Paid
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {payment.payment_date 
                                ? format(new Date(payment.payment_date), "MMM dd, yyyy")
                                : "-"
                              }
                            </TableCell>
                            <TableCell className="text-center">
                              {payment.status === "pending" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-success hover:text-success hover:bg-success/10"
                                  onClick={() => updateDoctorPaymentStatus(payment.id, "paid")}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Mark Paid
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-amber-600 hover:text-amber-600 hover:bg-amber-500/10"
                                  onClick={() => updateDoctorPaymentStatus(payment.id, "pending")}
                                >
                                  <Clock className="h-3 w-3" />
                                  Mark Pending
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminFinance;