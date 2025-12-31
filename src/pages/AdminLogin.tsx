import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Home, Shield, Lock, Sparkles } from "lucide-react";
import clinicLogo from "@/assets/clinic-logo.png";

const AdminLogin = () => {
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

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      navigate("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Back to Home Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 z-10 gap-2 hover:bg-background/80 backdrop-blur-sm"
        onClick={() => navigate("/")}
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Button>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-primary/20 backdrop-blur-sm bg-card/95 animate-scale-in">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <img src={clinicLogo} alt="MedCare Pro" className="h-16 w-16 object-contain animate-fade-in" />
              <div className="absolute -top-1 -right-1">
                <Shield className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                Admin Portal
              </CardTitle>
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <CardDescription className="text-base">
              Secure access to system administration
            </CardDescription>
          </div>

          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              <Shield className="h-3 w-3" />
              Super Admin
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Lock className="h-3 w-3" />
              Secure Login
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@medcarepro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-primary/20 focus:border-primary transition-all duration-300 bg-background/50"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Access Admin Dashboard
                </span>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" />
              Protected by enterprise-grade security
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
