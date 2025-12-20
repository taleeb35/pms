import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, Activity, Shield, Clock, Heart, Stethoscope, Sparkles, UserPlus, BarChart3, TrendingUp, DollarSign, Eye, ChartBar, LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clinicLogo from "@/assets/clinic-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const features = [
    {
      icon: UserPlus,
      title: "Unlimited Doctor Management",
      description: "Add and manage unlimited doctors in your clinic. Assign roles, track performance, and control access.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Complete Patient Tracking",
      description: "Track every patient visit, medical history, prescriptions, and treatment plans in one place.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Eye,
      title: "Activity Logs & Monitoring",
      description: "View detailed activity logs for each doctor. Monitor all actions, appointments, and patient interactions.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: DollarSign,
      title: "Finance Management",
      description: "Track clinic revenue, doctor earnings, patient payments, and maintain complete financial records.",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: TrendingUp,
      title: "Monthly Profit Analytics",
      description: "Get detailed monthly profit reports, revenue trends, and financial insights for your clinic.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Smart Appointment System",
      description: "Manage appointments across all doctors with automated scheduling and reminders.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: FileText,
      title: "Medical Records",
      description: "Secure digital storage for all medical documents, prescriptions, and test results.",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: ChartBar,
      title: "Performance Dashboard",
      description: "Real-time analytics showing clinic performance, patient flow, and doctor productivity.",
      color: "from-violet-500 to-fuchsia-500"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-level encryption with full data privacy compliance to protect patient information.",
      color: "from-blue-600 to-indigo-600"
    }
  ];

  const handleLoginSelect = (type: string) => {
    setShowLoginDialog(false);
    if (type === "clinic") {
      navigate("/auth");
    } else if (type === "doctor") {
      navigate("/doctor-auth");
    } else if (type === "receptionist") {
      navigate("/receptionist-auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Login to MedCare Pro
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="clinic" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clinic">Clinic</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="receptionist">Receptionist</TabsTrigger>
            </TabsList>
            <TabsContent value="clinic" className="mt-6 text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <UserPlus className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Clinic Owner</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your clinic, doctors, and staff
                </p>
                <Button 
                  onClick={() => handleLoginSelect("clinic")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue as Clinic
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="doctor" className="mt-6 text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <Stethoscope className="h-12 w-12 mx-auto text-purple-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Doctor</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Access your patients and appointments
                </p>
                <Button 
                  onClick={() => handleLoginSelect("doctor")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continue as Doctor
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="receptionist" className="mt-6 text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
                <Users className="h-12 w-12 mx-auto text-teal-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Receptionist</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage clinic operations as staff
                </p>
                <Button 
                  onClick={() => handleLoginSelect("receptionist")}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  Continue as Receptionist
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Header/Navbar */}
      <header className="border-b bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in">
            <img src={clinicLogo} alt="Clinic Logo" className="h-12 w-12 hover-scale" />
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
              onClick={() => navigate("/features")} 
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Features
            </Button>
            <Button 
              onClick={() => setShowLoginDialog(true)} 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
        
        <div className="max-w-5xl mx-auto space-y-8 relative">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-6 py-3 rounded-full border-2 border-purple-200 shadow-lg animate-fade-in hover-scale">
            <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              #1 Complete Clinic Management Solution
            </span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-extrabold leading-tight animate-fade-in">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              Manage Your Entire Clinic
            </span>
            <br />
            <span className="text-foreground">From One Dashboard</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Complete solution for clinic owners: <span className="font-semibold text-purple-600">Add unlimited doctors</span>, 
            track every patient visit, monitor all activities, and manage finances—all in one powerful platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm animate-fade-in">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Unlimited Doctors</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <Eye className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Activity Monitoring</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">Profit Analytics</span>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-6">
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg" 
              className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110"
            >
              Get Started
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => setShowLoginDialog(true)} 
              size="lg" 
              variant="outline"
              className="text-lg px-10 py-6 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { number: "50+", label: "Clinics Using", icon: Stethoscope, color: "from-blue-500 to-cyan-500" },
            { number: "500+", label: "Doctors Managed", icon: UserPlus, color: "from-purple-500 to-pink-500" },
            { number: "10K+", label: "Patients Tracked", icon: Users, color: "from-green-500 to-emerald-500" },
            { number: "99.9%", label: "Uptime", icon: Shield, color: "from-orange-500 to-red-500" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in border-2 border-transparent hover:border-purple-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-white/50 to-purple-50/30">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full border-2 border-purple-200 mb-6 shadow-md">
            <Activity className="h-5 w-5 text-purple-600 animate-pulse" />
            <span className="text-sm font-bold text-purple-900">Complete Clinic Management Features</span>
          </div>
          <h3 className="text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Everything a Clinic Owner Needs
            </span>
          </h3>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            From doctor management to financial tracking, get complete control over your clinic operations
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/90 backdrop-blur border-2 border-purple-100 rounded-3xl p-8 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}>
                <feature.icon className="h-9 w-9 text-white" strokeWidth={2.5} />
              </div>
              
              <h4 className="text-xl font-bold text-foreground mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 relative z-10">
                {feature.title}
              </h4>
              
              <p className="text-muted-foreground leading-relaxed relative z-10 text-base">
                {feature.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-semibold text-purple-600">Learn more →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-4 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Clinic Owners Choose Us
              </span>
            </h3>
            <p className="text-muted-foreground text-lg">The complete solution for modern clinic management</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Add Unlimited Doctors</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    No restrictions on the number of doctors. Scale your clinic as you grow. Manage credentials, schedules, and permissions for each doctor effortlessly.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-pink-200 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Complete Activity Tracking</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Monitor every action taken by your doctors. View appointment histories, patient interactions, prescriptions, and all medical records in real-time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Financial Management</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Track all payments, invoices, and expenses. Maintain complete financial records and ensure transparent accounting for your clinic operations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 border-2 border-amber-200 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Monthly Profit Reports</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Get automated monthly profit reports with detailed analytics. Understand revenue trends, doctor performance, and identify growth opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-20 text-center max-w-5xl mx-auto shadow-2xl overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent)]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-8 py-3 rounded-full border-2 border-white/30 mb-8 shadow-lg animate-fade-in">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
              <span className="text-sm font-bold text-white">Join 50+ Successful Clinics</span>
            </div>
            
            <h3 className="text-5xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
              Ready to Transform Your Clinic?
            </h3>
            
            <p className="text-white/95 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Start managing doctors, tracking patients, and monitoring finances—all from one powerful dashboard. No credit card required.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg" 
                className="text-lg px-12 py-7 bg-white text-purple-600 hover:bg-gray-50 shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-110 font-bold"
              >
                Clinic Sign Up
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate("/doctor-auth")} 
                size="lg" 
                variant="outline"
                className="text-lg px-12 py-7 bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30 shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-110 font-bold"
              >
                <Stethoscope className="mr-2 h-5 w-5" />
                Doctor Login
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-white/90 text-sm mt-10">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Secure & Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Unlimited Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <img src={clinicLogo} alt="Clinic Logo" className="h-16 w-16" />
            <div className="text-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MedCare Pro
              </span>
              <p className="text-sm text-muted-foreground mt-1">Complete Clinic Management Solution</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">&copy; 2025 MedCare Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
