import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home, Building2, Sparkles } from "lucide-react";
import { CitySelect } from "@/components/CitySelect";
import clinicLogo from "@/assets/clinic-logo.png";

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();


  const handleClinicAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

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

        // Create clinic record
        const { error: clinicError } = await supabase.from("clinics").insert({
          id: data.user.id,
          clinic_name: clinicName,
          city: city,
          phone_number: phoneNumber,
          address: address,
          no_of_doctors: parseInt(noOfDoctors) || 0,
        });

        if (clinicError) throw clinicError;

        // Assign clinic role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "clinic",
        });

        if (roleError) throw roleError;

        toast({
          title: "Signup successful!",
          description: "Your clinic account has been created. You can now log in.",
        });

        setIsSignup(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        // Clinic login
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check clinic status
        const { data: clinicData, error: clinicError } = await supabase
          .from("clinics")
          .select("status, clinic_name")
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

        // Check if clinic is active
        if (clinicData.status !== "active") {
          // Sign out the user immediately
          await supabase.auth.signOut();
          
          if (clinicData.status === "draft") {
            throw new Error(
              "Your clinic account is pending approval. An administrator needs to activate your account before you can log in. Please contact support if you've been waiting for more than 24 hours."
            );
          } else {
            throw new Error(
              `Your clinic account status is "${clinicData.status}". Please contact support for assistance.`
            );
          }
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
                  <Label htmlFor="clinicName" className="text-sm font-semibold">Clinic Name</Label>
                  <Input
                    id="clinicName"
                    type="text"
                    placeholder="City Medical Center"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    required
                    className="border-2 border-purple-200 focus:border-purple-400 transition-colors"
                  />
                </div>
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '50ms' }}>
                  <Label htmlFor="phoneNumber" className="text-sm font-semibold">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="border-2 border-purple-200 focus:border-purple-400 transition-colors"
                  />
                </div>
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <CitySelect
                    label="City"
                    value={city}
                    onValueChange={setCity}
                    required
                  />
                </div>
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '150ms' }}>
                  <Label htmlFor="address" className="text-sm font-semibold">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="border-2 border-purple-200 focus:border-purple-400 transition-colors"
                  />
                </div>
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <Label htmlFor="noOfDoctors" className="text-sm font-semibold">Number of Doctors</Label>
                  <Input
                    id="noOfDoctors"
                    type="number"
                    placeholder="5"
                    min="0"
                    value={noOfDoctors}
                    onChange={(e) => setNoOfDoctors(e.target.value)}
                    required
                    className="border-2 border-purple-200 focus:border-purple-400 transition-colors"
                  />
                </div>
              </>
            )}
            
            <div className={`space-y-2 ${isSignup ? 'animate-fade-in' : ''}`} style={{ animationDelay: '250ms' }}>
              <Label htmlFor="clinicEmail" className="text-sm font-semibold">Email</Label>
              <Input
                id="clinicEmail"
                type="email"
                placeholder="clinic@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-purple-200 focus:border-purple-400 transition-colors"
              />
            </div>
            
            <div className={`space-y-2 ${isSignup ? 'animate-fade-in' : ''}`} style={{ animationDelay: '300ms' }}>
              <Label htmlFor="clinicPassword" className="text-sm font-semibold">Password</Label>
              <Input
                id="clinicPassword"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-2 border-purple-200 focus:border-purple-400 transition-colors"
              />
            </div>
            
            {isSignup && (
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: '350ms' }}>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-2 border-purple-200 focus:border-purple-400 transition-colors"
                />
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
    </div>
  );
};

export default Auth;
