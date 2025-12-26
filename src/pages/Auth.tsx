import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home, Building2, Sparkles, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { CitySelect } from "@/components/CitySelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import clinicLogo from "@/assets/clinic-logo.png";
import { 
  validateEmail, 
  validatePassword, 
  validatePhone, 
  validateClinicName,
  validateNumber,
  handlePhoneInput,
  handleNumberInput
} from "@/lib/validations";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [noOfDoctors, setNoOfDoctors] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);
  const [showTrialExpiredDialog, setShowTrialExpiredDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referralCodeStatus, setReferralCodeStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "inactive">("idle");
  const navigate = useNavigate();
  const { toast } = useToast();

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
      } else if (data.status !== "approved") {
        setReferralCodeStatus("inactive");
      } else {
        setReferralCodeStatus("valid");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [referralCode]);


  const handleClinicAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation for signup
    if (isSignup) {
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
        toast({ title: "Please fix the validation errors", variant: "destructive" });
        return;
      }
    } else {
      // Validation for login
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setErrors({ email: emailValidation.message });
        return;
      }
    }

    setLoading(true);

    try {
      // Validate referral code if provided
      if (isSignup && referralCode.trim()) {
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

        if (partnerData.status !== "approved") {
          setErrors({ ...errors, referralCode: "This referral code is not active" });
          toast({ title: "This referral code is not active", variant: "destructive" });
          setLoading(false);
          return;
        }
      }
      if (isSignup) {
        // Clinic signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: clinicName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
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
          status: "active", // Auto-approve with trial
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
          // Don't throw - email failure shouldn't block signup
        }

        // Show success dialog
        setShowSuccessDialog(true);
        
        // Reset form but keep in signup mode until they close the dialog
        setPassword("");
        setConfirmPassword("");
      } else {
        // Clinic login
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check clinic status and trial
        const { data: clinicData, error: clinicError } = await supabase
          .from("clinics")
          .select("status, clinic_name, trial_end_date")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (clinicError) {
          await supabase.auth.signOut();
          throw clinicError;
        }

        // Check if clinic record exists
        if (!clinicData) {
          await supabase.auth.signOut();
          throw new Error(
            "Clinic account not found. Please contact support for assistance."
          );
        }

        // Check if trial has expired
        if (clinicData.trial_end_date) {
          const trialEnd = new Date(clinicData.trial_end_date + "T00:00:00");
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (trialEnd < today) {
            await supabase.auth.signOut();
            setShowTrialExpiredDialog(true);
            setLoading(false);
            return;
          }
        }

        // Check if clinic is active
        if (clinicData.status !== "active") {
          // Show inactive account dialog BEFORE signing out
          setShowInactiveDialog(true);
          setLoading(false);
          
          // Sign out the user after dialog is set
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Login successful",
          description: `Welcome back, ${clinicData.clinic_name}!`,
        });
        navigate("/clinic/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
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

      <Card className="w-full max-w-md relative z-10 border-2 border-purple-200 shadow-2xl bg-white/95 backdrop-blur-sm animate-fade-in">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2 animate-fade-in">
            <div className="relative">
              <img src={clinicLogo} alt="Clinic Logo" className="h-20 w-20 hover-scale" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {isSignup ? "Create Your Clinic" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {isSignup
                ? "Register your clinic and start managing everything"
                : "Login to access your clinic dashboard"}
            </CardDescription>
          </div>
          {!isSignup && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full border border-purple-200">
              <Building2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">Clinic Owner Portal</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleClinicAuth} className="space-y-4">
            {isSignup && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-purple-200 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-900">Complete Clinic Registration</p>
                </div>
                <p className="text-xs text-muted-foreground">Fill in your clinic details to get started</p>
              </div>
            )}
            
            {isSignup && (
              <>
                <div className="space-y-2 animate-fade-in">
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
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '50ms' }}>
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
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <CitySelect
                    label="City"
                    value={city}
                    onValueChange={setCity}
                    required
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '150ms' }}>
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
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
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
              </>
            )}
            
            <div className={`space-y-2 ${isSignup ? 'animate-fade-in' : ''}`} style={{ animationDelay: '250ms' }}>
              <Label htmlFor="clinicEmail" className="text-sm font-semibold">Email {isSignup && <span className="text-destructive">*</span>}</Label>
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
            
            <div className={`space-y-2 ${isSignup ? 'animate-fade-in' : ''}`} style={{ animationDelay: '300ms' }}>
              <Label htmlFor="clinicPassword" className="text-sm font-semibold">Password {isSignup && <span className="text-destructive">*</span>}</Label>
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
            
            {isSignup && (
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: '350ms' }}>
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
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {!loading && <Building2 className="mr-2 h-5 w-5" />}
              {isSignup ? "Create Clinic Account" : "Sign In to Dashboard"}
            </Button>

            {!isSignup && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setClinicName("");
                setPhoneNumber("");
                setCity("");
                setAddress("");
                setNoOfDoctors("");
              }}
              className="mt-4 text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "New clinic? Sign up here"}
            </button>
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
            <DialogTitle className="text-center text-2xl">Welcome to MyClinicHQ! 🎉</DialogTitle>
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
                setIsSignup(false);
                // Clear all form fields
                setEmail("");
                setClinicName("");
                setPhoneNumber("");
                setCity("");
                setAddress("");
                setNoOfDoctors("");
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Got it, Thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trial Expired Dialog */}
      <Dialog open={showTrialExpiredDialog} onOpenChange={setShowTrialExpiredDialog}>
        <DialogContent className="sm:max-w-md border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg animate-pulse">
                <AlertCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-amber-800">Trial Expired</DialogTitle>
            <DialogDescription className="text-center text-base space-y-3 pt-4">
              <p className="font-semibold text-amber-900 text-lg">
                Your 14-day free trial has ended.
              </p>
              <p className="text-amber-700">
                Please contact support to subscribe and continue using all features.
              </p>
              <div className="bg-white/60 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-800 font-medium">
                  📧 Email: support@example.com
                </p>
                <p className="text-sm text-amber-800 font-medium mt-1">
                  📞 Phone: +92 300 1234567
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowTrialExpiredDialog(false)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inactive Account Dialog */}
      <Dialog open={showInactiveDialog} onOpenChange={setShowInactiveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Account Not Active</DialogTitle>
            <DialogDescription className="text-center text-base space-y-3 pt-4">
              <p className="font-semibold text-foreground">
                Your account is still not active.
              </p>
              <p className="text-muted-foreground">
                Your clinic registration is pending approval from our admin team.
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact support if you've been waiting for more than 2 business days.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowInactiveDialog(false)}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              Contact Support
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
