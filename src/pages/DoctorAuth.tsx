import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Home, Stethoscope, Sparkles, Loader2, AlertCircle, UserPlus, LogIn, Check, ChevronsUpDown, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import clinicLogo from "@/assets/clinic-logo.png";

const pakistanCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot",
  "Sargodha", "Bahawalpur", "Sukkur", "Larkana", "Hyderabad",
  "Mardan", "Mingora", "Abbottabad", "Dera Ghazi Khan", "Sahiwal",
  "Nawabshah", "Jhang", "Rahim Yar Khan", "Kasur", "Gujrat",
  "Sheikhupura", "Dera Ismail Khan", "Mirpur Khas", "Okara", "Chiniot",
  "Kamoke", "Mandi Bahauddin", "Jhelum", "Sadiqabad", "Jacobabad",
  "Shikarpur", "Khanewal", "Hafizabad", "Kohat", "Muzaffargarh",
  "Khanpur", "Gojra", "Mandi Burewala", "Daska", "Vehari"
].sort();
import { validateName, validatePhone, validateEmail, validatePassword, handleNameInput, handlePhoneInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

const DoctorAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    city: "",
    contactNumber: "",
    experienceYears: "",
    consultationFee: "",
    introduction: "",
    pmdcNumber: "",
    referralCode: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [specializations, setSpecializations] = useState<string[]>([]);
  const cities = pakistanCities;
  const [specializationOpen, setSpecializationOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState<number>(0);
  const [referralCodeStatus, setReferralCodeStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "inactive">("idle");

  // Debounced referral code validation
  useEffect(() => {
    if (!signupData.referralCode.trim()) {
      setReferralCodeStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setReferralCodeStatus("checking");
      
      const { data, error } = await supabase
        .from("referral_partners")
        .select("status")
        .eq("referral_code", signupData.referralCode.trim().toUpperCase())
        .maybeSingle();

      if (error || !data) {
        setReferralCodeStatus("invalid");
      } else if (data.status !== "approved") {
        setReferralCodeStatus("inactive");
      } else {
        setReferralCodeStatus("valid");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [signupData.referralCode]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch specializations
      const { data: specData } = await supabase
        .from("specializations")
        .select("name")
        .order("name");
      
      if (specData) {
        const uniqueSpecs = [...new Set(specData.map(s => s.name))];
        setSpecializations(uniqueSpecs);
      }

      // Cities are now using the predefined pakistanCities list

      // Fetch monthly fee from system settings
      const { data: feeData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "doctor_monthly_fee")
        .maybeSingle();
      
      if (feeData) {
        setMonthlyFee(parseFloat(feeData.value) || 0);
      }
    };
    fetchData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if doctor is approved and get clinic/trial status
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select("approved, clinic_id, trial_end_date")
        .eq("id", authData.user.id)
        .single();

      if (doctorError || !doctorData) {
        await supabase.auth.signOut();
        throw new Error("Doctor profile not found. Please contact support.");
      }

      if (!doctorData.approved) {
        await supabase.auth.signOut();
        throw new Error("Your account is pending approval. Please wait for admin approval.");
      }

      // For single doctors (no clinic), check if trial has expired
      if (!doctorData.clinic_id && doctorData.trial_end_date) {
        const trialEnd = new Date(doctorData.trial_end_date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (trialEnd < today) {
          await supabase.auth.signOut();
          toast({
            title: "Trial Expired",
            description: "Your 14-day free trial has ended. Please contact support to subscribe and continue using all features.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Check if the doctor's clinic is active using security definer function
      if (doctorData.clinic_id) {
        const { data: isActive, error: clinicError } = await supabase
          .rpc("is_clinic_active", { _clinic_id: doctorData.clinic_id });

        if (clinicError) {
          await supabase.auth.signOut();
          throw new Error("Unable to verify clinic status. Please contact support.");
        }

        if (!isActive) {
          setShowInactiveDialog(true);
          setLoading(false);
          await supabase.auth.signOut();
          return;
        }
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      navigate("/doctor/dashboard");
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation
    const errors: string[] = [];
    
    const nameValidation = validateName(signupData.fullName);
    if (!nameValidation.isValid) errors.push(`Name: ${nameValidation.message}`);
    
    const emailValidation = validateEmail(signupData.email);
    if (!emailValidation.isValid) errors.push(`Email: ${emailValidation.message}`);
    
    const passwordValidation = validatePassword(signupData.password);
    if (!passwordValidation.isValid) errors.push(`Password: ${passwordValidation.message}`);
    
    const phoneValidation = validatePhone(signupData.contactNumber);
    if (!phoneValidation.isValid) errors.push(`Contact Number: ${phoneValidation.message}`);
    
    if (!signupData.specialization) errors.push("Specialization is required");
    if (!signupData.experienceYears) errors.push("Experience is required");
    if (!signupData.consultationFee) errors.push("Consultation Fee is required");
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/doctor-auth`;

      // Create auth user for the doctor
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      // Validate referral code if provided
      let validatedReferralCode: string | null = null;
      if (signupData.referralCode.trim()) {
        const { data: partnerData, error: partnerError } = await supabase
          .from("referral_partners")
          .select("status")
          .eq("referral_code", signupData.referralCode.trim().toUpperCase())
          .maybeSingle();

        if (partnerError || !partnerData) {
          throw new Error("Invalid referral code");
        }

        if (partnerData.status !== "approved") {
          throw new Error("This referral code is not active");
        }
        validatedReferralCode = signupData.referralCode.trim().toUpperCase();
      }

      // Create doctor profile with auto-approved status and 14-day trial
      const { error: doctorError } = await supabase.from("doctors").insert({
        id: authData.user.id,
        specialization: signupData.specialization,
        qualification: "Medical Doctor",
        contact_number: signupData.contactNumber,
        experience_years: signupData.experienceYears ? parseInt(signupData.experienceYears) : null,
        consultation_fee: signupData.consultationFee ? parseFloat(signupData.consultationFee) : null,
        clinic_percentage: 0, // No clinic percentage for single doctors
        introduction: signupData.introduction || null,
        pmdc_number: signupData.pmdcNumber || null,
        city: signupData.city || null,
        clinic_id: null, // No clinic - single doctor
        approved: true, // Auto-approve with 14-day trial
        referred_by: validatedReferralCode,
      });

      if (doctorError) throw doctorError;

      // Send signup email with monthly fee info
      try {
        await supabase.functions.invoke("send-doctor-signup-email", {
          body: {
            doctorName: signupData.fullName,
            email: signupData.email,
            specialization: signupData.specialization,
            city: signupData.city,
            monthlyFee: monthlyFee,
          },
        });
      } catch (emailError) {
        console.error("Failed to send signup email:", emailError);
      }

      // Sign out immediately since account needs approval
      await supabase.auth.signOut();

      setShowSuccessDialog(true);
      
      // Reset form
      setSignupData({
        fullName: "",
        email: "",
        password: "",
        specialization: "",
        city: "",
        contactNumber: "",
        experienceYears: "",
        consultationFee: "",
        introduction: "",
        pmdcNumber: "",
        referralCode: "",
      });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Home Button */}
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        size="lg"
        className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm border-2 border-teal-200 hover:border-teal-400 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
      >
        <Home className="mr-2 h-5 w-5 text-teal-600" />
        <span className="font-semibold text-teal-600">Back to Home</span>
      </Button>

      <Card className="w-full max-w-lg relative z-10 border-2 border-teal-200 shadow-2xl bg-white/95 backdrop-blur-sm animate-fade-in">
        <CardHeader className="space-y-4 text-center pb-4">
          <div className="flex justify-center mb-2 animate-fade-in">
            <div className="relative">
              <img src={clinicLogo} alt="Clinic Logo" className="h-16 w-16 hover-scale" />
              <Stethoscope className="absolute -bottom-1 -right-1 h-6 w-6 text-teal-600 bg-white rounded-full p-1 shadow-lg" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
              Doctor Portal
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sign in or register as a new doctor
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-teal-200 focus:border-teal-400 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-teal-200 focus:border-teal-400 transition-colors"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 hover:from-green-700 hover:via-teal-700 hover:to-cyan-700 text-white font-semibold py-5 shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {!loading && <Stethoscope className="mr-2 h-5 w-5" />}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-teal-600 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200 mb-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    Your account will be reviewed by admin before activation. Monthly fee applies as per system settings.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-xs">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={signupData.fullName}
                      onChange={(e) => {
                        const value = handleNameInput(e);
                        setSignupData({ ...signupData, fullName: value });
                        const validation = validateName(value);
                        setFormErrors(prev => ({ ...prev, fullName: validation.isValid ? "" : validation.message }));
                      }}
                      required
                      placeholder="Dr. John Smith"
                      className={`text-sm ${formErrors.fullName ? "border-destructive" : "border-teal-200"}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signupEmail" className="text-xs">Email *</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => {
                        setSignupData({ ...signupData, email: e.target.value });
                        const validation = validateEmail(e.target.value);
                        setFormErrors(prev => ({ ...prev, email: validation.isValid ? "" : validation.message }));
                      }}
                      required
                      placeholder="doctor@example.com"
                      className={`text-sm ${formErrors.email ? "border-destructive" : "border-teal-200"}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signupPassword" className="text-xs">Password *</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => {
                        setSignupData({ ...signupData, password: e.target.value });
                        const validation = validatePassword(e.target.value);
                        setFormErrors(prev => ({ ...prev, password: validation.isValid ? "" : validation.message }));
                      }}
                      required
                      minLength={6}
                      className={`text-sm ${formErrors.password ? "border-destructive" : "border-teal-200"}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="contactNumber" className="text-xs">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={signupData.contactNumber}
                      onChange={(e) => {
                        const value = handlePhoneInput(e);
                        setSignupData({ ...signupData, contactNumber: value });
                        const validation = validatePhone(value);
                        setFormErrors(prev => ({ ...prev, contactNumber: validation.isValid ? "" : validation.message }));
                      }}
                      required
                      placeholder="+92 300 1234567"
                      className={`text-sm ${formErrors.contactNumber ? "border-destructive" : "border-teal-200"}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="specialization" className="text-xs">Specialization *</Label>
                    <Popover open={specializationOpen} onOpenChange={setSpecializationOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={specializationOpen}
                          className={cn(
                            "w-full justify-between text-sm font-normal border-teal-200 hover:border-teal-400",
                            !signupData.specialization && "text-muted-foreground"
                          )}
                        >
                          {signupData.specialization || "Select specialization..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 z-50 bg-background border shadow-lg" align="start">
                        <Command>
                          <CommandInput placeholder="Search specialization..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No specialization found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {specializations.map((spec) => (
                                <CommandItem
                                  key={spec}
                                  value={spec}
                                  onSelect={() => {
                                    setSignupData({ ...signupData, specialization: spec });
                                    setSpecializationOpen(false);
                                  }}
                                >
                                  {spec}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      signupData.specialization === spec ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="city" className="text-xs">City *</Label>
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityOpen}
                          className={cn(
                            "w-full justify-between text-sm font-normal border-teal-200 hover:border-teal-400",
                            !signupData.city && "text-muted-foreground"
                          )}
                        >
                          {signupData.city || "Select city..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 z-50 bg-background border shadow-lg" align="start">
                        <Command>
                          <CommandInput placeholder="Search city..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {cities.map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={() => {
                                    setSignupData({ ...signupData, city: city });
                                    setCityOpen(false);
                                  }}
                                >
                                  {city}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      signupData.city === city ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="experienceYears" className="text-xs">Experience (Years) *</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      min="0"
                      value={signupData.experienceYears}
                      onChange={(e) => setSignupData({ ...signupData, experienceYears: e.target.value })}
                      required
                      placeholder="5"
                      className="text-sm border-teal-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="consultationFee" className="text-xs">Consultation Fee (PKR) *</Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      min="0"
                      step="100"
                      value={signupData.consultationFee}
                      onChange={(e) => setSignupData({ ...signupData, consultationFee: e.target.value })}
                      required
                      placeholder="2000"
                      className="text-sm border-teal-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pmdcNumber" className="text-xs">PMDC Number</Label>
                    <Input
                      id="pmdcNumber"
                      value={signupData.pmdcNumber}
                      onChange={(e) => setSignupData({ ...signupData, pmdcNumber: e.target.value })}
                      placeholder="12345-P"
                      className="text-sm border-teal-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="referralCode" className="text-xs">Referral Code</Label>
                    <div className="relative">
                      <Input
                        id="referralCode"
                        value={signupData.referralCode}
                        onChange={(e) => setSignupData({ ...signupData, referralCode: e.target.value.toUpperCase() })}
                        placeholder="Enter code if you have one"
                        className={`text-sm uppercase pr-10 ${
                          referralCodeStatus === "valid" 
                            ? "border-green-400 focus:border-green-500" 
                            : referralCodeStatus === "invalid" || referralCodeStatus === "inactive"
                            ? "border-destructive focus:border-destructive"
                            : "border-teal-200"
                        }`}
                        maxLength={10}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {referralCodeStatus === "checking" && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {referralCodeStatus === "valid" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {(referralCodeStatus === "invalid" || referralCodeStatus === "inactive") && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    {referralCodeStatus === "valid" && (
                      <p className="text-xs text-green-600">Valid referral code</p>
                    )}
                    {referralCodeStatus === "invalid" && (
                      <p className="text-xs text-destructive">Invalid referral code</p>
                    )}
                    {referralCodeStatus === "inactive" && (
                      <p className="text-xs text-destructive">This code is not active</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="introduction" className="text-xs">Introduction</Label>
                  <Textarea
                    id="introduction"
                    value={signupData.introduction}
                    onChange={(e) => setSignupData({ ...signupData, introduction: e.target.value })}
                    rows={2}
                    placeholder="Brief introduction about your expertise..."
                    className="text-sm border-teal-200"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 hover:from-green-700 hover:via-teal-700 hover:to-cyan-700 text-white font-semibold py-5 shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {!loading && <UserPlus className="mr-2 h-5 w-5" />}
                  {loading ? "Creating Account..." : "Register as Doctor"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Inactive Clinic Dialog */}
      <Dialog open={showInactiveDialog} onOpenChange={setShowInactiveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Clinic Not Active</DialogTitle>
            <DialogDescription className="text-center text-base space-y-3 pt-4">
              <p className="font-semibold text-foreground">
                Your clinic account is currently inactive.
              </p>
              <p className="text-muted-foreground">
                Please contact your clinic administrator or support for assistance.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowInactiveDialog(false)}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Welcome to MyClinicHQ! 🎉</DialogTitle>
            <DialogDescription className="text-center text-base space-y-3 pt-4">
              <p className="font-semibold text-foreground">
                Your account is now active with a 14-day free trial!
              </p>
              <p className="text-muted-foreground">
                You can now login and start using all features. A welcome email with details has been sent to your inbox.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-green-700 font-medium">
                  🎁 Enjoy 14 days of full access - completely free!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                setActiveTab("login");
              }}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              Go to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAuth;
