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
      <section className="relative overflow-hidden bg-[#0a1628]">
        {/* Decorative glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.18),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.18),transparent_55%)]"></div>
        <div className="absolute top-32 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

        <div className="container mx-auto px-4 py-24 md:py-28 relative">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Green pill badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 backdrop-blur animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse"></span>
              <span className="text-sm font-semibold text-emerald-300 tracking-wide">
                Pakistan's #1 Clinic Management Software
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white animate-fade-in tracking-tight">
              Run your clinic{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                smarter,
              </span>{" "}
              not harder
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-300/90 max-w-2xl leading-relaxed animate-fade-in">
              Zonoir gives doctors a complete EMR, patient management, AI prescriptions,
              and revenue analytics — all in one beautifully simple platform.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 text-sm animate-fade-in pt-2">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-slate-200">Smart Appointments</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full">
                <Eye className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-slate-200">Activity Monitoring</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="font-medium text-slate-200">Profit Analytics</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full">
                <Bot className="h-4 w-4 text-pink-400" />
                <span className="font-medium text-slate-200">AI Clinic Catalyst</span>
              </div>
            </div>

            {/* CTAs — kept as in second image */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => window.open("https://calendar.app.google/vkzUUndGFT4Afq1D9", "_blank")}
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6 border-2 border-white/80 bg-white/95 backdrop-blur text-purple-700 hover:bg-white hover:text-purple-600 shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Request A Demo
              </Button>
            </div>

            {/* Trusted by doctors */}
            <div className="flex items-center gap-4 pt-8 animate-fade-in">
              <div className="flex -space-x-2">
                {[
                  { letter: "S", gradient: "from-blue-500 to-blue-600" },
                  { letter: "A", gradient: "from-purple-500 to-purple-600" },
                  { letter: "R", gradient: "from-orange-500 to-pink-500" },
                  { letter: "M", gradient: "from-emerald-500 to-teal-500" },
                ].map((a, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${a.gradient} ring-2 ring-[#0a1628] flex items-center justify-center text-white font-bold text-xs shadow-lg`}
                    style={{ zIndex: 4 - i }}
                  >
                    {a.letter}
                  </div>
                ))}
              </div>
              <div className="text-slate-300 text-sm md:text-base">
                Trusted by <span className="font-bold text-white">48+ doctors</span> across Pakistan
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-blue-50 pointer-events-none"></div>
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

      {/* Find Doctors Everywhere - Dark Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.18),transparent_60%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Heading + description */}
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
                Help patients find doctors{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  everywhere
                </span>
              </h3>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                Show doctor profiles across search, maps, social, and your website — so patients can discover clinics and book appointments faster with{" "}
                <span className="text-purple-400 font-semibold">Zonoir</span>.
              </p>
            </div>

            {/* Diagram */}
            <div className="relative max-w-5xl mx-auto">
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

              {/* Vertical line: doctor card -> hub */}
              <div className="flex justify-center">
                <div className="w-px h-10 bg-gradient-to-b from-cyan-500/10 to-cyan-400/50"></div>
              </div>

              {/* Central Clinic hub */}
              <div className="flex justify-center animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400/30 blur-2xl rounded-3xl"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/40 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(56,189,248,0.35)]">
                    <Stethoscope className="h-9 w-9 text-cyan-300" strokeWidth={2.2} />
                    <span className="text-[10px] text-slate-300 mt-1 font-semibold tracking-wide">Clinic</span>
                  </div>
                </div>
              </div>

              {/* Connector + Icons */}
              <div className="relative mt-2">
                {/* SVG connectors — 6 columns, lines fan from hub center to each icon top */}
                <svg
                  className="absolute inset-x-0 top-0 w-full h-16 pointer-events-none hidden md:block"
                  viewBox="0 0 1200 64"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(56,189,248,0.7)" />
                      <stop offset="100%" stopColor="rgba(56,189,248,0.15)" />
                    </linearGradient>
                  </defs>
                  {/* Trunk down from hub */}
                  <line x1="600" y1="0" x2="600" y2="20" stroke="url(#lineGrad)" strokeWidth="1.5" />
                  {/* Horizontal bus */}
                  <line x1="100" y1="20" x2="1100" y2="20" stroke="rgba(56,189,248,0.35)" strokeWidth="1" />
                  {/* Drops to each icon (6 cols, centers at 100, 300, 500, 700, 900, 1100) */}
                  {[100, 300, 500, 700, 900, 1100].map((x) => (
                    <line key={x} x1={x} y1="20" x2={x} y2="64" stroke="url(#lineGrad)" strokeWidth="1.2" />
                  ))}
                </svg>
                {/* Mobile simple line */}
                <div className="md:hidden h-8 flex justify-center">
                  <div className="w-px h-full bg-cyan-500/30"></div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 pt-16">
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
                      <div className="relative w-16 h-16 md:w-20 md:h-20 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-cyan-400/60 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.35)] transition-all duration-300 hover:-translate-y-1">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color}`}>
                          <item.icon className="h-6 w-6 md:h-7 md:w-7 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                      <span className="text-xs md:text-sm text-slate-300 font-medium text-center leading-tight">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Profile Page Showcase */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),transparent_60%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Mockup card */}
            <div className="animate-fade-in order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 blur-3xl rounded-3xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-white/10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">Z</div>
                      <span className="font-bold text-slate-900 text-lg">Zonoir</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Shield className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Trusted by 10,000+ patients</span>
                    </div>
                  </div>

                  {/* Doctor info */}
                  <div className="flex gap-5 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">SK</div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-[10px] font-medium text-slate-700">Online</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h4 className="text-xl md:text-2xl font-bold text-slate-900">Dr. Sarah Khan</h4>
                        <CheckCircle2 className="h-5 w-5 text-[#1d9bf0] fill-[#1d9bf0]" strokeWidth={2.5} />
                      </div>
                      <div className="text-indigo-600 font-semibold text-sm mb-1">Cardiologist</div>
                      <div className="text-xs text-slate-500 mb-2">MBBS, MD (Cardiology) • 8+ Years Experience</div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />4.9 (320 reviews)</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-slate-400" />10,000+ patients</span>
                      </div>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900">Clinic Times</div>
                          <div className="text-[11px] text-slate-500">Mon – Sat • 9:00 AM – 6:00 PM</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900">Location</div>
                          <div className="text-[11px] text-slate-500 truncate">HealthPlus Clinic, Karachi</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs font-semibold text-slate-900">Available Today</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"].map((t, i) => (
                            <span key={t} className={`text-[10px] px-2 py-1 rounded-md font-medium ${i === 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Booking widget */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="text-sm font-bold text-slate-900 mb-1">Book an Appointment</div>
                      <div className="text-[11px] text-slate-500 mb-3">Choose a date and time</div>
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs text-slate-700 flex-1">May 20, 2026</span>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"].map((t, i) => (
                          <label key={t} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${i === 0 ? "border-indigo-600" : "border-slate-300"}`}>
                              {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                            </span>
                            {t}
                          </label>
                        ))}
                      </div>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors">
                        Book Appointment
                      </button>
                    </div>
                  </div>

                  {/* Trust strip */}
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    <div className="text-center">
                      <div className="text-[11px] font-semibold text-slate-900">Secure • Private • HIPAA Compliant</div>
                      <div className="text-[10px] text-slate-500">Your health information is safe with us.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy */}
            <div className="text-center lg:text-left order-1 lg:order-2 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Doctor Profile Pages
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-5">
                Give every doctor their{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">own profile page</span>
              </h3>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-8">
                Show doctor info, clinic times, location, and let visitors book appointments online — all in one beautiful, shareable page powered by{" "}
                <span className="text-emerald-300 font-semibold">Zonoir</span>.
              </p>
              <ul className="space-y-3 mb-8 text-left max-w-md mx-auto lg:mx-0">
                {[
                  "Branded profile with photo, qualifications & reviews",
                  "Live clinic schedule & instant online booking",
                  "Shareable link for WhatsApp, social & search",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/30"
              >
                Create Your Profile
              </Button>
            </div>
          </div>
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
