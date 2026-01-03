import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import clinicLogo from "@/assets/main-logo.webp";
import { validateEmail } from "@/lib/validations";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
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
      // First, check if the account exists and is active
      // Check for clinic account
      const { data: clinicData } = await supabase
        .from("profiles")
        .select("id, clinics(status)")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      // Check for doctor account
      const { data: doctorData } = await supabase
        .from("profiles")
        .select("id, doctors(approved, clinic_id, clinics:clinic_id(status))")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      // Check if user is a clinic and if it's active
      if (clinicData?.clinics && (clinicData.clinics as any)?.status !== "active") {
        toast({
          title: "Account Not Active",
          description: "Your clinic account is not active yet. Please wait for admin approval before resetting your password.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if user is a doctor and if they're approved
      if (doctorData?.doctors) {
        const doctor = doctorData.doctors as any;
        
        // Check if doctor is approved
        if (!doctor.approved) {
          toast({
            title: "Account Not Active",
            description: "Your doctor account is not approved yet. Please wait for approval before resetting your password.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // If doctor belongs to a clinic, check if clinic is active
        if (doctor.clinic_id && doctor.clinics?.status !== "active") {
          toast({
            title: "Clinic Not Active",
            description: "Your clinic is not active. Please contact your clinic administrator.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Use Supabase's built-in password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      // Also send a custom email via our edge function
      try {
        await supabase.functions.invoke("send-password-reset-email", {
          body: { email },
        });
      } catch (emailError) {
        console.error("Custom email error:", emailError);
        // Don't fail if custom email fails - Supabase sends its own
      }

      setEmailSent(true);
      toast({
        title: "Email Sent",
        description: "Check your inbox for password reset instructions.",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 z-10 gap-2 hover:bg-background/80 backdrop-blur-sm"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Go Back
      </Button>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-primary/20 backdrop-blur-sm bg-card/95 animate-scale-in">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <img src={clinicLogo} alt="Logo" className="h-16 w-16 object-contain animate-fade-in" />
          </div>
          
          {emailSent ? (
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-base">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </CardDescription>
            </div>
          ) : (
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-base">
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6 pb-8">
          {!emailSent ? (
            <form onSubmit={handleResetRequest} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-primary/20 focus:border-primary transition-all duration-300 bg-background/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary via-purple-600 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Reset Link
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Try a Different Email
              </Button>
              <Button 
                onClick={() => navigate("/")}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <button 
                onClick={() => navigate(-1)}
                className="text-primary hover:underline font-medium"
              >
                Go back to login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
