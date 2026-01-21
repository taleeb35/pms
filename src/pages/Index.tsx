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
  ChartBar,
  Activity,
  Clock,
  LogIn,
  MapPin,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import DoctorReviewsSection from "@/components/DoctorReviewsSection";

const Index = () => {
  const navigate = useNavigate();

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
      icon: UserPlus,
      title: "Unlimited Doctor Management",
      description:
        "Add and manage unlimited doctors in your clinic. Assign roles, track performance, and control access.",
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
      description: "Bank-level encryption with full data privacy compliance to protect patient information.",
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
            <span className="font-semibold text-purple-600">Add unlimited doctors</span>, track every patient visit,
            monitor all activities, and manage finances—all in one powerful platform.
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
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110"
            >
              Get Started
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
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              variant="outline"
              className="home_login text-lg px-10 py-6 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </Button>
          </div>

          {/* Trust Rating Section */}
          <div className="flex flex-col items-center gap-2 pt-8 animate-fade-in">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-6 h-6 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Zonoir is rated 4.8 stars on Google and trusted by 50+ clinics across Pakistan
            </p>
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
                    No restrictions on the number of doctors. Scale your clinic as you grow. Manage credentials,
                    schedules, and permissions for each doctor effortlessly.
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

      {/* Cities We Serve Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: "Lahore", hasPage: true, slug: "/emr-software-for-doctors-in-lahore" },
              { name: "Karachi", hasPage: true, slug: "/emr-software-for-doctors-in-karachi" },
              { name: "Islamabad", hasPage: true, slug: "/emr-software-for-doctors-in-islamabad" },
              { name: "Rawalpindi", hasPage: true, slug: "/emr-software-for-doctors-in-rawalpindi" },
              { name: "Faisalabad", hasPage: true, slug: "/emr-software-for-doctors-in-faisalabad" },
              { name: "Multan", hasPage: false },
              { name: "Peshawar", hasPage: false },
              { name: "Quetta", hasPage: false },
              { name: "Sialkot", hasPage: false },
              { name: "Gujranwala", hasPage: false },
              { name: "Hyderabad", hasPage: false },
              { name: "Bahawalpur", hasPage: false },
              { name: "Sargodha", hasPage: false },
              { name: "Sukkur", hasPage: false },
              { name: "Abbottabad", hasPage: false },
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
              <span className="text-sm font-bold text-white">Join 50+ Successful Clinics</span>
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
