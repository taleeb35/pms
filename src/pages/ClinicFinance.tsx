import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Calendar as CalendarIcon, User, Banknote } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchRevenue();
  }, [selectedDate]);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

        if (selectedDate) {
          query = query.eq("appointment_date", format(selectedDate, "yyyy-MM-dd"));
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
          <p className="text-muted-foreground">Track revenue by date for each doctor</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Total Revenue Card */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Banknote className="h-6 w-6" />
            Total Revenue
          </CardTitle>
          <CardDescription className="text-green-100">
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  {revenue.consultation_fees.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other Fees:</span>
                <span className="font-semibold">
                  {revenue.other_fees.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-semibold text-base">Total Revenue:</span>
                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                  {revenue.total_revenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
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
