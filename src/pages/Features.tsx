import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Users, FileText, Activity, Shield, Clock, Heart, Stethoscope, 
  Sparkles, UserPlus, BarChart3, TrendingUp, DollarSign, Eye, ChartBar, 
  LogIn, CheckCircle2, Clipboard, PillIcon, TestTube, FileBarChart, 
  Bell, Lock, Zap, Globe, HeadphonesIcon, ArrowRight, Play,
  Building2, CreditCard, Receipt, ClipboardList, UserCog, CalendarCheck,
  FilePlus, FileSearch, MessageSquare, BadgeCheck, Layers, Settings
} from "lucide-react";
import clinicLogo from "@/assets/clinic-logo.png";

const Features = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: Building2,
      title: "Complete Clinic Management",
      description: "Centralized dashboard to manage your entire clinic operations. Control multiple doctors, staff, and departments from a single interface.",
      benefits: ["Multi-location support", "Role-based access control", "Real-time overview", "Customizable settings"],
      color: "from-blue-500 to-cyan-500",
      bgPattern: "bg-gradient-to-br from-blue-50 to-cyan-50"
    },
    {
      icon: UserPlus,
      title: "Unlimited Doctor Management",
      description: "Add and manage unlimited doctors in your clinic. Track performance, set schedules, and monitor activities for each doctor.",
      benefits: ["No doctor limits", "Performance tracking", "Schedule management", "Activity monitoring"],
      color: "from-purple-500 to-pink-500",
      bgPattern: "bg-gradient-to-br from-purple-50 to-pink-50"
    },
    {
      icon: Users,
      title: "Patient Management System",
      description: "Complete patient lifecycle management from registration to follow-ups. Store medical history, allergies, and all health records securely.",
      benefits: ["Digital health records", "Visit history tracking", "Allergy management", "Emergency contacts"],
      color: "from-green-500 to-emerald-500",
      bgPattern: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      icon: Calendar,
      title: "Smart Appointment System",
      description: "Intelligent appointment scheduling with conflict detection, automated reminders, and walk-in management capabilities.",
      benefits: ["Online booking", "Automated reminders", "Walk-in support", "Calendar sync"],
      color: "from-orange-500 to-amber-500",
      bgPattern: "bg-gradient-to-br from-orange-50 to-amber-50"
    },
    {
      icon: DollarSign,
      title: "Finance & Revenue Tracking",
      description: "Comprehensive financial management including consultation fees, procedure charges, refunds, and detailed profit analytics.",
      benefits: ["Revenue tracking", "Expense management", "Profit reports", "Payment history"],
      color: "from-emerald-500 to-teal-500",
      bgPattern: "bg-gradient-to-br from-emerald-50 to-teal-50"
    },
    {
      icon: FileText,
      title: "Medical Templates",
      description: "Pre-built templates for prescriptions, sick leaves, work leaves, test reports, and disease-specific treatments to save time.",
      benefits: ["Prescription templates", "Leave certificates", "Report templates", "Custom templates"],
      color: "from-indigo-500 to-purple-500",
      bgPattern: "bg-gradient-to-br from-indigo-50 to-purple-50"
    }
  ];

  const detailedFeatures = [
    {
      category: "Patient Management",
      icon: Users,
      color: "from-blue-600 to-cyan-600",
      items: [
        { icon: UserPlus, title: "Patient Registration", desc: "Quick registration with unique patient IDs and QR codes" },
        { icon: FileSearch, title: "Medical History", desc: "Complete medical history tracking for each patient" },
        { icon: Heart, title: "Allergies & Diseases", desc: "Track major diseases and allergies for safety alerts" },
        { icon: ClipboardList, title: "Visit Records", desc: "Detailed records of each visit with vitals and notes" },
        { icon: Calendar, title: "Pregnancy Tracking", desc: "Specialized tracking for gynecology practices" },
        { icon: MessageSquare, title: "Patient Notes", desc: "Confidential notes only visible to treating doctors" }
      ]
    },
    {
      category: "Appointment System",
      icon: Calendar,
      color: "from-purple-600 to-pink-600",
      items: [
        { icon: CalendarCheck, title: "Smart Scheduling", desc: "Intelligent slot management with conflict detection" },
        { icon: Clock, title: "Duration Control", desc: "Custom appointment durations for different visit types" },
        { icon: Bell, title: "Status Updates", desc: "Track appointments: scheduled, in-progress, completed" },
        { icon: Users, title: "Walk-in Queue", desc: "Manage walk-in patients with priority system" },
        { icon: Activity, title: "Waitlist Management", desc: "Add patients to waitlist when fully booked" },
        { icon: Receipt, title: "Fee Collection", desc: "Collect consultation and procedure fees at booking" }
      ]
    },
    {
      category: "Finance Management",
      icon: DollarSign,
      color: "from-green-600 to-emerald-600",
      items: [
        { icon: CreditCard, title: "Fee Structure", desc: "Customizable consultation and procedure fees" },
        { icon: TrendingUp, title: "Revenue Analytics", desc: "Daily, weekly, and monthly revenue reports" },
        { icon: BarChart3, title: "Profit Tracking", desc: "Track clinic and doctor profit sharing" },
        { icon: Receipt, title: "Invoice Generation", desc: "Automatic invoice creation for all services" },
        { icon: DollarSign, title: "Refund Management", desc: "Process and track refunds with notes" },
        { icon: ChartBar, title: "Financial Reports", desc: "Exportable reports for accounting purposes" }
      ]
    },
    {
      category: "Templates & Documents",
      icon: FileText,
      color: "from-orange-600 to-amber-600",
      items: [
        { icon: PillIcon, title: "Prescription Templates", desc: "Disease-wise prescription templates for quick writing" },
        { icon: FileBarChart, title: "Report Templates", desc: "Customizable fields for test and medical reports" },
        { icon: FilePlus, title: "Sick Leave Certificates", desc: "Professional sick leave document generation" },
        { icon: Clipboard, title: "Work Leave Letters", desc: "Work leave templates with customizable content" },
        { icon: TestTube, title: "Test Templates", desc: "Frequently ordered tests as quick templates" },
        { icon: FileText, title: "Print & Export", desc: "Print-ready documents with clinic branding" }
      ]
    },
    {
      category: "Clinical Data",
      icon: Activity,
      color: "from-red-600 to-pink-600",
      items: [
        { icon: Stethoscope, title: "ICD Codes", desc: "International disease classification codes" },
        { icon: Layers, title: "Procedures List", desc: "Customizable procedure catalog with pricing" },
        { icon: BadgeCheck, title: "Specializations", desc: "Manage doctor specializations for your clinic" },
        { icon: Heart, title: "Allergy Database", desc: "Clinic-wide allergy list for quick selection" },
        { icon: Activity, title: "Disease Catalog", desc: "Common diseases for fast diagnosis entry" },
        { icon: FileSearch, title: "Quick Search", desc: "Search across all clinical data instantly" }
      ]
    },
    {
      category: "Staff Management",
      icon: UserCog,
      color: "from-indigo-600 to-purple-600",
      items: [
        { icon: UserPlus, title: "Doctor Onboarding", desc: "Easy doctor addition with credential verification" },
        { icon: Users, title: "Receptionist Access", desc: "Dedicated receptionist portal with limited access" },
        { icon: Eye, title: "Activity Logs", desc: "Track all staff actions for accountability" },
        { icon: Settings, title: "Permission Control", desc: "Role-based access to sensitive information" },
        { icon: BarChart3, title: "Performance Metrics", desc: "Track doctor productivity and patient load" },
        { icon: Lock, title: "Secure Access", desc: "Individual login credentials for all staff" }
      ]
    }
  ];

  const roleFeatures = [
    {
      role: "Clinic Owner",
      icon: Building2,
      color: "from-blue-500 to-purple-500",
      features: [
        "Full dashboard with all analytics",
        "Add/remove doctors and staff",
        "View all financial reports",
        "Monitor doctor activities",
        "Manage clinic settings",
        "Access all patient records",
        "Handle support tickets",
        "Configure templates"
      ]
    },
    {
      role: "Doctor",
      icon: Stethoscope,
      color: "from-purple-500 to-pink-500",
      features: [
        "Personal patient list",
        "Appointment management",
        "Visit record creation",
        "Prescription writing",
        "Template management",
        "Financial overview",
        "Walk-in handling",
        "Patient history access"
      ]
    },
    {
      role: "Receptionist",
      icon: HeadphonesIcon,
      color: "from-teal-500 to-cyan-500",
      features: [
        "Patient registration",
        "Appointment booking",
        "Walk-in management",
        "Waitlist handling",
        "Basic patient info",
        "Fee collection",
        "Queue management",
        "Doctor schedules"
      ]
    }
  ];

  const securityFeatures = [
    { icon: Lock, title: "Bank-Level Encryption", desc: "All data encrypted with AES-256 encryption" },
    { icon: Shield, title: "HIPAA Compliant", desc: "Designed following healthcare privacy standards" },
    { icon: Eye, title: "Audit Trails", desc: "Complete logs of all system activities" },
    { icon: UserCog, title: "Role-Based Access", desc: "Granular permissions for different user types" },
    { icon: Globe, title: "Secure Cloud", desc: "Data hosted on secure cloud infrastructure" },
    { icon: Zap, title: "99.9% Uptime", desc: "Reliable service with minimal downtime" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <img src={clinicLogo} alt="Clinic Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MedCare Pro
              </h1>
              <p className="text-xs text-muted-foreground">Complete Clinic Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/10 via-purple-400/10 to-transparent blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto space-y-6 relative">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-5 py-2 rounded-full border border-purple-200 shadow-md">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Complete Feature Overview</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Everything You Need to
            </span>
            <br />
            <span className="text-foreground">Run Your Clinic</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From patient registration to financial reporting, discover how MedCare Pro 
            simplifies every aspect of clinic management.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-purple-300 hover:bg-purple-50"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Core Features
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful modules designed specifically for modern healthcare practices
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`group relative ${feature.bgPattern} rounded-3xl p-8 border-2 border-white/50 hover:border-purple-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
              
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Features by Category */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Detailed Feature Breakdown
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore every capability organized by category
            </p>
          </div>

          <div className="space-y-16 max-w-7xl mx-auto">
            {detailedFeatures.map((category, catIndex) => (
              <div key={catIndex} className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${category.color} shadow-lg`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {category.category}
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1 group-hover:text-purple-600 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Features by User Role
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tailored access and features for every member of your team
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roleFeatures.map((role, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${role.color} mb-6 shadow-lg`}>
                <role.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-6">
                {role.role}
              </h3>
              
              <ul className="space-y-3">
                {role.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full border border-white/20 mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-semibold">Enterprise-Grade Security</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Data is Safe with Us
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              We take security seriously. Your patient data is protected with industry-leading security measures.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-white/60">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Clinic?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of clinics already using MedCare Pro to streamline their operations and provide better patient care.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-white/90 shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={clinicLogo} alt="Clinic Logo" className="h-10 w-10" />
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MedCare Pro
                </h3>
                <p className="text-xs text-muted-foreground">Complete Clinic Management</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MedCare Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
