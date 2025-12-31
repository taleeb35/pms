import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home, Loader2, LogIn, Shield, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import clinicLogo from "@/assets/clinic-logo.png";
import { validateEmail } from "@/lib/validations";

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Dialogs for various states
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);
  const [showTrialExpiredDialog, setShowTrialExpiredDialog] = useState(false);
  const [showClinicInactiveDialog, setShowClinicInactiveDialog] = useState(false);
  const [showAccountNotFoundDialog, setShowAccountNotFoundDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Validation Error",
        description: emailValidation.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // Check user roles to determine account type
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) {
        await supabase.auth.signOut();
        throw rolesError;
      }

      const roles = rolesData?.map(r => r.role) || [];

      // Check for Clinic role
      if (roles.includes("clinic")) {
        const result = await handleClinicLogin(userId);
        if (!result.success) {
          setLoading(false);
          return;
        }
        navigate("/clinic/dashboard");
        return;
      }

      // Check for Doctor role
      if (roles.includes("doctor")) {
        const result = await handleDoctorLogin(userId);
        if (!result.success) {
          setLoading(false);
          return;
        }
        navigate("/doctor/dashboard");
        return;
      }

      // Check for Receptionist role
      if (roles.includes("receptionist")) {
        const result = await handleReceptionistLogin(userId);
        if (!result.success) {
          setLoading(false);
          return;
        }
        navigate(result.path ?? "/receptionist/dashboard");
        return;
      }

      // No valid role found
      await supabase.auth.signOut();
      setDialogMessage("Your account type is not recognized. Please contact support.");
      setShowAccountNotFoundDialog(true);
      
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClinicLogin = async (userId: string) => {
    const { data: clinicData, error: clinicError } = await supabase
      .from("clinics")
      .select("status, clinic_name, trial_end_date")
      .eq("id", userId)
      .maybeSingle();

    if (clinicError) {
      await supabase.auth.signOut();
      throw clinicError;
    }

    if (!clinicData) {
      await supabase.auth.signOut();
      setDialogMessage("Clinic account not found. Please contact support.");
      setShowAccountNotFoundDialog(true);
      return { success: false };
    }

    // Check if trial has expired
    if (clinicData.trial_end_date) {
      const trialEnd = new Date(clinicData.trial_end_date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (trialEnd < today) {
        await supabase.auth.signOut();
        setShowTrialExpiredDialog(true);
        return { success: false };
      }
    }

    // Check if clinic is active
    if (clinicData.status !== "active") {
      await supabase.auth.signOut();
      setShowInactiveDialog(true);
      return { success: false };
    }

    toast({
      title: "Login successful",
      description: `Welcome back, ${clinicData.clinic_name}!`,
    });
    return { success: true };
  };

  const handleDoctorLogin = async (userId: string) => {
    const { data: doctorData, error: doctorError } = await supabase
      .from("doctors")
      .select("approved, clinic_id, trial_end_date")
      .eq("id", userId)
      .single();

    if (doctorError || !doctorData) {
      await supabase.auth.signOut();
      setDialogMessage("Doctor profile not found. Please contact support.");
      setShowAccountNotFoundDialog(true);
      return { success: false };
    }

    if (!doctorData.approved) {
      await supabase.auth.signOut();
      setDialogMessage("Your account is pending approval. Please wait for admin approval.");
      setShowAccountNotFoundDialog(true);
      return { success: false };
    }

    // For single doctors (no clinic), check if trial has expired
    if (!doctorData.clinic_id && doctorData.trial_end_date) {
      const trialEnd = new Date(doctorData.trial_end_date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (trialEnd < today) {
        await supabase.auth.signOut();
        setShowTrialExpiredDialog(true);
        return { success: false };
      }
    }

    // Check if the doctor's clinic is active
    if (doctorData.clinic_id) {
      const { data: isActive, error: clinicError } = await supabase
        .rpc("is_clinic_active", { _clinic_id: doctorData.clinic_id });

      if (clinicError) {
        await supabase.auth.signOut();
        setDialogMessage("Unable to verify clinic status. Please contact support.");
        setShowAccountNotFoundDialog(true);
        return { success: false };
      }

      if (!isActive) {
        await supabase.auth.signOut();
        setShowClinicInactiveDialog(true);
        return { success: false };
      }
    }

    // Get doctor name for welcome message
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    toast({
      title: "Login successful",
      description: `Welcome back, Dr. ${profile?.full_name || ""}!`,
    });
    return { success: true };
  };

  const handleReceptionistLogin = async (
    userId: string
  ): Promise<{ success: boolean; path?: string }> => {
    // 1) Clinic receptionist
    const { data: clinicReceptionist, error: clinicReceptionistError } = await supabase
      .from("clinic_receptionists")
      .select("clinic_id, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (clinicReceptionistError) {
      await supabase.auth.signOut();
      throw clinicReceptionistError;
    }

    if (clinicReceptionist) {
      if (clinicReceptionist.status !== "active") {
        await supabase.auth.signOut();
        setDialogMessage(
          "Your receptionist account is currently inactive. Please contact your clinic administrator."
        );
        setShowAccountNotFoundDialog(true);
        return { success: false };
      }

      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("status")
        .eq("id", clinicReceptionist.clinic_id)
        .single();

      if (clinicError) {
        await supabase.auth.signOut();
        throw clinicError;
      }

      if (clinicData.status !== "active") {
        await supabase.auth.signOut();
        setShowClinicInactiveDialog(true);
        return { success: false };
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      return { success: true, path: "/receptionist/dashboard" };
    }

    // 2) Doctor receptionist (single doctor OR clinic doctor)
    const { data: doctorReceptionist, error: doctorReceptionistError } = await supabase
      .from("doctor_receptionists")
      .select("doctor_id, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (doctorReceptionistError) {
      await supabase.auth.signOut();
      throw doctorReceptionistError;
    }

    if (!doctorReceptionist) {
      await supabase.auth.signOut();
      setDialogMessage("Receptionist account not found. Please contact support.");
      setShowAccountNotFoundDialog(true);
      return { success: false };
    }

    if (doctorReceptionist.status !== "active") {
      await supabase.auth.signOut();
      setDialogMessage(
        "Your receptionist account is currently inactive. Please contact your doctor administrator."
      );
      setShowAccountNotFoundDialog(true);
      return { success: false };
    }

    const { data: doctorData, error: doctorError } = await supabase
      .from("doctors")
      .select("approved, clinic_id, trial_end_date")
      .eq("id", doctorReceptionist.doctor_id)
      .maybeSingle();

    if (doctorError || !doctorData) {
      await supabase.auth.signOut();
      setDialogMessage(
        "Assigned doctor account not found. Please contact your doctor administrator."
      );
      setShowAccountNotFoundDialog(true);
      return { success: false };
    }

    if (!doctorData.approved) {
      await supabase.auth.signOut();
      setDialogMessage(
        "Assigned doctor account is not active yet. Please contact your doctor administrator."
      );
      setShowAccountNotFoundDialog(true);
      return { success: false };
    }

    // Single doctor: check trial expiry
    if (!doctorData.clinic_id && doctorData.trial_end_date) {
      const trialEnd = new Date(doctorData.trial_end_date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (trialEnd < today) {
        await supabase.auth.signOut();
        setShowTrialExpiredDialog(true);
        return { success: false };
      }
    }

    // Clinic doctor: ensure clinic is active
    if (doctorData.clinic_id) {
      const { data: isActive, error: clinicActiveError } = await supabase.rpc(
        "is_clinic_active",
        { _clinic_id: doctorData.clinic_id }
      );

      if (clinicActiveError) {
        await supabase.auth.signOut();
        setDialogMessage("Unable to verify clinic status. Please contact support.");
        setShowAccountNotFoundDialog(true);
        return { success: false };
      }

      if (!isActive) {
        await supabase.auth.signOut();
        setShowClinicInactiveDialog(true);
        return { success: false };
      }
    }

    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
    return { success: true, path: "/doctor-receptionist/dashboard" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-info/20 to-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-primary/20 to-info/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Home Button */}
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        size="lg"
        className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
      >
        <Home className="mr-2 h-5 w-5 text-primary" />
        <span className="font-semibold text-primary">Back to Home</span>
      </Button>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <Card className="shadow-xl border-border/40 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center shadow-lg">
                  <img src={clinicLogo} alt="Logo" className="h-14 w-14 object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-info bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-1 mt-2">
                <Shield className="h-4 w-4" />
                Sign in to access your dashboard
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-info/10 px-4 py-2 rounded-full border border-primary/20">
              <LogIn className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Doctor | Clinic | Receptionist</span>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="bg-background/50 border-2 border-primary/20 focus:border-primary/40 transition-colors"
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
                  className="bg-background/50 border-2 border-primary/20 focus:border-primary/40 transition-colors"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary via-purple-600 to-info hover:from-primary/90 hover:via-purple-700 hover:to-info/90 text-white font-semibold py-5 shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border/40">
              <p className="text-sm text-center text-muted-foreground mb-4">
                Don't have an account?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/doctor-auth?tab=signup")}
                  className="border-2"
                >
                  Register as Doctor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth?tab=signup")}
                  className="border-2"
                >
                  Register as Clinic
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inactive Account Dialog */}
      <Dialog open={showInactiveDialog} onOpenChange={setShowInactiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Pending</DialogTitle>
            <DialogDescription>
              Your account is currently pending activation. Please contact support or wait for admin approval.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowInactiveDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Trial Expired Dialog */}
      <Dialog open={showTrialExpiredDialog} onOpenChange={setShowTrialExpiredDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trial Expired</DialogTitle>
            <DialogDescription>
              Your trial period has expired. Please contact support to activate your account with a subscription.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowTrialExpiredDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Clinic Inactive Dialog */}
      <Dialog open={showClinicInactiveDialog} onOpenChange={setShowClinicInactiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clinic Not Active</DialogTitle>
            <DialogDescription>
              Your clinic's account is not currently active. Please contact your clinic administrator or support for assistance.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowClinicInactiveDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Account Not Found / General Error Dialog */}
      <Dialog open={showAccountNotFoundDialog} onOpenChange={setShowAccountNotFoundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Issue</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowAccountNotFoundDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedLogin;
