import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AppointmentRevenue {
  id: string;
  patient_name: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_fee: number;
  other_fee: number;
  total_fee: number;
}

export default function DoctorFinance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentRevenue[]>([]);
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

      let query = supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          consultation_fee,
          other_fee,
          total_fee,
          patients(full_name, patient_id)
        `)
        .eq("doctor_id", user.id)
        .eq("status", "completed")
        .order("appointment_time", { ascending: true });

      if (selectedDate) {
        query = query.eq("appointment_date", format(selectedDate, "yyyy-MM-dd"));
      }

      const { data, error } = await query;

      if (error) throw error;

      const appointmentData: AppointmentRevenue[] = (data || []).map((apt: any) => ({
        id: apt.id,
        patient_name: apt.patients?.full_name || "Unknown",
        patient_id: apt.patients?.patient_id || "N/A",
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        consultation_fee: Number(apt.consultation_fee) || 0,
        other_fee: Number(apt.other_fee) || 0,
        total_fee: Number(apt.total_fee) || 0,
      }));

      setAppointments(appointmentData);
      setTotalRevenue(appointmentData.reduce((sum, apt) => sum + apt.total_fee, 0));
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
          <p className="text-muted-foreground">Track your revenue by date</p>
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
            <DollarSign className="h-6 w-6" />
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

      {/* Appointments Revenue Listing */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments Revenue</CardTitle>
          <CardDescription>
            Revenue breakdown for each appointment on {selectedDate ? format(selectedDate, "PPP") : "selected date"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No completed appointments found for this date.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Consultation Fee</TableHead>
                  <TableHead className="text-right">Other Fee</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{apt.patient_name}</TableCell>
                    <TableCell>{apt.patient_id}</TableCell>
                    <TableCell>{apt.appointment_time}</TableCell>
                    <TableCell className="text-right">
                      {apt.consultation_fee.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.other_fee.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                      {apt.total_fee.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
