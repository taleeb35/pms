import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, Activity, Shield, Clock, Heart, Stethoscope, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Easily manage patient records, medical history, and personal information in one secure place.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Schedule and manage appointments with an intuitive calendar interface.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "Medical Documents",
      description: "Upload and manage medical documents, prescriptions, and test results securely.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Activity,
      title: "Medical History",
      description: "Track and record patient medical history, conditions, and treatments over time.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-level encryption ensures all patient data remains confidential and secure.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access patient information and manage your practice anytime, anywhere.",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header/Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Heart className="h-7 w-7 text-red-500 animate-pulse" fill="currentColor" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Patient Management System
            </h1>
          </div>
          <Button 
            onClick={() => navigate("/auth")} 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Stethoscope className="mr-2 h-5 w-5" />
            Clinic Login / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 blur-3xl -z-10"></div>
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-2 rounded-full border border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Next-Generation Healthcare Platform</span>
          </div>
          <h2 className="text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Modern Healthcare
            </span>
            <br />
            <span className="text-foreground">Management Made Simple</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Revolutionize your medical practice with our intelligent patient management system. 
            Seamlessly manage patients, schedule appointments, and access medical records—all from one powerful platform.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg" 
              className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110"
            >
              Get Started Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-white/50">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-2 rounded-full border border-purple-200 mb-6">
            <Activity className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Comprehensive Features</span>
          </div>
          <h3 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-foreground">to Manage Your Practice</span>
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed for modern healthcare professionals who demand excellence
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white border-2 border-transparent rounded-2xl p-8 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-purple-600 transition-colors">
                {feature.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto shadow-2xl overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/30 mb-6">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
              <span className="text-sm font-medium text-white">Join Thousands of Doctors</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Practice?
            </h3>
            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join healthcare professionals who trust our system to manage their patients efficiently and provide better care.
            </p>
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg" 
              className="text-lg px-12 py-7 bg-white text-purple-600 hover:bg-gray-50 shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-110 font-bold"
            >
              Create Your Account Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-white/70 text-sm mt-6">No credit card required • Get started in minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-blue-50 to-purple-50 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Patient Management System
            </span>
          </div>
          <p className="text-muted-foreground">&copy; 2025 Patient Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
