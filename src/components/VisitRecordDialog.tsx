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
    
    // Financial
    consultation_fee: "",
    other_fee: "",
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
      
      // Fetch appointment fees
      const { data: appointmentData } = await supabase
        .from("appointments")
        .select("consultation_fee, other_fee")
        .eq("id", appointment.id)
        .single();
      
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
        consultation_fee: appointmentData?.consultation_fee?.toString() || "",
        other_fee: appointmentData?.other_fee?.toString() || "",
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
    // Create a clean print document
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Get patient info
    const patientName = appointment?.patients?.full_name || '';
    const patientId = appointment?.patients?.patient_id || '';
    const patientAge = appointment?.patients?.date_of_birth ? calculateAge(appointment.patients.date_of_birth) : '';
    const visitDate = appointment?.appointment_date ? format(new Date(appointment.appointment_date), "dd MMMM yyyy") : '';
    
    // Build HTML content for print - professional layout for pre-printed letterhead
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Visit Record</title>
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          @page { 
            margin: 2.5cm 2cm 2cm 2cm;
            size: A4;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 11pt;
            line-height: 1.7;
            color: #1a1a1a;
            padding-top: 1cm;
          }
          
          /* Header with date */
          .print-header {
            text-align: right;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e5e5;
          }
          .print-date {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 12pt;
            color: #444;
            font-weight: 500;
          }
          
          /* Patient Info Card */
          .patient-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px 25px;
            margin-bottom: 30px;
          }
          .patient-card-title {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #64748b;
            margin-bottom: 12px;
            font-weight: 600;
          }
          .patient-details {
            display: flex;
            justify-content: space-between;
            gap: 30px;
          }
          .patient-item {
            flex: 1;
          }
          .patient-label {
            font-size: 9pt;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .patient-value {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 14pt;
            font-weight: 600;
            color: #0f172a;
          }
          
          /* Vitals Section */
          .vitals-section {
            margin-bottom: 28px;
          }
          .section-title {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 14pt;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #0f172a;
            display: inline-block;
          }
          .vitals-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
          }
          .vital-box {
            text-align: center;
            padding: 12px 8px;
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
          }
          .vital-label {
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 6px;
          }
          .vital-value {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 15pt;
            font-weight: 600;
            color: #0f172a;
          }
          
          /* Content Sections */
          .content-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .content-title {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 12pt;
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .content-box {
            padding: 15px 18px;
            background: #fafafa;
            border-left: 3px solid #0f172a;
            font-size: 11pt;
            line-height: 1.8;
            white-space: pre-wrap;
          }
          
          /* Prescription Box - Special styling */
          .prescription-box {
            padding: 20px;
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-left: 4px solid #f59e0b;
            border-radius: 0 6px 6px 0;
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 12pt;
            line-height: 2;
            white-space: pre-wrap;
          }
          .prescription-title {
            color: #92400e;
          }
          
          /* Next Visit Section */
          .next-visit-section {
            margin-top: 30px;
            padding: 18px 22px;
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 1px solid #6ee7b7;
            border-radius: 8px;
          }
          .next-visit-title {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 11pt;
            font-weight: 600;
            color: #065f46;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .next-visit-date {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 16pt;
            font-weight: 700;
            color: #047857;
          }
          .next-visit-notes {
            margin-top: 10px;
            font-size: 10pt;
            color: #065f46;
          }
          
          /* Footer */
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            text-align: right;
          }
          .signature-line {
            display: inline-block;
            width: 200px;
            border-top: 1px solid #333;
            padding-top: 8px;
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 10pt;
            color: #666;
          }
        </style>
      </head>
      <body>
        <!-- Header with Date -->
        <div class="print-header">
          <span class="print-date">Date: ${visitDate}</span>
        </div>
        
        <!-- Patient Information Card -->
        <div class="patient-card">
          <div class="patient-card-title">Patient Information</div>
          <div class="patient-details">
            <div class="patient-item">
              <div class="patient-label">Name</div>
              <div class="patient-value">${patientName}</div>
            </div>
            <div class="patient-item">
              <div class="patient-label">Patient ID</div>
              <div class="patient-value">${patientId}</div>
            </div>
            <div class="patient-item">
              <div class="patient-label">Age</div>
              <div class="patient-value">${patientAge} Years</div>
            </div>
          </div>
        </div>
        
        <!-- Vitals Section -->
        <div class="vitals-section">
          <div class="section-title">Vitals</div>
          <div class="vitals-grid">
            <div class="vital-box">
              <div class="vital-label">Blood Pressure</div>
              <div class="vital-value">${formData.blood_pressure || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Temperature</div>
              <div class="vital-value">${formData.temperature || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Pulse</div>
              <div class="vital-value">${formData.pulse || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Weight</div>
              <div class="vital-value">${formData.weight || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Height</div>
              <div class="vital-value">${formData.height || '—'}</div>
            </div>
          </div>
        </div>
    `;
    
    // Add chief complaint
    if (formData.chief_complaint) {
      printContent += `
        <div class="content-section">
          <div class="content-title">Chief Complaint</div>
          <div class="content-box">${formData.chief_complaint}</div>
        </div>
      `;
    }
    
    // Add current prescription with special styling
    if (formData.current_prescription) {
      printContent += `
        <div class="content-section">
          <div class="content-title prescription-title">℞ Prescription</div>
          <div class="prescription-box">${formData.current_prescription}</div>
        </div>
      `;
    }
    
    // Add test reports
    if (formData.test_reports) {
      printContent += `
        <div class="content-section">
          <div class="content-title">Test Reports / Investigations</div>
          <div class="content-box">${formData.test_reports}</div>
        </div>
      `;
    }
    
    // Add next visit info
    if (nextVisitDate || formData.next_visit_notes) {
      printContent += `
        <div class="next-visit-section">
          <div class="next-visit-title">Next Visit</div>
      `;
      if (nextVisitDate) {
        printContent += `<div class="next-visit-date">${format(nextVisitDate, "EEEE, dd MMMM yyyy")}</div>`;
      }
      if (formData.next_visit_notes) {
        printContent += `<div class="next-visit-notes">${formData.next_visit_notes}</div>`;
      }
      printContent += `</div>`;
    }
    
    // Add footer with signature line
    printContent += `
        <div class="print-footer">
          <div class="signature-line">Doctor's Signature</div>
        </div>
      </body>
      </html>
    `;
    
    // Write content to new window and print
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for fonts to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
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
        blood_pressure: formData.blood_pressure,
        temperature: formData.temperature,
        pulse: formData.pulse,
        weight: formData.weight,
        height: formData.height,
        chief_complaint: formData.chief_complaint,
        patient_history: formData.patient_history,
        current_prescription: formData.current_prescription,
        test_reports: formData.test_reports,
        next_visit_notes: formData.next_visit_notes,
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

      // Update appointment fees
      const { error: feeError } = await supabase
        .from("appointments")
        .update({
          consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : 0,
          other_fee: formData.other_fee ? parseFloat(formData.other_fee) : 0,
          status: 'completed'
        })
        .eq("id", appointment.id);

      if (feeError) throw feeError;

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

      // Create new appointment if next visit date is set
      if (nextVisitDate) {
        const { error: appointmentError } = await supabase
          .from("appointments")
          .insert({
            patient_id: appointment.patient_id,
            doctor_id: user.id,
            appointment_date: format(nextVisitDate, "yyyy-MM-dd"),
            appointment_time: appointment.appointment_time, // Use same time as current appointment
            duration_minutes: 30,
            status: "scheduled",
            reason: "Follow-up visit",
            notes: formData.next_visit_notes || null,
          });

        if (appointmentError) {
          console.error("Error creating follow-up appointment:", appointmentError);
          toast({
            title: "Warning",
            description: "Visit record saved but failed to create follow-up appointment",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: `Visit record ${existingRecord ? 'updated' : 'saved'} successfully${nextVisitDate ? ' and follow-up appointment created' : ''}`,
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

              {/* Financial Section */}
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <h3 className="font-semibold mb-4">Financial Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Consultation Fee</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.consultation_fee}
                      onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Other Fee</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.other_fee}
                      onChange={(e) => setFormData({...formData, other_fee: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {(formData.consultation_fee || formData.other_fee) && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Fee:</span>
                        <span className="text-lg text-green-600 dark:text-green-400">
                          {((parseFloat(formData.consultation_fee) || 0) + (parseFloat(formData.other_fee) || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
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
