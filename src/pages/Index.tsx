import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, Activity, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Easily manage patient records, medical history, and personal information in one secure place."
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Schedule and manage appointments with an intuitive calendar interface."
    },
    {
      icon: FileText,
      title: "Medical Documents",
      description: "Upload and manage medical documents, prescriptions, and test results securely."
    },
    {
      icon: Activity,
      title: "Medical History",
      description: "Track and record patient medical history, conditions, and treatments over time."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-level encryption ensures all patient data remains confidential and secure."
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access patient information and manage your practice anytime, anywhere."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Patient Management System</h1>
          </div>
          <Button onClick={() => navigate("/doctor-auth")} size="lg">
            Doctor Login / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold text-foreground leading-tight">
            Modern Healthcare Management
          </h2>
          <p className="text-xl text-muted-foreground">
            Streamline your medical practice with our comprehensive patient management system. 
            Manage patients, appointments, and medical records all in one place.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={() => navigate("/doctor-auth")} size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need to Manage Your Practice
          </h3>
          <p className="text-muted-foreground text-lg">
            Powerful features designed for modern healthcare professionals
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h4>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Practice?
          </h3>
          <p className="text-muted-foreground text-lg mb-8">
            Join healthcare professionals who trust our system to manage their patients efficiently.
          </p>
          <Button onClick={() => navigate("/doctor-auth")} size="lg" className="text-lg px-8">
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Patient Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
