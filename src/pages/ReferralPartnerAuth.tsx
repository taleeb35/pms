import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, ArrowLeft, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const ReferralPartnerAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !referralCode.trim()) {
      toast.error("Please enter both email and referral code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("referral_partners")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .eq("referral_code", referralCode.toUpperCase().trim())
        .single();

      if (error || !data) {
        toast.error("Invalid email or referral code");
        return;
      }

      if (data.status !== "approved" && data.status !== "active") {
        toast.error("Your partner account is pending approval. Please wait for admin verification.");
        return;
      }

      // Store partner info in sessionStorage for the dashboard
      sessionStorage.setItem("referral_partner", JSON.stringify(data));
      toast.success("Welcome back!");
      navigate("/referral-partner/dashboard");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="back_home inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Partner Dashboard
            </CardTitle>
            <CardDescription>Enter your credentials to access your referral dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-purple-200 focus:border-purple-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code</Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="YOUR CODE"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="border-2 border-purple-200 focus:border-purple-400 uppercase"
                  maxLength={10}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Not a partner yet?{" "}
                <Link to="/referral-program" className="text-purple-600 hover:underline font-medium">
                  Join our program
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralPartnerAuth;
