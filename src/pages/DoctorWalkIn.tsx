import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, UserPlus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CitySelect } from "@/components/CitySelect";
import { calculatePregnancyDuration, calculateExpectedDueDate } from "@/lib/pregnancyUtils";
import { 
  validateName, 
  validatePhone, 
  validateEmail, 
  validateCNIC,
  handleNameInput,
  handlePhoneInput,
  handleCNICInput
} from "@/lib/validations";

const DoctorWalkIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [isGynecologist, setIsGynecologist] = useState(false);
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date>();
  const [pregnancyStartDatePopoverOpen, setPregnancyStartDatePopoverOpen] = useState(false);
  
  // Patient form fields
  const [patientForm, setPatientForm] = useState({
    full_name: "",
    father_name: "",
    email: "",
    phone: "",
    cnic: "",
    date_of_birth: "",
    gender: "female" as "male" | "female" | "other",
    blood_group: "",
    address: "",
    allergies: "",
    marital_status: "",
    city: "",
    major_diseases: "",
  });
  
  // Appointment form fields - date is always today
  const [appointmentForm, setAppointmentForm] = useState({
    appointment_time: "",
    reason: "",
  });
  
  // Date picker for DOB only
  const [dobDate, setDobDate] = useState<Date>();
  const [dobPopoverOpen, setDobPopoverOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchCurrentDoctor();
  }, []);

  useEffect(() => {
    if (dobDate) {
      setPatientForm(prev => ({ ...prev, date_of_birth: format(dobDate, 'yyyy-MM-dd') }));
    }
  }, [dobDate]);

  const fetchCurrentDoctor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setDoctorId(user.id);
      // Check if gynecologist
      const { data } = await supabase
        .from("doctors")
        .select("specialization")
        .eq("id", user.id)
        .maybeSingle();

      setIsGynecologist(data?.specialization?.toLowerCase().includes("gynecologist") || false);
    }
  };

  const generatePatientId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `P-${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    // Validation
    const errors: Record<string, string> = {};
    
    const nameValidation = validateName(patientForm.full_name);
    if (!nameValidation.isValid) errors.full_name = nameValidation.message;
    
    const phoneValidation = validatePhone(patientForm.phone);
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
    
    if (patientForm.email) {
      const emailValidation = validateEmail(patientForm.email, false);
      if (!emailValidation.isValid) errors.email = emailValidation.message;
    }
    
    if (patientForm.cnic) {
      const cnicValidation = validateCNIC(patientForm.cnic);
      if (!cnicValidation.isValid) errors.cnic = cnicValidation.message;
    }
    
    if (patientForm.father_name) {
      const fatherNameValidation = validateName(patientForm.father_name);
      if (!fatherNameValidation.isValid) errors.father_name = fatherNameValidation.message;
    }
    
    if (!patientForm.date_of_birth) {
      errors.date_of_birth = "Date of birth is required";
    }
    if (!appointmentForm.appointment_time) {
      errors.appointment_time = "Please select appointment time";
    }
    if (!doctorId) {
      toast({ title: "Doctor not found", variant: "destructive" });
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({ title: "Please fix the validation errors", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const patientId = generatePatientId();
      const todayDate = format(new Date(), 'yyyy-MM-dd');

      // Step 1: Create patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .insert({
          patient_id: patientId,
          full_name: patientForm.full_name,
          father_name: patientForm.father_name || null,
          email: patientForm.email || null,
          phone: patientForm.phone,
          cnic: patientForm.cnic || null,
          date_of_birth: patientForm.date_of_birth,
          gender: patientForm.gender,
          blood_group: patientForm.blood_group || null,
          address: patientForm.address || null,
          allergies: patientForm.allergies || null,
          marital_status: patientForm.marital_status || null,
          city: patientForm.city || null,
          major_diseases: patientForm.major_diseases || null,
          created_by: doctorId,
          pregnancy_start_date: isGynecologist && patientForm.gender === "female" && pregnancyStartDate 
            ? format(pregnancyStartDate, "yyyy-MM-dd") 
            : null,
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // Step 2: Create appointment for today
      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          patient_id: patientData.id,
          doctor_id: doctorId,
          appointment_date: todayDate,
          appointment_time: appointmentForm.appointment_time,
          reason: appointmentForm.reason || null,
          status: "scheduled",
          created_by: doctorId,
        });

      if (appointmentError) throw appointmentError;

      toast({
        title: "Walk-In Registered Successfully",
        description: `Patient ${patientForm.full_name} (${patientId}) has been created and appointment scheduled for today.`,
      });

      // Navigate to appointments page
      navigate("/doctor/appointments");
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register walk-in patient",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/doctor/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Walk-In Appointment</h1>
          <p className="text-muted-foreground">Register emergency or walk-in patients for today</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Patient Information
              </CardTitle>
              <CardDescription>Enter the patient's personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={patientForm.full_name}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, full_name: handleNameInput(e) }))}
                    placeholder="Enter patient name"
                    required
                    className={formErrors.full_name ? "border-destructive" : ""}
                  />
                  {formErrors.full_name && <p className="text-sm text-destructive">{formErrors.full_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father_name">Father Name</Label>
                  <Input
                    id="father_name"
                    value={patientForm.father_name}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, father_name: handleNameInput(e) }))}
                    placeholder="Enter father name"
                    className={formErrors.father_name ? "border-destructive" : ""}
                  />
                  {formErrors.father_name && <p className="text-sm text-destructive">{formErrors.father_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, phone: handlePhoneInput(e) }))}
                    placeholder="Enter phone number"
                    required
                    className={formErrors.phone ? "border-destructive" : ""}
                  />
                  {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                    className={formErrors.email ? "border-destructive" : ""}
                  />
                  {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Popover open={dobPopoverOpen} onOpenChange={setDobPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dobDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dobDate ? format(dobDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={dobDate}
                        onSelect={(date) => {
                          setDobDate(date);
                          setDobPopoverOpen(false);
                        }}
                        captionLayout="dropdown-buttons"
                        fromYear={1920}
                        toYear={new Date().getFullYear()}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC</Label>
                  <Input
                    id="cnic"
                    value={patientForm.cnic}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, cnic: handleCNICInput(e) }))}
                    placeholder="Enter CNIC (13 digits)"
                    maxLength={15}
                    className={formErrors.cnic ? "border-destructive" : ""}
                  />
                  {formErrors.cnic && <p className="text-sm text-destructive">{formErrors.cnic}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  {isGynecologist ? (
                    <Input value="Female" disabled className="bg-muted" />
                  ) : (
                    <Select
                      value={patientForm.gender}
                      onValueChange={(value: "male" | "female" | "other") => 
                        setPatientForm(prev => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select
                    value={patientForm.blood_group}
                    onValueChange={(value) => setPatientForm(prev => ({ ...prev, blood_group: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="Don't Know">Don't Know</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select
                    value={patientForm.marital_status}
                    onValueChange={(value) => setPatientForm(prev => ({ ...prev, marital_status: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <CitySelect
                    value={patientForm.city}
                    onValueChange={(value) => setPatientForm(prev => ({ ...prev, city: value }))}
                    label="City"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={patientForm.address}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={patientForm.allergies}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="Enter any known allergies"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major_diseases">Major Diseases</Label>
                <Textarea
                  id="major_diseases"
                  value={patientForm.major_diseases}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, major_diseases: e.target.value }))}
                  placeholder="Enter any major diseases"
                  rows={2}
                />
              </div>

              {/* Pregnancy Start Date - Only for Gynecologists */}
              {isGynecologist && (
                <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Label>Pregnancy Start Date (Optional)</Label>
                  <Popover open={pregnancyStartDatePopoverOpen} onOpenChange={setPregnancyStartDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !pregnancyStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pregnancyStartDate ? format(pregnancyStartDate, "PPP") : "Set pregnancy start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={pregnancyStartDate}
                        onSelect={(date) => {
                          setPregnancyStartDate(date);
                          if (date) setPregnancyStartDatePopoverOpen(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          const maxPastDate = new Date();
                          maxPastDate.setDate(maxPastDate.getDate() - 280);
                          return date > today || date < maxPastDate;
                        }}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Can only select dates within the last 9 months (280 days)
                  </p>
                  {pregnancyStartDate && (
                    <div className="mt-2 p-2 bg-background rounded border">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="font-semibold text-primary">
                          {calculatePregnancyDuration(format(pregnancyStartDate, "yyyy-MM-dd"))}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Expected Due Date: </span>
                        <span className="font-semibold text-primary">
                          {calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd")) 
                            ? format(calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd"))!, "PPP")
                            : "-"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Appointment Details
              </CardTitle>
              <CardDescription>Today's appointment - {format(new Date(), "MMMM d, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium">Appointment Date</p>
                <p className="text-2xl font-bold text-primary">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
              </div>

              <div className="space-y-2">
                <Label>Appointment Time *</Label>
                <Select
                  value={appointmentForm.appointment_time}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, appointment_time: value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  value={appointmentForm.reason}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for visit (e.g., Emergency, Consultation)"
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Registering..." : "Register Walk-In Patient"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default DoctorWalkIn;
