import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Eye,
  Stethoscope,
  Sparkles,
  UserPlus,
  TrendingUp,
  Coins,
  MapPin,
  Star,
  Quote,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";

const CityGujranwala = () => {
  const navigate = useNavigate();

  useSEO({
    title: "Best EMR Software for Doctors & Clinics in Gujranwala | Zonoir",
    description:
      "Zonoir is the leading EMR and clinic management software trusted by doctors and clinics across Gujranwala. Manage patients, appointments, and finances with ease.",
    keywords:
      "EMR software Gujranwala, clinic management Gujranwala, doctor software Gujranwala, patient management Gujranwala, medical software Punjab, healthcare software Gujranwala",
    canonicalUrl: "https://zonoir.com/emr-software-for-doctors-in-gujranwala",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zonoir - EMR Software for Gujranwala",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      description:
        "Complete clinic management and EMR software for doctors and healthcare providers in Gujranwala, Punjab.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "PKR",
      },
      areaServed: {
        "@type": "City",
        name: "Gujranwala",
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: "Punjab",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "85",
      },
    },
  });

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
  ];

  const testimonials = [
    {
      name: "Dr. Irfan Cheema",
      clinic: "Gujranwala Medical Complex",
      rating: 5,
      text: "Zonoir has revolutionized our clinic operations. The patient management and appointment scheduling features are exactly what we needed for our busy practice in Gujranwala.",
    },
    {
      name: "Dr. Farah Butt",
      clinic: "City Care Hospital",
      rating: 5,
      text: "As one of the leading healthcare providers in Gujranwala, we needed reliable software. Zonoir delivers exceptional performance and has improved our patient care significantly.",
    },
    {
      name: "Dr. Kashif Gondal",
      clinic: "Gondal Family Clinic",
      rating: 5,
      text: "The finance tracking and reporting features have given us complete visibility into our clinic's performance. Highly recommend Zonoir for clinics in Gujranwala.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <PublicHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl -z-10 animate-pulse"></div>

        <div className="max-w-5xl mx-auto space-y-8 relative">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 px-6 py-3 rounded-full border-2 border-emerald-200 shadow-lg animate-fade-in hover-scale">
            <MapPin className="h-5 w-5 text-emerald-600 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              #1 EMR Software in Gujranwala
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-fade-in">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              Best EMR Software for
            </span>
            <br />
            <span className="text-foreground">Doctors in Gujranwala</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Join healthcare providers across Gujranwala who trust Zonoir for complete clinic management.{" "}
            <span className="font-semibold text-purple-600">Manage patients, appointments, and finances</span> with the
            most trusted EMR software in Punjab.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Button
              onClick={() => navigate("/login")}
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
              className="text-lg px-10 py-6 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 shadow-2xl transition-all duration-300 hover:scale-110"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Gujranwala Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { number: "80+", label: "Clinics in Gujranwala", icon: Stethoscope },
            { number: "300+", label: "Doctors Using Zonoir", icon: UserPlus },
            { number: "25K+", label: "Patients Managed", icon: Users },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in border-2 border-transparent hover:border-purple-200"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-3">
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

      {/* Features */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-white/50 to-purple-50/30">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Features Loved by Gujranwala Doctors
            </span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            Everything you need to run a modern healthcare practice in Gujranwala
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/90 backdrop-blur border-2 border-purple-100 rounded-3xl p-8 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in"
            >
              <div
                className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-xl group-hover:scale-110 transition-all duration-500`}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Trusted by Doctors in Gujranwala
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-purple-100"
            >
              <Quote className="h-10 w-10 text-purple-300 mb-4" />
              <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div className="font-bold text-foreground">{testimonial.name}</div>
              <div className="text-sm text-purple-600">{testimonial.clinic}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Ready to Transform Your Gujranwala Clinic?
          </h2>
          <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
            Join the growing network of healthcare providers in Gujranwala using Zonoir for better patient care.
          </p>
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="text-lg px-12 py-7 bg-white text-purple-600 hover:bg-gray-50 shadow-2xl transition-all duration-300 hover:scale-110 font-bold"
          >
            Get Started Free
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default CityGujranwala;
