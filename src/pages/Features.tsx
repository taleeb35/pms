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
  Brain,
  Video,
  MessageSquare,
  Bell,
  Globe,
  Search,
  Pill,
  Heart,
  Baby,
  Smartphone,
  Receipt,
  TrendingUp,
  Lock,
  Zap,
  Database,
  PieChart,
  CalendarCheck,
  FileSearch,
  BookOpen,
  Star,
  Languages,
  Briefcase,
  FilePlus,
  AlarmClock,
  Layers,
  MapPin,
  ShieldCheck,
  WalletCards,
  Workflow,
  Wand2,
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
import featureReportsAnalytics from "@/assets/feature-reports-analytics.png";
import featureDailySummary from "@/assets/feature-daily-summary.png";
import featureAIInsights from "@/assets/feature-ai-insights.png";
import featurePeakHours from "@/assets/feature-peak-hours.png";
import { useSEO } from "@/hooks/useSEO";

const Features = () => {
  const navigate = useNavigate();

  useSEO({
    title: "Features — Complete Clinic, EMR & AI Software | Zonoir",
    description:
      "Explore Zonoir's full feature set: appointments, patient EMR, prescriptions, finance, AI assistants, video consultations, doctor discovery, multi-role access, and more.",
    canonicalUrl: "https://zonoir.com/features",
    ogUrl: "https://zonoir.com/features",
    breadcrumbs: [
      { name: "Home", url: "https://zonoir.com/" },
      { name: "Features", url: "https://zonoir.com/features" },
    ],
  });

  const featureCategories = [
    {
      title: "Practice Management",
      icon: Briefcase,
      gradient: "from-blue-500 to-cyan-500",
      features: [
        { icon: Calendar, name: "Smart Appointments", desc: "15-min slots, conflict detection, calendar & table view" },
        { icon: CalendarCheck, name: "Walk-in & Waitlist", desc: "Add walk-ins instantly, manage queue with priority" },
        { icon: Clock, name: "Doctor Schedules", desc: "Weekly availability, breaks, full/half-day leaves" },
        { icon: AlarmClock, name: "Re-booking Logic", desc: "Slot reuse for cancelled appointments" },
        { icon: Workflow, name: "4-Status Workflow", desc: "Booked → Arrived → Completed → Cancelled with timestamps" },
        { icon: Bell, name: "Smart Reminders", desc: "Automated patient reminders via SMS, email & WhatsApp" },
      ],
    },
    {
      title: "Patient & Medical Records",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      features: [
        { icon: Users, name: "Patient Database", desc: "Searchable EMR with import/export support" },
        { icon: Heart, name: "Vitals Tracking", desc: "BP, temp, pulse, weight, height, BMI, pain scale" },
        { icon: FileSearch, name: "Visit History", desc: "Complete timeline with diagnoses & ICD codes" },
        { icon: Pill, name: "Digital Prescriptions", desc: "Branded, printable prescriptions in seconds" },
        { icon: FilePlus, name: "Medical Templates", desc: "Reusable prescription, certificate & report templates" },
        { icon: Database, name: "Allergies & Diseases", desc: "Maintained per-clinic master lists & ICD codes" },
      ],
    },
    {
      title: "Specialty Care",
      icon: Stethoscope,
      gradient: "from-rose-500 to-orange-500",
      features: [
        { icon: Baby, name: "Gynaecology Module", desc: "Pregnancy lifecycle, weeks tracking, auto-completion" },
        { icon: Stethoscope, name: "53+ Specializations", desc: "From cardiology to dermatology, fully customizable" },
        { icon: ClipboardList, name: "Procedures Catalog", desc: "Track procedures with custom pricing per clinic" },
        { icon: Layers, name: "Conditional Fields", desc: "Smart forms that adapt to specialty workflows" },
      ],
    },
    {
      title: "AI-Powered Tools",
      icon: Brain,
      gradient: "from-violet-500 to-fuchsia-500",
      features: [
        { icon: Wand2, name: "AI Prescription Assistant", desc: "Suggests medicines based on diagnosis" },
        { icon: FileText, name: "AI Visit Summary", desc: "Auto-generated visit notes from consultation data" },
        { icon: TrendingUp, name: "AI Revenue Forecast", desc: "Predict next month's revenue with ML models" },
        { icon: PieChart, name: "AI Patient Insights", desc: "Spot trends, drop-offs & retention opportunities" },
        { icon: MessageSquare, name: "AI Doctor Finder", desc: "Public chatbot helps patients pick the right doctor" },
      ],
    },
    {
      title: "Finance & Billing",
      icon: WalletCards,
      gradient: "from-emerald-500 to-teal-500",
      features: [
        { icon: Coins, name: "Revenue Tracking", desc: "Total revenue, discounts, clinic & doctor share" },
        { icon: Receipt, name: "Expenses Module", desc: "Track all clinic expenses with categories" },
        { icon: BarChart3, name: "Monthly Reports", desc: "Detailed PDF financial reports per doctor" },
        { icon: TrendingUp, name: "Subscription Billing", desc: "Annual & monthly plans with auto-renewal" },
      ],
    },
    {
      title: "Multi-Role Access",
      icon: Shield,
      gradient: "from-indigo-500 to-blue-500",
      features: [
        { icon: Building2, name: "Clinic Owner Portal", desc: "Full control, manage doctors & receptionists" },
        { icon: Stethoscope, name: "Doctor Portal", desc: "Personal dashboard, patients & prescriptions" },
        { icon: HeadphonesIcon, name: "Receptionist Logins", desc: "Active/draft toggle, scoped per clinic" },
        { icon: UserPlus, name: "Doctor's Receptionist", desc: "Dedicated assistant accounts per doctor" },
        { icon: Lock, name: "Role-Based Security", desc: "Row-level security on every table" },
        { icon: Activity, name: "Activity Logs", desc: "Complete audit trail of every action" },
      ],
    },
    {
      title: "Patient Discovery & Marketing",
      icon: Globe,
      gradient: "from-amber-500 to-rose-500",
      features: [
        { icon: Search, name: "Public Doctor Profiles", desc: "SEO-optimized, indexed on Google" },
        { icon: MapPin, name: "City-Based Discovery", desc: "Dedicated landing pages for major cities" },
        { icon: Star, name: "Reviews & Ratings", desc: "Real patient reviews on doctor profiles" },
        { icon: BookOpen, name: "Blog & Knowledge Base", desc: "Content engine for SEO and patient education" },
        { icon: MessageSquare, name: "WhatsApp Integration", desc: "Direct booking via WhatsApp button" },
        { icon: Globe, name: "FAQ Schema & SEO", desc: "Structured data for rich Google results" },
      ],
    },
    {
      title: "Communication & Telehealth",
      icon: Video,
      gradient: "from-sky-500 to-indigo-500",
      features: [
        { icon: Video, name: "Video Consultations", desc: "Built-in HD video calls (Daily.co powered)" },
        { icon: MessageSquare, name: "Patient Chatbot", desc: "AI-powered support for patient queries" },
        { icon: Bell, name: "Push Notifications", desc: "Native mobile push for new bookings" },
        { icon: Languages, name: "Multi-language Support", desc: "Urdu & English UI for local clinics" },
      ],
    },
    {
      title: "Mobile & Apps",
      icon: Smartphone,
      gradient: "from-pink-500 to-purple-500",
      features: [
        { icon: Smartphone, name: "Native Mobile Apps", desc: "iOS & Android with biometric login" },
        { icon: Zap, name: "PWA Support", desc: "Install on any device, works offline" },
        { icon: Bell, name: "Real-time Sync", desc: "All devices stay in sync instantly" },
      ],
    },
    {
      title: "Analytics & Insights",
      icon: BarChart3,
      gradient: "from-teal-500 to-cyan-500",
      features: [
        { icon: PieChart, name: "Clinic Analytics", desc: "Patient demographics, gender, age, city splits" },
        { icon: BarChart3, name: "Doctor Performance", desc: "Per-doctor stats and revenue contribution" },
        { icon: TrendingUp, name: "Peak-Hour Heatmaps", desc: "Visualize busy hours and optimize staffing" },
        { icon: Activity, name: "Patient Drop-off Reports", desc: "Identify retention gaps automatically" },
      ],
    },
  ];

  const showcaseFeatures = [
    {
      title: "Intuitive Dashboard",
      subtitle: "Complete Overview at a Glance",
      description:
        "Get instant insights into your clinic's performance. View total patients, appointments, today's schedule, and waitlist status. Analyze patient demographics by gender, age, city, and revenue with interactive charts—all updated in real-time.",
      image: featureDashboard,
      highlights: ["Real-time statistics", "Gender & age analytics", "Revenue tracking charts", "Today's schedule"],
    },
    {
      title: "Patient Management",
      subtitle: "Complete Health Records",
      description:
        "Efficiently manage your entire patient database with powerful search and filtering. Filter by age, gender, city, and delivery dates. Import/export patient data seamlessly. Each patient profile includes contact info, blood group, and complete visit history.",
      image: featurePatients,
      highlights: ["Advanced search", "Import/Export", "Quick registration", "Complete profiles"],
    },
    {
      title: "Smart Appointments",
      subtitle: "Effortless Scheduling",
      description:
        "Manage all appointments with flexible table and calendar views. Filter by status, date, and ICD codes. Track patient details, pregnancy information, appointment status, and who created each booking. Schedule new appointments in seconds.",
      image: featureAppointments,
      highlights: ["Calendar & table view", "Status filtering", "Pregnancy tracking", "Quick creation"],
    },
    {
      title: "Patient Visit Records",
      subtitle: "Comprehensive Medical Documentation",
      description:
        "Record and track every patient visit with detailed vitals including blood pressure, temperature, pulse, weight, height, and BMI. Document chief complaints, diagnoses with ICD codes, and maintain complete visit history with prescriptions and next visit scheduling.",
      image: featureVisitRecord,
      highlights: ["Complete vitals", "Pain scale", "Visit timeline", "Medical documents"],
    },
    {
      title: "Doctor Schedule",
      subtitle: "Flexible Availability Management",
      description:
        "Set your weekly availability with precision. Configure working hours for each day of the week, mark days off, and manage leaves effortlessly. Patients only see available slots based on your real-time schedule.",
      image: featureSchedule,
      highlights: ["Weekly setup", "Custom slots", "Day off management", "Leave planning"],
    },
    {
      title: "Finance Management",
      subtitle: "Complete Revenue Tracking",
      description:
        "Track all financial aspects of your practice. View total revenue, discounts, clinic share, and doctor share at a glance. Detailed appointment-wise breakdown shows patient name, date, subtotal, discounts, and revenue splits. Export reports as PDF.",
      image: featureFinance,
      highlights: ["Revenue & discounts", "Clinic/Doctor split", "Date-range filters", "PDF reports"],
    },
    {
      title: "Activity Logs",
      subtitle: "Complete Audit Trail",
      description:
        "Track every action in your practice with comprehensive activity logs. Monitor schedule updates, patient registrations, appointment changes, and more. Search and filter by action type to maintain complete transparency and accountability.",
      image: featureActivityLogs,
      highlights: ["Real-time tracking", "Action filtering", "User history", "Full audit trail"],
    },
    {
      title: "Reports & Analytics",
      subtitle: "Data-Driven Decision Making",
      description:
        "Visualize your clinic's performance with rich, interactive Recharts dashboards. Monthly revenue bars, patient visit trends, demographics by gender/age/city, and per-doctor contribution charts — all filterable by custom date ranges and exportable as PDF.",
      image: featureReportsAnalytics,
      highlights: ["Interactive charts", "Demographic breakdowns", "Date-range filters", "Per-doctor insights"],
    },
    {
      title: "Daily Summary Report",
      subtitle: "Your Clinic at a Glance",
      description:
        "Start every morning with a complete pulse on your clinic. The Daily Summary card surfaces today's appointments, completed visits, walk-ins, new patient registrations, and revenue earned — beautifully laid out so you never miss a beat.",
      image: featureDailySummary,
      highlights: ["Today's appointments", "Live revenue counter", "Walk-in tracking", "New patient stats"],
    },
    {
      title: "AI-Powered Insights",
      subtitle: "Intelligence Built In",
      description:
        "Let AI do the heavy lifting. Get auto-generated revenue forecasts for next month, patient retention analysis, smart recommendations to recover drop-offs, and natural-language summaries of your data — powered by Gemini AI inside your dashboard.",
      image: featureAIInsights,
      highlights: ["Revenue forecasting", "Retention insights", "Drop-off analysis", "Smart recommendations"],
    },
    {
      title: "Peak Hour Heatmap",
      subtitle: "Optimize Staffing & Bookings",
      description:
        "Spot your busiest hours instantly with a colorful weekly heatmap. Understand when patients book the most, identify quiet windows for promotions, and plan staff shifts around real demand — all visualized at the bottom of your reports view.",
      image: featurePeakHours,
      highlights: ["Day × hour heatmap", "Demand patterns", "Staffing insights", "Promo-window discovery"],
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-purple-400/10 to-transparent blur-3xl"></div>

        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>

        <div className="max-w-5xl mx-auto space-y-6 relative">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-5 py-2 rounded-full border border-purple-200 shadow-md animate-fade-in">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">60+ Powerful Features in One Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight animate-fade-in">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Everything Your Clinic
            </span>
            <br />
            <span className="text-foreground">Will Ever Need</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in">
            From patient registration to AI-powered insights — Zonoir replaces 10+ tools with one beautifully designed
            platform built for modern healthcare in Pakistan.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4 animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Start 14-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-purple-300 hover:bg-purple-50"
              onClick={() => navigate("/contact")}
            >
              <Play className="mr-2 h-5 w-5" />
              Book a Demo
            </Button>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm">
            {[
              { icon: ShieldCheck, text: "AES-256 Encrypted" },
              { icon: Zap, text: "99.9% Uptime" },
              { icon: Users, text: "Trusted by 100+ Clinics" },
              { icon: Globe, text: "Pakistan-First" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-4 w-4 text-purple-600" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Categories Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Every Feature, Beautifully Organized
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            10 categories. 60+ features. One platform that grows with your practice.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {featureCategories.map((category, idx) => (
            <Card
              key={idx}
              className="group border-2 border-white/60 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur overflow-hidden relative"
            >
              <div
                className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${category.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}
              ></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${category.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {category.features.map((feature, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient} h-fit shadow-sm`}>
                        <feature.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{feature.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Showcases with Images */}
      <section className="py-20 bg-gradient-to-b from-transparent via-white/40 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">See It In Action</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Built for Real Clinic Workflows
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Take a closer look at the features clinics use every day.
            </p>
          </div>

          <div className="space-y-32">
            {showcaseFeatures.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 max-w-7xl mx-auto`}
              >
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      loading="lazy"
                      className="w-full rounded-2xl shadow-2xl border border-purple-100 relative z-10 group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                </div>

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
                    Try It Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Built for Every Role in Your Clinic
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">Tailored dashboards. Granular permissions. Zero confusion.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {roleFeatures.map((role, idx) => (
            <Card
              key={idx}
              className="group border-2 border-white/60 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur"
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${role.color} mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <role.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{role.role}</h3>
                <ul className="space-y-2 text-left">
                  {role.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
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
            AES-256 encryption, HIPAA-aware design, daily backups, and a 99.9% uptime guarantee.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["256-bit Encryption", "Daily Backups", "Role-Based Access", "Audit Logs", "Secure Cloud", "RLS on Every Table"].map(
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
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Nmg2di02aC02em0wIDAtNmg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <CardContent className="p-12 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Clinic?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of clinics already using Zonoir. Start your 14-day free trial today — no credit card required.
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

      <PublicFooter />
    </div>
  );
};

export default Features;
