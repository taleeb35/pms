import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserCog, Sparkles, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import clinicLogo from "@/assets/clinic-logo.png";
import { validateEmail } from "@/lib/validations";

const ReceptionistAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicInactiveDialog, setClinicInactiveDialog] = useState(false);
  const [accountInactiveDialog, setAccountInactiveDialog] = useState(false);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is a receptionist
      const { data: receptionistData, error: receptionistError } = await supabase
        .from("clinic_receptionists")
        .select("clinic_id, status")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (receptionistError) throw receptionistError;

      if (!receptionistData) {
        await supabase.auth.signOut();
        throw new Error("This account is not registered as a receptionist");
      }

      // Check if receptionist account is active
      if (receptionistData.status !== "active") {
        await supabase.auth.signOut();
        setAccountInactiveDialog(true);
        return;
      }

      // Check if clinic is active
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("status")
        .eq("id", receptionistData.clinic_id)
        .single();

      if (clinicError) throw clinicError;

      if (clinicData.status !== "active") {
        await supabase.auth.signOut();
        setClinicInactiveDialog(true);
        return;
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate("/receptionist/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-info/20 to-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-primary/20 to-info/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 gap-2 hover:bg-card/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-border/40 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-info/20 to-primary/20 flex items-center justify-center shadow-lg">
                  <img src={clinicLogo} alt="Logo" className="h-14 w-14 object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-info flex items-center justify-center shadow-md">
                  <UserCog className="h-4 w-4 text-info-foreground" />
                </div>
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Receptionist Login</CardTitle>
              <CardDescription className="flex items-center justify-center gap-1 mt-2">
                <Shield className="h-4 w-4" />
                Access your clinic's management system
              </CardDescription>
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
                  placeholder="receptionist@clinic.com"
                  className="bg-background/50"
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
                  className="bg-background/50"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
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

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Contact your clinic administrator for account access
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinic Inactive Dialog */}
      <Dialog open={clinicInactiveDialog} onOpenChange={setClinicInactiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clinic Not Active</DialogTitle>
            <DialogDescription>
              Your clinic's account is not currently active. Please contact your clinic administrator or support for assistance.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setClinicInactiveDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Account Inactive Dialog */}
      <Dialog open={accountInactiveDialog} onOpenChange={setAccountInactiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Not Active</DialogTitle>
            <DialogDescription>
              Your receptionist account is currently inactive (draft). Please contact your clinic administrator to activate your account.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setAccountInactiveDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceptionistAuth;
