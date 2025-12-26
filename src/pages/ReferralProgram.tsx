import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Users, Coins, Share2, TrendingUp, CheckCircle, Gift, Percent, Copy } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
});

type FormData = z.infer<typeof formSchema>;

interface SuccessData {
  referralCode: string;
  fullName: string;
}

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
    },
  });

  // Generate a unique referral code
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Referral code copied to clipboard!");
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const referralCode = generateReferralCode();

      // IMPORTANT: don't call .select() here because public users don't have SELECT access
      // to the referral_partners table (they only have INSERT).
      const { error } = await supabase
        .from("referral_partners")
        .insert(
          {
            full_name: data.full_name.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            referral_code: referralCode,
          },
          { returning: "minimal" }
        );

      if (error) {
        if (error.code === "23505") {
          form.setError("email", {
            type: "manual",
            message: "This email is already registered as a referral partner",
          });
          return;
        }
        console.error("Referral partner insert failed:", error);
        throw error;
      }

      // Send welcome email (don't fail the whole flow if it fails)
      try {
        await supabase.functions.invoke("send-referral-partner-email", {
          body: {
            full_name: data.full_name.trim(),
            email: data.email.toLowerCase().trim(),
            referral_code: referralCode,
            type: "signup",
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      setSuccessData({ referralCode, fullName: data.full_name.trim() });
      form.reset();
    } catch (error: any) {
      console.error("Error submitting referral application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Percent,
      title: "20% Commission",
      description: "Earn 20% commission on every successful referral's subscription",
    },
    {
      icon: TrendingUp,
      title: "Unlimited Earnings",
      description: "No cap on your earnings - the more you refer, the more you earn",
    },
    {
      icon: Gift,
      title: "Unique Referral Code",
      description: "Get your personal referral code to share with potential clients",
    },
    {
      icon: Coins,
      title: "Monthly Payouts",
      description: "Receive your commissions every month directly to your account",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Fill out the simple form below to join our referral program",
    },
    {
      number: "02",
      title: "Get Your Code",
      description: "Receive your unique referral code after approval",
    },
    {
      number: "03",
      title: "Share & Refer",
      description: "Share your code with clinics and doctors who need our system",
    },
    {
      number: "04",
      title: "Earn Commission",
      description: "Earn 20% commission when your referrals subscribe",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Share2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Referral Program</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Earn <span className="text-primary">20% Commission</span> with Every Referral
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our referral program and earn generous commissions by recommending our clinic management system to healthcare providers in your network.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-primary">20%</span>
              <span className="text-sm text-muted-foreground">Commission Rate</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-primary">∞</span>
              <span className="text-sm text-muted-foreground">No Earning Limit</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-primary">30</span>
              <span className="text-sm text-muted-foreground">Day Cookie Period</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Our Referral Program?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section className="py-16 px-4 bg-muted/30" id="signup">
        <div className="container mx-auto max-w-xl">
          <Card className="border-0 shadow-2xl">
            {successData ? (
              <>
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Application Submitted!</CardTitle>
                  <CardDescription>
                    Thank you for joining our referral program, {successData.fullName}!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-bold tracking-wider text-primary">
                        {successData.referralCode}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(successData.referralCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/40 border border-border rounded-lg p-4">
                    <p className="text-sm text-foreground">
                      <strong>Important:</strong> Please save your referral code. Your application is pending approval.
                      Once approved, you can start sharing your code and earning commissions!
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      We've also sent this information to your email. Check your inbox!
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSuccessData(null)}
                      className="w-full"
                    >
                      Submit Another Application
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Join Our Referral Program</CardTitle>
                  <CardDescription>
                    Fill out the form below to become a referral partner and start earning commissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Already a partner?{" "}
                      <a href="/referral-partner/login" className="text-primary hover:underline font-medium">
                        Access your dashboard
                      </a>
                    </p>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-md">
              <h3 className="font-semibold mb-2">How do I earn commissions?</h3>
              <p className="text-muted-foreground text-sm">
                When someone signs up using your referral code and subscribes to our service, you earn 20% of their subscription fee as commission.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-md">
              <h3 className="font-semibold mb-2">When do I get paid?</h3>
              <p className="text-muted-foreground text-sm">
                Commissions are calculated monthly and paid out within the first week of the following month to your registered bank account.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-md">
              <h3 className="font-semibold mb-2">Is there a limit to how much I can earn?</h3>
              <p className="text-muted-foreground text-sm">
                No! There's no cap on your earnings. The more clinics and doctors you refer, the more you earn. Your earning potential is unlimited.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-md">
              <h3 className="font-semibold mb-2">How long does approval take?</h3>
              <p className="text-muted-foreground text-sm">
                We typically review and approve applications within 24-48 hours. You'll receive an email with your unique referral code once approved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ReferralProgram;
