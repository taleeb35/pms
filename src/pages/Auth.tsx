import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [authType, setAuthType] = useState<"admin" | "doctor">("admin");
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Admin signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;
        if (!data.user) throw new Error("User creation failed");

        // Assign admin role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "admin",
        });

        if (roleError) throw roleError;

        toast({
          title: "Success!",
          description: "Your admin account has been created. You can now log in.",
        });

        setIsSignup(false);
        setPassword("");
      } else {
        // Admin login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
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

  const handleDoctorAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Doctor signup - awaits admin approval
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;
        if (!data.user) throw new Error("User creation failed");

        // Update profile with contact info
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            phone: contactNumber,
            city: city,
          })
          .eq("id", data.user.id);

        if (profileError) throw profileError;

        // Create doctor record (not approved yet)
        const { error: doctorError } = await supabase.from("doctors").insert({
          id: data.user.id,
          specialization: "Pending",
          qualification: "Pending",
          city: city,
          contact_number: contactNumber,
          approved: false,
        });

        if (doctorError) throw doctorError;

        toast({
          title: "Signup successful!",
          description: "Your account is pending admin approval. You'll be notified once approved.",
        });

        setIsSignup(false);
        setPassword("");
      } else {
        // Doctor login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if doctor is approved
        const { data: doctorData, error: doctorError } = await supabase
          .from("doctors")
          .select("approved")
          .eq("id", data.user.id)
          .single();

        if (doctorError || !doctorData) {
          await supabase.auth.signOut();
          throw new Error("Doctor profile not found. Please contact admin.");
        }

        if (!doctorData.approved) {
          await supabase.auth.signOut();
          throw new Error("Your account is pending admin approval. Please wait for approval.");
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Patient Management System
          </CardTitle>
          <CardDescription className="text-center">
            {authType === "admin"
              ? isSignup
                ? "Create your clinic admin account"
                : "Admin login to manage your clinic"
              : isSignup
              ? "Doctor signup - Awaiting admin approval"
              : "Doctor login to access the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={authType} onValueChange={(v) => setAuthType(v as "admin" | "doctor")} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>
          </Tabs>

          {authType === "admin" ? (
            <form onSubmit={handleAdminAuth} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignup ? "Create Admin Account" : "Sign In as Admin"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleDoctorAuth} className="space-y-4">
              {isSignup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="doctorFullName">Full Name</Label>
                    <Input
                      id="doctorFullName"
                      type="text"
                      placeholder="Dr. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      placeholder="+1234567890"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="doctorEmail">Email</Label>
                <Input
                  id="doctorEmail"
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorPassword">Password</Label>
                <Input
                  id="doctorPassword"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignup ? "Submit for Approval" : "Sign In as Doctor"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setEmail("");
                setPassword("");
                setFullName("");
                setContactNumber("");
                setCity("");
              }}
              className="text-primary hover:underline"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : authType === "doctor"
                ? "New doctor? Sign up here"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
