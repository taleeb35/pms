import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home, Building2, Sparkles, CheckCircle, XCircle, LogIn } from "lucide-react";
import { CitySelect } from "@/components/CitySelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import clinicLogo from "@/assets/main-logo.webp";
import { 
  validateEmail, 
  validatePassword, 
  validatePhone, 
  validateClinicName,
  validateNumber,
  handlePhoneInput,
  handleNumberInput
} from "@/lib/validations";

const MONTHLY_PRICE_PER_DOCTOR = 5999;
const YEARLY_DISCOUNT = 0.17; // 17% discount

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [noOfDoctors, setNoOfDoctors] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [paymentPlan, setPaymentPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referralCodeStatus, setReferralCodeStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "inactive">("idle");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate pricing
  const doctorCount = parseInt(noOfDoctors) || 1;
  const yearlyMonthlyRate = Math.round(MONTHLY_PRICE_PER_DOCTOR * (1 - YEARLY_DISCOUNT));
  const monthlyTotal = doctorCount * MONTHLY_PRICE_PER_DOCTOR;
  const yearlyTotal = doctorCount * yearlyMonthlyRate;
  const yearlySavings = (monthlyTotal - yearlyTotal) * 12;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Debounced referral code validation
  useEffect(() => {
    if (!referralCode.trim()) {
      setReferralCodeStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setReferralCodeStatus("checking");
      
      const { data, error } = await supabase
        .from("referral_partners")
        .select("status")
        .eq("referral_code", referralCode.trim().toUpperCase())
        .maybeSingle();

      if (error || !data) {
        setReferralCodeStatus("invalid");
      } else if (!["approved", "active"].includes(data.status)) {
        setReferralCodeStatus("inactive");
      } else {
        setReferralCodeStatus("valid");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [referralCode]);

  const handleClinicSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    const clinicValidation = validateClinicName(clinicName);
    if (!clinicValidation.isValid) newErrors.clinicName = clinicValidation.message;

    const phoneValidation = validatePhone(phoneNumber);
    if (!phoneValidation.isValid) newErrors.phoneNumber = phoneValidation.message;

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) newErrors.email = emailValidation.message;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.message;

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!city) newErrors.city = "City is required";
    if (!address.trim()) newErrors.address = "Address is required";

    const doctorsValidation = validateNumber(noOfDoctors, 1, 100);
    if (!doctorsValidation.isValid) newErrors.noOfDoctors = doctorsValidation.message;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const missingFields = Object.values(newErrors).join(", ");
      toast({ 
        title: "Missing Required Fields", 
        description: missingFields,
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      // Validate referral code if provided
      if (referralCode.trim()) {
        const { data: partnerData, error: partnerError } = await supabase
          .from("referral_partners")
          .select("status")
          .eq("referral_code", referralCode.trim().toUpperCase())
          .maybeSingle();

        if (partnerError) {
          toast({ title: "Error validating referral code", variant: "destructive" });
          setLoading(false);
          return;
        }

        if (!partnerData) {
          setErrors({ ...errors, referralCode: "Invalid referral code" });
          toast({ title: "Invalid referral code", variant: "destructive" });
          setLoading(false);
          return;
        }

        if (!["approved", "active"].includes(partnerData.status)) {
          setErrors({ ...errors, referralCode: "This referral code is not active" });
          toast({ title: "This referral code is not active", variant: "destructive" });
          setLoading(false);
          return;
        }
      }

      // Clinic signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: clinicName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("User creation failed");

      // Update profile with clinic info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          phone: phoneNumber,
          city: city,
          address: address,
        })
        .eq("id", data.user.id);

      if (profileError) throw profileError;

      // Create clinic record with auto-approved status and 14-day trial
      const { error: clinicError } = await supabase.from("clinics").insert({
        id: data.user.id,
        clinic_name: clinicName,
        city: city,
        phone_number: phoneNumber,
        address: address,
        requested_doctors: parseInt(noOfDoctors) || 0,
        referred_by: referralCode.trim().toUpperCase() || null,
        status: "active",
        payment_plan: paymentPlan,
      });

      if (clinicError) throw clinicError;

      // Assign clinic role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: "clinic",
      });

      if (roleError) throw roleError;

      // Send welcome email
      try {
        await supabase.functions.invoke('send-clinic-welcome-email', {
          body: {
            clinicName,
            email,
            phoneNumber,
            city,
            address,
            requestedDoctors: parseInt(noOfDoctors) || 1,
          },
        });
        console.log("Welcome email sent successfully");
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      // Show success dialog
      setShowSuccessDialog(true);
      
      // Reset form
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Home Button */}
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        size="lg"
        className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
      >
        <Home className="mr-2 h-5 w-5 text-purple-600" />
        <span className="font-semibold text-purple-600">Back to Home</span>
      </Button>

      <Card className="w-full max-w-xl relative z-10 border-2 border-purple-200 shadow-2xl bg-white/95 backdrop-blur-sm animate-fade-in new_width">
        <CardHeader className="space-y-4 text-center pb-6">
          <div>
            <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Create Your Clinic
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Register your clinic and start managing everything
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
        
          <form onSubmit={handleClinicSignup} className="space-y-4">
            {/* Row 1: Clinic Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="clinicName" className="text-sm font-semibold">Clinic Name <span className="text-destructive">*</span></Label>
                <Input
                  id="clinicName"
                  type="text"
                  placeholder="City Medical Center"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  required
                  className={`border-2 ${errors.clinicName ? 'border-destructive' : 'border-purple-200'} focus:border-purple-400 transition-colors`}
                />
                {errors.clinicName && <p className="text-sm text-destructive">{errors.clinicName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold">Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(handlePhoneInput(e))}
                  required
                  className={`border-2 ${errors.phoneNumber ? 'border-destructive' : 'border-purple-200'} focus:border-purple-400 transition-colors`}
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Row 2: City & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
              <div className="space-y-2">
                <CitySelect
                  label="City"
                  value={city}
                  onValueChange={setCity}
                  required
                />
                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold">Address <span className="text-destructive">*</span></Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className={`border-2 ${errors.address ? 'border-destructive' : 'border-purple-200'} focus:border-purple-400 transition-colors`}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </div>

            {/* Row 3: Number of Doctors */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="space-y-2">
                <Label htmlFor="noOfDoctors" className="text-sm font-semibold">Number of Doctors <span className="text-destructive">*</span></Label>
                <Input
                  id="noOfDoctors"
                  type="text"
                  placeholder="5"
                  value={noOfDoctors}
                  onChange={(e) => setNoOfDoctors(handleNumberInput(e))}
                  required
                  className={`border-2 ${errors.noOfDoctors ? 'border-destructive' : 'border-purple-200'} focus:border-purple-400 transition-colors`}
                />
                {errors.noOfDoctors && <p className="text-sm text-destructive">{errors.noOfDoctors}</p>}
              </div>
            </div>

            {/* Payment Plan Selection */}
            <div className="space-y-3 animate-fade-in p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200" style={{ animationDelay: '210ms' }}>
              <Label className="text-sm font-semibold">Payment Plan <span className="text-destructive">*</span></Label>
              
              {/* 14 Days Trial Badge - Prominently displayed */}
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-3 border-2 border-amber-400">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-amber-600 text-xl">🎉</span>
                  <span className="font-bold text-amber-800 text-base">Start with 14 Days FREE Trial!</span>
                  <span className="text-amber-600 text-xl">🎉</span>
                </div>
                <p className="text-xs text-amber-700 text-center mt-1">No payment required during trial period</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentPlan("monthly")}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    paymentPlan === "monthly"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="font-semibold text-sm">Monthly</div>
                  <div className="text-xs text-muted-foreground">
                    {formatPrice(MONTHLY_PRICE_PER_DOCTOR)}/doctor/month
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentPlan("yearly")}
                  className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                    paymentPlan === "yearly"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    Save 17%
                  </span>
                  <div className="font-semibold text-sm">Yearly</div>
                  <div className="text-xs text-muted-foreground">
                    {formatPrice(yearlyMonthlyRate)}/doctor/month
                  </div>
                </button>
              </div>
              
              {/* Pricing Summary */}
              <div className="bg-white/80 rounded-lg p-3 border border-purple-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Monthly Total:</span>
                  <span className="font-semibold">{formatPrice(paymentPlan === "yearly" ? yearlyTotal : monthlyTotal)}</span>
                </div>
                {paymentPlan === "yearly" && (
                  <>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Yearly Total:</span>
                      <span className="font-semibold">{formatPrice(yearlyTotal * 12)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>You Save:</span>
                      <span className="font-semibold">{formatPrice(yearlySavings)}/year</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '225ms' }}>
              <Label htmlFor="referralCode" className="text-sm font-semibold">Referral Code <span className="text-muted-foreground text-xs">(Optional)</span></Label>
              <div className="relative">
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="Enter referral code if you have one"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className={`border-2 transition-colors uppercase pr-10 ${
                    referralCodeStatus === "valid" 
                      ? "border-green-400 focus:border-green-500" 
                      : referralCodeStatus === "invalid" || referralCodeStatus === "inactive"
                      ? "border-destructive focus:border-destructive"
                      : "border-purple-200 focus:border-purple-400"
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
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Valid referral code
                </p>
              )}
              {referralCodeStatus === "invalid" && (
                <p className="text-xs text-destructive">Invalid referral code</p>
              )}
              {referralCodeStatus === "inactive" && (
                <p className="text-xs text-destructive">This referral code is not active</p>
              )}
              {referralCodeStatus === "idle" && (
                <p className="text-xs text-muted-foreground">If someone referred you, enter their code here</p>
              )}
            </div>
            
            {/* Email field */}
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Label htmlFor="clinicEmail" className="text-sm font-semibold">Email <span className="text-destructive">*</span></Label>
              <Input
                id="clinicEmail"
                type="email"
                placeholder="clinic@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`border-2 ${errors.email ? 'border-destructive' : 'border-purple-200'} focus:border-purple-400 transition-colors`}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            
            {/* Password fields in 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <div className="space-y-2">
                <Label htmlFor="clinicPassword" className="text-sm font-semibold">Password <span className="text-destructive">*</span></Label>
                <Input
                  id="clinicPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`border-2 ${errors.password ? 'border-destructive' : 'border-purple-200'} focus:border-purple-400 transition-colors`}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password <span className="text-destructive">*</span></Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`border-2 ${errors.confirmPassword ? 'border-destructive' : 'border-purple-200'} focus:border-purple-400 transition-colors`}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {!loading && <Building2 className="mr-2 h-5 w-5" />}
              Create Clinic Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-200">
            <p className="text-sm text-center text-muted-foreground mb-3">
              Already have an account?
            </p>
            <Button
              variant="outline"
              className="w-full border-2 border-purple-200 hover:border-purple-400"
              onClick={() => navigate("/login")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog after Signup */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Welcome to Zonoir! 🎉</DialogTitle>
            <DialogDescription className="text-center text-base space-y-3 pt-4">
              <p className="font-semibold text-foreground">
                Your clinic account is now active with a 14-day free trial!
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
                navigate("/login");
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Go to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
