import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, DollarSign, Calendar, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface DoctorRevenue {
  doctor_id: string;
  doctor_name: string;
  consultation_fees: number;
  other_fees: number;
  total_revenue: number;
  appointments_count: number;
}

export default function ClinicFinance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [revenues, setRevenues] = useState<DoctorRevenue[]>([]);
  const [dateRange, setDateRange] = useState<"month" | "year" | "all">("month");
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchRevenue();
  }, [dateRange]);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get date range
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (dateRange === "month") {
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
      } else if (dateRange === "year") {
        startDate = startOfYear(new Date());
        endDate = endOfYear(new Date());
      }

      // Fetch doctors from this clinic
      const { data: doctors, error: doctorsError } = await supabase
        .from("doctors")
        .select("id, profiles(full_name)")
        .eq("clinic_id", user.id);

      if (doctorsError) throw doctorsError;

      // Fetch appointments with fees for each doctor
      const revenueData: DoctorRevenue[] = [];

      for (const doctor of doctors || []) {
        let query = supabase
          .from("appointments")
          .select("consultation_fee, other_fee")
          .eq("doctor_id", doctor.id)
          .eq("status", "completed");

        if (startDate && endDate) {
          query = query
            .gte("appointment_date", format(startDate, "yyyy-MM-dd"))
            .lte("appointment_date", format(endDate, "yyyy-MM-dd"));
        }

        const { data: appointments, error: appointmentsError } = await query;

        if (appointmentsError) throw appointmentsError;

        const consultationFees = appointments?.reduce((sum, apt) => sum + (Number(apt.consultation_fee) || 0), 0) || 0;
        const otherFees = appointments?.reduce((sum, apt) => sum + (Number(apt.other_fee) || 0), 0) || 0;

        revenueData.push({
          doctor_id: doctor.id,
          doctor_name: doctor.profiles?.full_name || "Unknown Doctor",
          consultation_fees: consultationFees,
          other_fees: otherFees,
          total_revenue: consultationFees + otherFees,
          appointments_count: appointments?.length || 0,
        });
      }

      setRevenues(revenueData);
      setTotalRevenue(revenueData.reduce((sum, rev) => sum + rev.total_revenue, 0));
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

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "month":
        return format(new Date(), "MMMM yyyy");
      case "year":
        return format(new Date(), "yyyy");
      case "all":
        return "All Time";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">Track revenue across all doctors</p>
        </div>
        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Total Revenue Card */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-6 w-6" />
            Total Revenue
          </CardTitle>
          <CardDescription className="text-green-100">
            {getDateRangeLabel()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            PKR {totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      {/* Doctor Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {revenues.map((revenue) => (
          <Card key={revenue.doctor_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                {revenue.doctor_name}
              </CardTitle>
              <CardDescription>
                {revenue.appointments_count} completed appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consultation Fees:</span>
                <span className="font-semibold">
                  PKR {revenue.consultation_fees.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other Fees:</span>
                <span className="font-semibold">
                  PKR {revenue.other_fees.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-semibold text-base">Total Revenue:</span>
                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                  PKR {revenue.total_revenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {revenues.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No revenue data available for the selected period.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
