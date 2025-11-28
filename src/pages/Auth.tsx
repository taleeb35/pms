import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CitySelect } from "@/components/CitySelect";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Patient Management System
          </CardTitle>
          <CardDescription className="text-center">
            {isSignup
              ? "Register your clinic with us"
              : "Clinic login to access the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleClinicAuth} className="space-y-4">
              {isSignup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    <Input
                      id="clinicName"
                      type="text"
                      placeholder="City Medical Center"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+92 300 1234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <CitySelect
                      label="City"
                      value={city}
                      onValueChange={setCity}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noOfDoctors">Number of Doctors</Label>
                    <Input
                      id="noOfDoctors"
                      type="number"
                      placeholder="5"
                      min="0"
                      value={noOfDoctors}
                      onChange={(e) => setNoOfDoctors(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="clinicEmail">Email</Label>
                <Input
                  id="clinicEmail"
                  type="email"
                  placeholder="clinic@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicPassword">Password</Label>
                <Input
                  id="clinicPassword"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignup ? "Create Clinic Account" : "Sign In as Clinic"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
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
              className="text-primary hover:underline"
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
