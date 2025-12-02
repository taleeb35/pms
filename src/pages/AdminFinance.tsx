import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote, CheckCircle2, Clock, Building2, Calendar, RefreshCw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, subMonths, addMonths } from "date-fns";

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

const AdminFinance = () => {
  const [payments, setPayments] = useState<ClinicPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [doctorMonthlyFee, setDoctorMonthlyFee] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
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
    fetchDoctorFee();
  }, []);

  useEffect(() => {
    if (doctorMonthlyFee > 0) {
      fetchPayments();
    }
  }, [selectedMonth, doctorMonthlyFee]);

  const fetchDoctorFee = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "doctor_monthly_fee")
      .single();

    if (data) {
      setDoctorMonthlyFee(parseFloat(data.value) || 0);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // First, get all active clinics
      const { data: clinics, error: clinicsError } = await supabase
        .from("clinics")
        .select(`
          id,
          clinic_name,
          requested_doctors,
          profiles(email, phone)
        `)
        .eq("status", "active");

      if (clinicsError) throw clinicsError;

      // Fetch existing payments for selected month
      const { data: existingPayments, error: paymentsError } = await supabase
        .from("clinic_payments")
        .select("*")
        .eq("month", selectedMonth);

      if (paymentsError) throw paymentsError;

      // Create payment records for clinics that don't have one for this month
      const paymentsMap = new Map(existingPayments?.map(p => [p.clinic_id, p]) || []);
      
      const allPayments: ClinicPayment[] = [];
      
      for (const clinic of clinics || []) {
        // Get actual doctor count for this clinic
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
          // Create new payment record
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

      setPayments(allPayments);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
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

  const totalPending = payments.filter(p => p.status === "pending").length;
  const totalPaid = payments.filter(p => p.status === "paid").length;
  const pendingAmount = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);

  // Pagination
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Tracking</h1>
          <p className="text-muted-foreground">Track monthly payments from clinics</p>
        </div>
        <Button onClick={fetchPayments} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clinics</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">Active clinics</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <Clock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{totalPending}</div>
            <p className="text-xs text-muted-foreground">{pendingAmount.toLocaleString()} total amount</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{totalPaid}</div>
            <p className="text-xs text-muted-foreground">{paidAmount.toLocaleString()} collected</p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doctor Fee</CardTitle>
            <Banknote className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{doctorMonthlyFee.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per doctor/month</p>
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

      {/* Payments Table */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Clinic Payments - {format(new Date(selectedMonth), "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No active clinics found</div>
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
                    {paginatedPayments.map((payment) => (
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
                              onClick={() => updatePaymentStatus(payment.id, "paid")}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Mark Paid
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-amber-600 hover:text-amber-600 hover:bg-amber-500/10"
                              onClick={() => updatePaymentStatus(payment.id, "pending")}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, payments.length)} of {payments.length} clinics
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinance;