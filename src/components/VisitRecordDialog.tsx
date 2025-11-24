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
import { calculatePregnancyDuration, calculateExpectedDueDate } from "@/lib/pregnancyUtils";

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  patients: { 
    full_name: string; 
    patient_id: string;
    date_of_birth: string;
    pregnancy_start_date?: string | null;
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
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date>();
  const [pregnancyDatePopoverOpen, setPregnancyDatePopoverOpen] = useState(false);
  const [isGynecologist, setIsGynecologist] = useState(false);
  
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
      checkDoctorSpecialization();
      fetchPatientPregnancyDate();
    } else if (!open) {
      // Reset pregnancy date when dialog closes
      setPregnancyStartDate(undefined);
    }
  }, [appointment, open]);

  const checkDoctorSpecialization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctors")
        .select("specialization")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      setIsGynecologist(data?.specialization?.toLowerCase().includes("gynecologist") || false);
    } catch (error) {
      console.error("Error checking doctor specialization:", error);
    }
  };

  const fetchPatientPregnancyDate = async () => {
    if (!appointment) return;

    // Reset first to ensure clean state for each patient
    setPregnancyStartDate(undefined);

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("pregnancy_start_date")
        .eq("id", appointment.patient_id)
        .single();

      if (error) throw error;

      if (data?.pregnancy_start_date) {
        setPregnancyStartDate(new Date(data.pregnancy_start_date));
      } else {
        setPregnancyStartDate(undefined);
      }
    } catch (error) {
      console.error("Error fetching pregnancy date:", error);
      setPregnancyStartDate(undefined);
    }
  };

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const letterheadUrl = localStorage.getItem(`letterhead_url_${user.id}`);
    
    // Create a clean print document
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Get patient info
    const patientName = appointment?.patients?.full_name || '';
    const patientId = appointment?.patients?.patient_id || '';
    const patientAge = appointment?.patients?.date_of_birth ? calculateAge(appointment.patients.date_of_birth) : '';
    
    // Build HTML content for print
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Visit Record</title>
        <style>
          @page { 
            margin: 0.5cm; 
            size: A4;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
          }
          .letterhead {
            width: 100%;
            margin-bottom: 20px;
          }
          .letterhead img {
            width: 100%;
            height: auto;
            display: block;
          }
          .patient-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .patient-info div {
            display: flex;
            flex-direction: column;
          }
          .patient-info label {
            font-size: 10pt;
            color: #666;
            margin-bottom: 3px;
          }
          .patient-info span {
            font-weight: bold;
            font-size: 12pt;
          }
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .section h3 {
            font-size: 13pt;
            margin-bottom: 10px;
            border-bottom: 2px solid #333;
            padding-bottom: 5px;
          }
          .vitals-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 15px;
          }
          .vital-item {
            display: flex;
            flex-direction: column;
          }
          .vital-item label {
            font-size: 10pt;
            color: #666;
            margin-bottom: 3px;
          }
          .vital-item span {
            font-size: 11pt;
            padding: 5px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 3px;
          }
          .text-content {
            padding: 10px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 3px;
            min-height: 60px;
            white-space: pre-wrap;
          }
          .prescription-content {
            font-family: 'Courier New', monospace;
            min-height: 150px;
          }
        </style>
      </head>
      <body>
    `;
    
    // Add letterhead
    if (letterheadUrl) {
      printContent += `
        <div class="letterhead">
          <img src="${letterheadUrl}" alt="Letterhead" />
        </div>
      `;
    }
    
    // Add patient info
    printContent += `
      <div class="patient-info">
        <div>
          <label>Patient Name</label>
          <span>${patientName}</span>
        </div>
        <div>
          <label>Patient ID</label>
          <span>${patientId}</span>
        </div>
        <div>
          <label>Age</label>
          <span>${patientAge} years</span>
        </div>
      </div>
    `;
    
    // Add vitals section
    printContent += `
      <div class="section">
        <h3>Vitals</h3>
        <div class="vitals-grid">
          <div class="vital-item">
            <label>Blood Pressure</label>
            <span>${formData.blood_pressure || '-'}</span>
          </div>
          <div class="vital-item">
            <label>Temperature</label>
            <span>${formData.temperature || '-'}</span>
          </div>
          <div class="vital-item">
            <label>Pulse</label>
            <span>${formData.pulse || '-'}</span>
          </div>
          <div class="vital-item">
            <label>Weight</label>
            <span>${formData.weight || '-'}</span>
          </div>
        </div>
      </div>
    `;
    
    // Add chief complaint
    if (formData.chief_complaint) {
      printContent += `
        <div class="section">
          <h3>Chief Complaint</h3>
          <div class="text-content">${formData.chief_complaint}</div>
        </div>
      `;
    }
    
    // Add current prescription
    if (formData.current_prescription) {
      printContent += `
        <div class="section">
          <h3>Current Prescription</h3>
          <div class="text-content prescription-content">${formData.current_prescription}</div>
        </div>
      `;
    }
    
    // Add test reports
    if (formData.test_reports) {
      printContent += `
        <div class="section">
          <h3>Test Reports</h3>
          <div class="text-content">${formData.test_reports}</div>
        </div>
      `;
    }
    
    // Add next visit info
    if (nextVisitDate || formData.next_visit_notes) {
      printContent += `
        <div class="section">
          <h3>Next Visit</h3>
      `;
      if (nextVisitDate) {
        printContent += `<p><strong>Date:</strong> ${format(nextVisitDate, "PPP")}</p>`;
      }
      if (formData.next_visit_notes) {
        printContent += `<div class="text-content">${formData.next_visit_notes}</div>`;
      }
      printContent += `</div>`;
    }
    
    printContent += `
      </body>
      </html>
    `;
    
    // Write content to new window and print
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
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

      // Update pregnancy start date if gynecologist
      if (isGynecologist && pregnancyStartDate) {
        const { error: pregnancyError } = await supabase
          .from("patients")
          .update({ pregnancy_start_date: format(pregnancyStartDate, "yyyy-MM-dd") })
          .eq("id", appointment.patient_id);

        if (pregnancyError) {
          console.error("Error updating pregnancy date:", pregnancyError);
        }
      }

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
              {isGynecologist && pregnancyStartDate && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pregnancy Duration</p>
                    <p className="font-semibold text-primary">
                      {calculatePregnancyDuration(format(pregnancyStartDate, "yyyy-MM-dd"))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Due Date</p>
                    <p className="font-semibold text-primary">
                      {calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd")) 
                        ? format(calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd"))!, "PPP")
                        : "-"}
                    </p>
                  </div>
                </div>
              )}
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

              {/* Pregnancy Start Date - Only for Gynecologists */}
              {isGynecologist && (
                <div className="border rounded-lg p-4 bg-primary/5">
                  <h3 className="font-semibold mb-4">Pregnancy Tracking</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Pregnancy Start Date</Label>
                      <Popover open={pregnancyDatePopoverOpen} onOpenChange={setPregnancyDatePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !pregnancyStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {pregnancyStartDate ? format(pregnancyStartDate, "PPP") : "Set start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={pregnancyStartDate}
                            onSelect={(date) => {
                              setPregnancyStartDate(date);
                              if (date) setPregnancyDatePopoverOpen(false);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              const maxPastDate = new Date();
                              maxPastDate.setDate(maxPastDate.getDate() - 280); // 9 months = 280 days
                              return date > today || date < maxPastDate;
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground mt-1">
                        Can only select dates within the last 9 months (280 days)
                      </p>
                    </div>
                    {pregnancyStartDate && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold text-primary">
                            {calculatePregnancyDuration(format(pregnancyStartDate, "yyyy-MM-dd"))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expected Due Date:</span>
                          <span className="font-semibold text-primary">
                            {calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd")) 
                              ? format(calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd"))!, "PPP")
                              : "-"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
