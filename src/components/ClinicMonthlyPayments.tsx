import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, startOfMonth, subMonths, addMonths } from "date-fns";
import { Check, X, Plus, CreditCard } from "lucide-react";

interface ClinicPayment {
  id: string;
  clinic_id: string;
  month: string;
  amount: number;
  doctor_count: number;
  status: string;
  payment_date: string | null;
  notes: string | null;
}

interface ClinicMonthlyPaymentsProps {
  clinicId: string;
  doctorCount: number;
  doctorLimit: number;
  monthlyFeePerDoctor: number;
  clinicCreatedAt: string;
  onPaymentUpdate?: () => void;
}

const ClinicMonthlyPayments = ({
  clinicId,
  doctorCount,
  doctorLimit,
  monthlyFeePerDoctor,
  clinicCreatedAt,
  onPaymentUpdate,
}: ClinicMonthlyPaymentsProps) => {
  const [payments, setPayments] = useState<ClinicPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [clinicId]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clinic_payments")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("month", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch payments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthsToShow = () => {
    const months: string[] = [];
    const today = new Date();
    const currentMonth = startOfMonth(today);
    const registrationMonth = startOfMonth(new Date(clinicCreatedAt));
    
    // Show months from registration date to current month
    let month = currentMonth;
    while (month >= registrationMonth) {
      months.push(format(month, "yyyy-MM-dd"));
      month = subMonths(month, 1);
    }
    
    return months;
  };

  const getPaymentForMonth = (month: string) => {
    return payments.find((p) => p.month === month);
  };

  const addPaymentRecord = async (month: string) => {
    // Use doctor limit (minimum 1) for billing, not just active doctor count
    const billableDoctors = Math.max(doctorLimit, 1);
    const amount = billableDoctors * monthlyFeePerDoctor;
    
    try {
      const { error } = await supabase.from("clinic_payments").insert({
        clinic_id: clinicId,
        month: month,
        amount: amount,
        doctor_count: doctorCount,
        status: "pending",
      });

      if (error) throw error;
      toast.success("Payment record added");
      fetchPayments();
      onPaymentUpdate?.();
    } catch (error: any) {
      toast.error("Failed to add payment: " + error.message);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

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
      toast.success(`Payment marked as ${status}`);
      fetchPayments();
      onPaymentUpdate?.();
    } catch (error: any) {
      toast.error("Failed to update payment: " + error.message);
    }
  };

  const months = generateMonthsToShow();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium text-sm">Monthly Payment History</h4>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Month</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {months.map((month) => {
              const payment = getPaymentForMonth(month);
              const monthDate = new Date(month);
              const expectedAmount = doctorCount * monthlyFeePerDoctor;

              return (
                <TableRow key={month}>
                  <TableCell className="text-sm py-2">
                    {format(monthDate, "MMMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm py-2">
                    {payment ? (
                      `PKR ${payment.amount.toLocaleString()}`
                    ) : (
                      <span className="text-muted-foreground">
                        PKR {(Math.max(doctorLimit, 1) * monthlyFeePerDoctor).toLocaleString()}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {payment ? (
                      payment.status === "paid" ? (
                        <Badge className="bg-green-500 text-xs">Paid</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-600 text-xs">
                          Pending
                        </Badge>
                      )
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {payment ? (
                      <Select
                        value={payment.status}
                        onValueChange={(value) => updatePaymentStatus(payment.id, value)}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => addPaymentRecord(month)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Rate: PKR {monthlyFeePerDoctor.toLocaleString()} × {Math.max(doctorLimit, 1)} doctor(s) = PKR{" "}
        {(Math.max(doctorLimit, 1) * monthlyFeePerDoctor).toLocaleString()}/month
      </p>
    </div>
  );
};

export default ClinicMonthlyPayments;
