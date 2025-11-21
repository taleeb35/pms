import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Printer } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VisitHistory } from "./VisitHistory";

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  patients: { 
    full_name: string; 
    patient_id: string;
    date_of_birth: string;
  };
}

interface VisitRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const VisitRecordDialog = ({ open, onOpenChange, appointment }: VisitRecordDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nextVisitDate, setNextVisitDate] = useState<Date>();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    // Vitals
    blood_pressure: "",
    temperature: "",
    pulse: "",
    weight: "",
    height: "",
    
    // Medical Info
    chief_complaint: "",
    patient_history: "",
    current_prescription: "",
    test_reports: "",
    
    // Follow-up
    next_visit_notes: "",
  });

  const [existingRecord, setExistingRecord] = useState<any>(null);

  useEffect(() => {
    if (appointment && open) {
      fetchExistingRecord();
    }
  }, [appointment, open]);

  const fetchExistingRecord = async () => {
    if (!appointment) return;

    const { data, error } = await supabase
      .from("visit_records")
      .select("*")
      .eq("appointment_id", appointment.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching visit record:", error);
      return;
    }

    if (data) {
      setExistingRecord(data);
      setFormData({
        blood_pressure: data.blood_pressure || "",
        temperature: data.temperature || "",
        pulse: data.pulse || "",
        weight: data.weight || "",
        height: data.height || "",
        chief_complaint: data.chief_complaint || "",
        patient_history: data.patient_history || "",
        current_prescription: data.current_prescription || "",
        test_reports: data.test_reports || "",
        next_visit_notes: data.next_visit_notes || "",
      });
      if (data.next_visit_date) {
        setNextVisitDate(new Date(data.next_visit_date));
      }
    }
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePrint = async () => {
    // Load letterhead URL from localStorage
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const letterheadUrl = localStorage.getItem(`letterhead_url_${user.id}`);
      if (letterheadUrl) {
        // Add letterhead background to print
        const printStyles = `
          @media print {
            body::before {
              content: "";
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: url('${letterheadUrl}');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: top center;
              opacity: 0.1;
              z-index: -1;
            }
          }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = printStyles;
        document.head.appendChild(styleSheet);
      }
    }
    
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const visitData = {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: user.id,
        ...formData,
        next_visit_date: nextVisitDate ? format(nextVisitDate, "yyyy-MM-dd") : null,
      };

      let error;
      if (existingRecord) {
        ({ error } = await supabase
          .from("visit_records")
          .update(visitData)
          .eq("id", existingRecord.id));
      } else {
        ({ error } = await supabase
          .from("visit_records")
          .insert([visitData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Visit record ${existingRecord ? 'updated' : 'saved'} successfully`,
      });

      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto print:max-w-full">
        {!appointment ? (
          <div className="p-8 text-center text-muted-foreground">
            No appointment selected
          </div>
        ) : (
          <>
            <DialogHeader className="print:hidden">
              <DialogTitle className="flex items-center justify-between">
                <span>Patient Visit Record</span>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </DialogTitle>
            </DialogHeader>

            {/* Patient Info Header */}
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="font-semibold">{appointment.patients.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-semibold">{appointment.patients.patient_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-semibold">{calculateAge(appointment.patients.date_of_birth)} years</p>
                </div>
              </div>
            </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Vitals Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Vitals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Blood Pressure</Label>
                    <Input
                      placeholder="120/80"
                      value={formData.blood_pressure}
                      onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Temperature</Label>
                    <Input
                      placeholder="98.6°F"
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Pulse</Label>
                    <Input
                      placeholder="72 bpm"
                      value={formData.pulse}
                      onChange={(e) => setFormData({...formData, pulse: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <Input
                      placeholder="70 kg"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Chief Complaint</h3>
                <Textarea
                  placeholder="Patient's main complaint or reason for visit..."
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Current Prescription */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Current Prescription</h3>
                <Textarea
                  placeholder="Medications, dosage, and instructions..."
                  value={formData.current_prescription}
                  onChange={(e) => setFormData({...formData, current_prescription: e.target.value})}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Right Column - History & Future */}
            <div className="space-y-6">
              {/* Visit History */}
              {appointment && <VisitHistory patientId={appointment.patient_id} />}

              {/* Test Reports */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Test Reports</h3>
                <Textarea
                  placeholder="Required tests, lab reports, imaging..."
                  value={formData.test_reports}
                  onChange={(e) => setFormData({...formData, test_reports: e.target.value})}
                  rows={6}
                  className="text-sm"
                />
              </div>

              {/* Future Visit */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Future Visit</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Next Visit Date</Label>
                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !nextVisitDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {nextVisitDate ? format(nextVisitDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={nextVisitDate}
                          onSelect={(date) => {
                            setNextVisitDate(date);
                            if (date) setDatePopoverOpen(false);
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Follow-up instructions..."
                      value={formData.next_visit_notes}
                      onChange={(e) => setFormData({...formData, next_visit_notes: e.target.value})}
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t print:hidden">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : existingRecord ? "Update Record" : "Save Record"}
            </Button>
          </div>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
