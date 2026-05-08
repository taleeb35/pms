import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  FileText,
  Shield,
  Stethoscope,
  Sparkles,
  UserPlus,
  TrendingUp,
  Coins,
  Eye,
  Bot,
  Zap,
  ChartBar,
  Activity,
  Clock,
  LogIn,
  MapPin,
  Search,
  Map,
  Instagram,
  Facebook,
  Globe,
  MessageCircle,
  Star,
  CheckCircle2,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import DoctorReviewsSection from "@/components/DoctorReviewsSection";
import { useGeoLocation } from "@/contexts/GeoLocationContext";

const Index = () => {
  const navigate = useNavigate();
  const { country } = useGeoLocation();

  const isUSA = country === "US";

  // Check for password recovery redirect from Supabase
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");

    if (type === "recovery") {
      // Redirect to reset-password page with the hash intact
      navigate(`/reset-password${window.location.hash}`, { replace: true });
    }
  }, [navigate]);

  const features = [
    {
      icon: Calendar,
      title: "Smart Appointment Scheduling",
      description:
        "Book and manage appointments with conflict-free 15-minute slots, instant reminders, and online booking.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Complete Patient Tracking",
      description: "Track every patient visit, medical history, prescriptions, and treatment plans in one place.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Eye,
      title: "Activity Logs & Monitoring",
      description:
        "View detailed activity logs for each doctor. Monitor all actions, appointments, and patient interactions.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Coins,
      title: "Finance Management",
      description: "Track clinic revenue, doctor earnings, patient payments, and maintain complete financial records.",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: TrendingUp,
      title: "Monthly Profit Analytics",
      description: "Get detailed monthly profit reports, revenue trends, and financial insights for your clinic.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Calendar,
      title: "Smart Appointment System",
      description: "Manage appointments across all doctors with automated scheduling and reminders.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: FileText,
      title: "Medical Records",
      description: "Secure digital storage for all medical documents, prescriptions, and test results.",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: ChartBar,
      title: "Performance Dashboard",
      description: "Real-time analytics showing clinic performance, patient flow, and doctor productivity.",
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "AES-256 encryption, daily encrypted backups, and HIPAA & GDPR-aligned privacy keep your patient data fully secure.",
      color: "from-blue-600 to-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <PublicHeader />

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
            Complete solution for clinic owners:{" "}
            <span className="font-semibold text-purple-600">Add your doctors</span>, track every patient visit,
            monitor all activities, and manage finances—all in one powerful platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm animate-fade-in">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Smart Appointments</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <Eye className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Activity Monitoring</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">Profit Analytics</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <Bot className="h-4 w-4 text-pink-600" />
              <span className="font-medium">AI Clinic Catalyst</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110"
            >
              Get Started Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => window.open("https://calendar.app.google/vkzUUndGFT4Afq1D9", "_blank")}
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 border-2 border-white bg-white/20 backdrop-blur text-purple-700 hover:bg-white hover:text-purple-600 shadow-2xl transition-all duration-300 hover:scale-110"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Request A Demo
            </Button>
          </div>

          {/* Trusted by doctors */}
          <div className="flex justify-center pt-8 animate-fade-in">
            <div className="group inline-flex items-center gap-4 bg-white/70 backdrop-blur-xl pl-3 pr-6 py-3 rounded-full border-2 border-purple-200/60 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex -space-x-3">
                {[
                  { letter: "S", gradient: "from-blue-500 to-blue-600" },
                  { letter: "A", gradient: "from-purple-500 to-purple-600" },
                  { letter: "R", gradient: "from-orange-500 to-pink-500" },
                  { letter: "M", gradient: "from-green-500 to-emerald-500" },
                ].map((avatar, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.gradient} ring-4 ring-white flex items-center justify-center text-white font-bold text-sm shadow-lg transition-transform duration-300 group-hover:translate-x-0`}
                    style={{ zIndex: 4 - i }}
                  >
                    {avatar.letter}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 ring-4 ring-white flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  +
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm md:text-base text-foreground">
                  Trusted by{" "}
                  <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    500+ doctors
                  </span>{" "}
                  across Pakistan
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { number: "48+", label: "Doctors Managed", icon: UserPlus, color: "from-purple-500 to-pink-500" },
            { number: "12,830+", label: "Patients Tracked", icon: Users, color: "from-green-500 to-emerald-500" },
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
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

              <div
                className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}
              >
                <feature.icon className="h-9 w-9 text-white" strokeWidth={2.5} />
              </div>

              <h4 className="text-xl font-bold text-foreground mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 relative z-10">
                {feature.title}
              </h4>

              <p className="text-muted-foreground leading-relaxed relative z-10 text-base">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-14">
          <Button
            size="lg"
            onClick={() => navigate("/features")}
            className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            See All Features
          </Button>
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
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Smart Appointment Scheduling</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Book, reschedule, and manage appointments in seconds. Automatic conflict detection, 15-minute
                    slots, and instant patient notifications keep your clinic running smoothly.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-pink-200 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Complete Activity Tracking</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Monitor every action taken by your doctors. View appointment histories, patient interactions,
                    prescriptions, and all medical records in real-time.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Financial Management</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Track all payments, invoices, and expenses. Maintain complete financial records and ensure
                    transparent accounting for your clinic operations.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 border-2 border-amber-200 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Monthly Profit Reports</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Get automated monthly profit reports with detailed analytics. Understand revenue trends, doctor
                    performance, and identify growth opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Doctors Everywhere - Dark Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.15),transparent_60%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Doctor card */}
            <div className="flex justify-center mb-10 animate-fade-in">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 shadow-[0_0_40px_rgba(56,189,248,0.15)] flex items-center gap-4 max-w-md w-full">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  SK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-semibold">Dr. Sarah Khan</span>
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                  </div>
                  <div className="text-purple-400 text-sm font-medium">Cardiologist</div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>4.9 (320 reviews)</span>
                  </div>
                </div>
                <button className="px-3 py-2 rounded-lg border border-purple-500/40 text-purple-300 text-xs font-medium hover:bg-purple-500/10 transition-colors flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Book now
                </button>
              </div>
            </div>

            {/* Central logo node */}
            <div className="flex justify-center mb-2 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/30 blur-2xl rounded-3xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(56,189,248,0.3)]">
                  <Stethoscope className="h-10 w-10 text-white" strokeWidth={2.5} />
                  <span className="text-[10px] text-slate-300 mt-0.5 font-medium">Clinic</span>
                </div>
              </div>
            </div>

            {/* Connecting lines + platform icons */}
            <div className="relative mb-16">
              <svg className="w-full h-16 hidden md:block" viewBox="0 0 600 60" preserveAspectRatio="none">
                <path d="M 300 0 L 300 20 L 80 20 L 80 60 M 300 20 L 180 20 L 180 60 M 300 20 L 280 20 L 280 60 M 300 20 L 380 20 L 380 60 M 300 20 L 480 20 L 480 60 M 300 20 L 580 20 L 580 60"
                  fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
              </svg>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 max-w-4xl mx-auto mt-4">
                {[
                  { icon: Search, label: "Google Search", color: "from-blue-500 to-red-500" },
                  { icon: Map, label: "Google Maps", color: "from-green-500 to-blue-500" },
                  { icon: Instagram, label: "Instagram", color: "from-pink-500 via-purple-500 to-orange-500" },
                  { icon: Facebook, label: "Facebook", color: "from-blue-600 to-blue-400" },
                  { icon: Globe, label: "Clinic Website", color: "from-cyan-500 to-teal-500" },
                  { icon: MessageCircle, label: "WhatsApp", color: "from-green-500 to-emerald-500" },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="group flex flex-col items-center gap-2 animate-fade-in"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-cyan-400/50 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] transition-all duration-300 hover:-translate-y-1">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color}`}>
                        <item.icon className="h-6 w-6 md:h-7 md:w-7 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <span className="text-xs md:text-sm text-slate-300 font-medium text-center leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Heading + description */}
            <div className="max-w-3xl animate-fade-in">
              <h3 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Help patients find <br />
                doctors <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">everywhere</span>
              </h3>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                Show doctor profiles across search, maps, social, and your website — so patients can discover clinics and book appointments faster with{" "}
                <span className="text-purple-400 font-semibold">Care Compass</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cities We Serve Section - Only show for Pakistan visitors */}

      {!isUSA && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { name: "Lahore", hasPage: true, slug: "/emr-software-for-doctors-in-lahore" },
                { name: "Karachi", hasPage: true, slug: "/emr-software-for-doctors-in-karachi" },
                { name: "Islamabad", hasPage: true, slug: "/emr-software-for-doctors-in-islamabad" },
                { name: "Rawalpindi", hasPage: true, slug: "/emr-software-for-doctors-in-rawalpindi" },
                { name: "Faisalabad", hasPage: true, slug: "/emr-software-for-doctors-in-faisalabad" },
                { name: "Multan", hasPage: true, slug: "/emr-software-for-doctors-in-multan" },
                { name: "Peshawar", hasPage: true, slug: "/emr-software-for-doctors-in-peshawar" },
                { name: "Quetta", hasPage: true, slug: "/emr-software-for-doctors-in-quetta" },
                { name: "Sialkot", hasPage: true, slug: "/emr-software-for-doctors-in-sialkot" },
                { name: "Gujranwala", hasPage: true, slug: "/emr-software-for-doctors-in-gujranwala" },
                { name: "Hyderabad", hasPage: true, slug: "/emr-software-for-doctors-in-hyderabad" },
                { name: "Bahawalpur", hasPage: true, slug: "/emr-software-for-doctors-in-bahawalpur" },
                { name: "Sargodha", hasPage: true, slug: "/emr-software-for-doctors-in-sargodha" },
                { name: "Sukkur", hasPage: true, slug: "/emr-software-for-doctors-in-sukkur" },
                { name: "Abbottabad", hasPage: true, slug: "/emr-software-for-doctors-in-abbottabad" },
              ].map((city, index) => (
                city.hasPage ? (
                  <button
                    key={city.name}
                    onClick={() => navigate(city.slug!)}
                    className="group relative bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-5 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <MapPin className="h-6 w-6 mx-auto mb-2 group-hover:animate-bounce" />
                    <span className="font-bold text-base">{city.name}</span>
                    <div className="text-xs mt-1 opacity-80 group-hover:opacity-100">View Details →</div>
                  </button>
                ) : (
                  <div
                    key={city.name}
                    className="group bg-white/80 backdrop-blur border-2 border-green-100 rounded-2xl p-5 text-center shadow-md hover:shadow-xl hover:border-green-300 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-green-500 group-hover:text-green-600 transition-colors" />
                    <span className="font-semibold text-foreground text-base">{city.name}</span>
                    <div className="text-xs text-muted-foreground mt-1">Coming Soon</div>
                  </div>
                )
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctor Reviews Section */}
      <DoctorReviewsSection />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-20 text-center max-w-5xl mx-auto shadow-2xl overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent)]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-8 py-3 rounded-full border-2 border-white/30 mb-8 shadow-lg animate-fade-in">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
              <span className="text-sm font-bold text-white">Join Leading Clinics</span>
            </div>

            <h3 className="text-5xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
              Ready to Transform Your Clinic?
            </h3>

            <p className="text-white/95 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Start managing doctors, tracking patients, and monitoring finances—all from one powerful dashboard. No
              credit card required.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="text-lg px-12 py-7 bg-white text-purple-600 hover:bg-gray-50 shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-110 font-bold"
              >
                Get Started
                <Sparkles className="ml-2 h-5 w-5" />
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
      <PublicFooter />
    </div>
  );
};

export default Index;
