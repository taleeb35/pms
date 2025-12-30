import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  Sparkles, 
  Users, 
  Zap,
  Shield,
  HeadphonesIcon,
  ArrowRight,
  Star,
  Calculator
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const Pricing = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [doctorCount, setDoctorCount] = useState(1);

  const MONTHLY_PRICE_PER_DOCTOR = 5999;
  const YEARLY_DISCOUNT = 0.17; // 17% discount

  const monthlyTotal = doctorCount * MONTHLY_PRICE_PER_DOCTOR;
  const yearlyMonthlyRate = Math.round(MONTHLY_PRICE_PER_DOCTOR * (1 - YEARLY_DISCOUNT));
  const yearlyTotal = doctorCount * yearlyMonthlyRate;
  const yearlySavings = (monthlyTotal - yearlyTotal) * 12;

  const features = [
    "Unlimited Patients",
    "Appointment Management",
    "Complete Patient Records",
    "Visit Records & History",
    "Prescription Management",
    "Finance & Revenue Tracking",
    "Custom Templates",
    "Activity Logs",
    "Email Support",
    "Data Security & Backups",
  ];

  const faqs = [
    {
      question: "How does the pricing work?",
      answer: "You pay Rs. 5,999 per doctor per month. Whether you're a single doctor or a clinic with multiple doctors, the rate stays the same."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! All signups come with a 14-day free trial. No credit card required to start."
    },
    {
      question: "What's the yearly discount?",
      answer: "When you choose annual billing, you get 17% off - that's Rs. 4,979 per doctor per month instead of Rs. 5,999."
    },
    {
      question: "Can I switch between monthly and yearly?",
      answer: "Yes, you can switch your billing cycle at any time. Changes will be reflected in your next billing period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major bank transfers, JazzCash, EasyPaisa, and can arrange other payment methods for clinics."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use bank-level encryption and comply with healthcare data protection standards to keep your data safe."
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            One Plan,{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Simple Pricing
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Rs. 5,999 per doctor per month. Save 17% with yearly billing.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Save 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Main Pricing Card */}
        <div className="max-w-lg mx-auto mb-16">
          <Card className="relative overflow-hidden border-2 border-primary shadow-2xl">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-semibold">
              <Star className="w-4 h-4 inline mr-1" />
              14-Day Free Trial Included
            </div>
            
            <CardHeader className="pt-12 pb-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Per Doctor</h3>
              <p className="text-muted-foreground text-sm">For individual doctors & clinics</p>
            </CardHeader>
            
            <CardContent className="pb-8">
              {/* Price Display */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">
                    {formatPrice(isAnnual ? yearlyMonthlyRate : MONTHLY_PRICE_PER_DOCTOR)}
                  </span>
                  <span className="text-muted-foreground">/doctor/month</span>
                </div>
                {isAnnual && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      {formatPrice(MONTHLY_PRICE_PER_DOCTOR)}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      Save {formatPrice(MONTHLY_PRICE_PER_DOCTOR - yearlyMonthlyRate)}/month
                    </span>
                  </div>
                )}
              </div>

              {/* Calculator */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Calculate Your Cost</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Label className="text-sm text-muted-foreground">Number of Doctors:</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDoctorCount(Math.max(1, doctorCount - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-bold">{doctorCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDoctorCount(Math.min(50, doctorCount + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Total:</span>
                    <span className="font-semibold">{formatPrice(isAnnual ? yearlyTotal : monthlyTotal)}</span>
                  </div>
                  {isAnnual && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Yearly Total:</span>
                        <span className="font-semibold">{formatPrice(yearlyTotal * 12)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>You Save:</span>
                        <span className="font-semibold">{formatPrice(yearlySavings)}/year</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button 
                className="w-full mb-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
                onClick={() => navigate("/login")}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground">All features included for every doctor</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Easy Setup", description: "Get started in minutes with our intuitive onboarding process" },
              { icon: Shield, title: "Data Security", description: "Bank-level encryption and regular backups to keep your data safe" },
              { icon: HeadphonesIcon, title: "Email Support", description: "Our support team is ready to help you succeed" },
            ].map((feature, index) => (
              <Card key={index} className="text-center p-6 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our pricing</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 border-primary/20 hover:border-primary/40 transition-all duration-300">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center pb-12">
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 p-12">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8"
                onClick={() => navigate("/login")}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer Links */}
        <div className="text-center pb-12">
          <p className="text-muted-foreground mb-4">
            Have more questions?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/features">View All Features</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

// Label component for calculator
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={className}>{children}</span>
);

export default Pricing;
