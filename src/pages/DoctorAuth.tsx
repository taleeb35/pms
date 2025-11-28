import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home, Stethoscope, Sparkles, Loader2 } from "lucide-react";
import clinicLogo from "@/assets/clinic-logo.png";

const DoctorAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if doctor is approved
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select("approved")
        .eq("id", authData.user.id)
        .single();

      if (doctorError || !doctorData) {
        await supabase.auth.signOut();
        throw new Error("Doctor profile not found. Please contact your clinic.");
      }

      if (!doctorData.approved) {
        await supabase.auth.signOut();
        throw new Error("Your account is pending approval. Please contact your clinic.");
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

      <Card className="w-full max-w-md relative z-10 border-2 border-teal-200 shadow-2xl bg-white/95 backdrop-blur-sm animate-fade-in">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2 animate-fade-in">
            <div className="relative">
              <img src={clinicLogo} alt="Clinic Logo" className="h-20 w-20 hover-scale" />
              <Stethoscope className="absolute -bottom-1 -right-1 h-8 w-8 text-teal-600 bg-white rounded-full p-1 shadow-lg" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Doctor Login
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Sign in to access your dashboard and manage patients
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100 to-cyan-100 px-4 py-2 rounded-full border border-teal-200">
            <Stethoscope className="h-4 w-4 text-teal-600" />
            <span className="text-sm font-semibold text-teal-900">Doctor Portal</span>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 mb-6 border border-amber-200 animate-fade-in">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Need an Account?</p>
                <p className="text-xs text-muted-foreground">Contact your clinic administrator to create your doctor account.</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
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
            
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '50ms' }}>
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-teal-200 focus:border-teal-400 transition-colors"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 hover:from-green-700 hover:via-teal-700 hover:to-cyan-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {!loading && <Stethoscope className="mr-2 h-5 w-5" />}
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAuth;
