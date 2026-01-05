import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Users,
  FileText,
  Shield,
  Sparkles,
  UserPlus,
  BarChart3,
  Coins,
  CheckCircle2,
  ArrowRight,
  Play,
  Building2,
  Stethoscope,
  HeadphonesIcon,
  Clock,
  Activity,
  ClipboardList,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import featureDashboard from "@/assets/feature-dashboard.png";
import featurePatients from "@/assets/feature-patients.png";
import featureAppointments from "@/assets/feature-appointments.png";
import featureVisitRecord from "@/assets/feature-visit-record.png";
import featureSchedule from "@/assets/feature-schedule.png";
import featureFinance from "@/assets/feature-finance.png";
import featureActivityLogs from "@/assets/feature-activity-logs.png";

const Features = () => {
  const navigate = useNavigate();

  const coreFeatures = [
    {
      icon: Building2,
      title: "Complete Clinic Control",
      description: "Manage your entire clinic from a single, powerful dashboard.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: UserPlus,
      title: "Unlimited Doctors",
      description: "Add and manage unlimited doctors with performance tracking.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Complete patient lifecycle from registration to follow-ups.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent appointments with conflict detection.",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Coins,
      title: "Finance Tracking",
      description: "Revenue analytics and comprehensive financial reports.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: FileText,
      title: "Medical Templates",
      description: "Pre-built prescriptions, certificates, and reports.",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const showcaseFeatures = [
    {
      title: "Intuitive Dashboard",
      subtitle: "Complete Overview at a Glance",
      description:
        "Get instant insights into your clinic's performance. View total patients, appointments, today's schedule, and waitlist status. Analyze patient demographics by gender, age, city, and revenue with interactive charts—all updated in real-time.",
      image: featureDashboard,
      highlights: [
        "Real-time patient statistics",
        "Gender & age analytics",
        "Revenue tracking charts",
        "Today's appointments overview",
      ],
      reversed: false,
    },
    {
      title: "Patient Management",
      subtitle: "Complete Health Records",
      description:
        "Efficiently manage your entire patient database with powerful search and filtering. Filter by age, gender, city, and delivery dates. Import/export patient data seamlessly. Each patient profile includes contact info, blood group, and complete visit history.",
      image: featurePatients,
      highlights: [
        "Advanced search & filters",
        "Import/Export functionality",
        "Quick patient registration",
        "Complete patient profiles",
      ],
      reversed: true,
    },
    {
      title: "Smart Appointments",
      subtitle: "Effortless Scheduling",
      description:
        "Manage all appointments with flexible table and calendar views. Filter by status, date, and ICD codes. Track patient details, pregnancy information, appointment status, and who created each booking. Schedule new appointments in seconds.",
      image: featureAppointments,
      highlights: [
        "Table & calendar views",
        "Status-based filtering",
        "Pregnancy tracking",
        "Quick appointment creation",
      ],
      reversed: false,
    },
    {
      title: "Patient Visit Records",
      subtitle: "Comprehensive Medical Documentation",
      description:
        "Record and track every patient visit with detailed vitals including blood pressure, temperature, pulse, weight, height, and BMI. Document chief complaints, diagnoses with ICD codes, and maintain complete visit history with prescriptions and next visit scheduling.",
      image: featureVisitRecord,
      highlights: [
        "Complete vitals tracking",
        "Pain scale assessment",
        "Visit history timeline",
        "Medical records & documents",
      ],
      reversed: true,
    },
    {
      title: "Timing & Schedule",
      subtitle: "Flexible Availability Management",
      description:
        "Set your weekly availability with precision. Configure working hours for each day of the week, mark days off, and manage leaves effortlessly. Your patients will only see available slots based on your schedule.",
      image: featureSchedule,
      highlights: ["Weekly schedule setup", "Customizable time slots", "Day off management", "Leave planning"],
      reversed: false,
    },
    {
      title: "Finance Management",
      subtitle: "Complete Revenue Tracking",
      description:
        "Track all financial aspects of your practice. View total revenue, discounts, clinic share, and doctor share at a glance. Detailed appointment-wise breakdown shows patient name, date, subtotal, discounts, and revenue splits. Export reports as PDF.",
      image: featureFinance,
      highlights: [
        "Revenue & discount tracking",
        "Clinic/Doctor share split",
        "Date-range filtering",
        "PDF report generation",
      ],
      reversed: true,
    },
    {
      title: "Activity Logs",
      subtitle: "Complete Audit Trail",
      description:
        "Track every action in your practice with comprehensive activity logs. Monitor schedule updates, patient registrations, appointment changes, and more. Search and filter by action type to maintain complete transparency and accountability.",
      image: featureActivityLogs,
      highlights: [
        "Real-time activity tracking",
        "Action-based filtering",
        "User action history",
        "Complete audit trail",
      ],
      reversed: false,
    },
  ];

  const roleFeatures = [
    {
      role: "Clinic Owner",
      icon: Building2,
      color: "from-blue-500 to-purple-500",
      features: ["Full dashboard access", "Doctor management", "Financial reports", "Activity monitoring"],
    },
    {
      role: "Doctor",
      icon: Stethoscope,
      color: "from-purple-500 to-pink-500",
      features: ["Patient list", "Appointments", "Prescriptions", "Templates"],
    },
    {
      role: "Receptionist",
      icon: HeadphonesIcon,
      color: "from-teal-500 to-cyan-500",
      features: ["Patient registration", "Booking", "Walk-ins", "Queue management"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <PublicHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/10 via-purple-400/10 to-transparent blur-3xl"></div>

        <div className="max-w-4xl mx-auto space-y-6 relative">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-5 py-2 rounded-full border border-purple-200 shadow-md animate-fade-in">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Complete Feature Overview</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-fade-in">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-foreground">In One Platform</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            From patient registration to financial reporting—simplify every aspect of your clinic with our comprehensive
            suite of features.
          </p>

          <div className="flex gap-4 justify-center pt-4 animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
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

      {/* Core Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {coreFeatures.map((feature, index) => (
            <Card
              key={index}
              className="group border-2 border-white/50 hover:border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur"
            >
              <CardContent className="p-6">
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Showcases with Images */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore every feature designed to streamline your clinic operations
            </p>
          </div>

          <div className="space-y-32">
            {showcaseFeatures.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col ${feature.reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 max-w-7xl mx-auto`}
              >
                {/* Image */}
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full rounded-2xl shadow-2xl border border-purple-100 relative z-10 group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
                      {feature.subtitle}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{feature.title}</h2>
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feature.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => navigate("/login")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-3 rounded-full mb-6">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Bank-Level Security</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Your Data is Safe With Us</h2>
          <p className="text-muted-foreground mb-8">
            AES-256 encryption, HIPAA compliant design, and 99.9% uptime guarantee.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["256-bit Encryption", "Daily Backups", "Role-Based Access", "Audit Logs", "Secure Cloud"].map(
              (item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-600 border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Nmg2di02aC02em0wIDAtNmg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <CardContent className="p-12 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Clinic?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of clinics already using Zonoir. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate("/login")}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate("/contact")}
              >
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
          {[
            { number: "50+", label: "Clinics" },
            { number: "500+", label: "Doctors" },
            { number: "10K+", label: "Patients" },
            { number: "99.9%", label: "Uptime" },
          ].map((stat, i) => (
            <div key={i} className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Features;
