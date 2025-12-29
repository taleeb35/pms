import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  X, 
  Sparkles, 
  Building2, 
  Users, 
  Crown,
  Zap,
  Shield,
  HeadphonesIcon,
  ArrowRight,
  Star
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const Pricing = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small clinics just getting started",
      icon: Building2,
      monthlyPrice: 2999,
      annualPrice: 2499,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      popular: false,
      features: [
        { name: "Up to 3 Doctors", included: true },
        { name: "Up to 500 Patients", included: true },
        { name: "Appointment Management", included: true },
        { name: "Basic Patient Records", included: true },
        { name: "Email Support", included: true },
        { name: "Basic Reports", included: true },
        { name: "Activity Logs", included: false },
        { name: "Finance Management", included: false },
        { name: "Custom Templates", included: false },
        { name: "Priority Support", included: false },
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      description: "For growing clinics that need more power",
      icon: Users,
      monthlyPrice: 5999,
      annualPrice: 4999,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-300",
      popular: true,
      features: [
        { name: "Up to 10 Doctors", included: true },
        { name: "Up to 2,000 Patients", included: true },
        { name: "Appointment Management", included: true },
        { name: "Complete Patient Records", included: true },
        { name: "Priority Email Support", included: true },
        { name: "Advanced Reports", included: true },
        { name: "Activity Logs", included: true },
        { name: "Finance Management", included: true },
        { name: "Custom Templates", included: true },
        { name: "Priority Support", included: false },
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      description: "For large clinics and hospital chains",
      icon: Crown,
      monthlyPrice: 9999,
      annualPrice: 8499,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      popular: false,
      features: [
        { name: "Unlimited Doctors", included: true },
        { name: "Unlimited Patients", included: true },
        { name: "Appointment Management", included: true },
        { name: "Complete Patient Records", included: true },
        { name: "24/7 Phone & Email Support", included: true },
        { name: "Custom Reports & Analytics", included: true },
        { name: "Activity Logs", included: true },
        { name: "Finance Management", included: true },
        { name: "Custom Templates", included: true },
        { name: "Dedicated Account Manager", included: true },
      ],
      cta: "Contact Sales"
    }
  ];

  const faqs = [
    {
      question: "Can I switch plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! All plans come with a 14-day free trial. No credit card required to start."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and bank transfers for annual plans."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with no hidden fees or penalties."
    },
    {
      question: "Do you offer discounts for annual billing?",
      answer: "Yes, you save up to 17% when you choose annual billing over monthly billing."
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Choose the Perfect{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Plan for Your Clinic
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Save 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular 
                  ? "border-2 border-primary shadow-xl scale-105 z-10" 
                  : `border-2 ${plan.borderColor}`
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-semibold">
                  <Star className="w-4 h-4 inline mr-1" />
                  Most Popular
                </div>
              )}
              
              <CardHeader className={`pt-${plan.popular ? '12' : '6'} pb-4`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pb-8">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {formatPrice(isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Billed annually ({formatPrice(plan.annualPrice * 12)}/year)
                    </p>
                  )}
                </div>

                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => navigate("/login")}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">All Plans Include</h2>
            <p className="text-muted-foreground">Essential features available in every plan</p>
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
              Ready to Transform Your Clinic?
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
                Contact Sales
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

export default Pricing;
