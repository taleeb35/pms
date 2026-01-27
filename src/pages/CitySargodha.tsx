import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  Phone,
  MapPin,
  Star,
} from "lucide-react";

const CitySargodha = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO Configuration
  useSEO({
    title: "EMR Software for Doctors in Sargodha | Clinic Management Software Sargodha",
    description: "Best EMR software for doctors in Sargodha. Complete clinic management solution with patient records, appointment scheduling, billing & prescriptions. Trusted by 180+ Sargodha clinics.",
    keywords: "EMR software Sargodha, clinic management software Sargodha, doctor software Sargodha, patient management Sargodha, clinic software Satellite Town, hospital software Sargodha, medical billing software Sargodha, prescription software Sargodha, OPD management Sargodha, healthcare software Sargodha, electronic medical records Sargodha, doctor appointment system Sargodha, clinic ERP Sargodha, healthcare IT Central Punjab",
    canonicalUrl: "https://zonoir.com/emr-software-for-doctors-in-sargodha",
    ogTitle: "EMR Software for Doctors in Sargodha | Clinic Management Software",
    ogDescription: "Best EMR software for doctors in Sargodha. Complete clinic management solution trusted by 180+ Sargodha clinics.",
    ogUrl: "https://zonoir.com/emr-software-for-doctors-in-sargodha",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Zonoir EMR Software - Sargodha",
      "description": "Complete EMR and clinic management software for doctors in Sargodha, Punjab, Pakistan",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "PKR",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "180",
        "bestRating": "5"
      },
      "areaServed": {
        "@type": "City",
        "name": "Sargodha",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Punjab",
          "containedInPlace": {
            "@type": "Country",
            "name": "Pakistan"
          }
        }
      },
      "provider": {
        "@type": "Organization",
        "name": "Zonoir",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Sargodha",
          "addressRegion": "Punjab",
          "addressCountry": "PK"
        }
      }
    }
  });

  const features = [
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Manage patient appointments efficiently for your Sargodha clinic",
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Complete patient records and history management",
    },
    {
      icon: FileText,
      title: "EMR & Prescriptions",
      description: "Digital prescriptions and electronic medical records",
    },
    {
      icon: DollarSign,
      title: "Billing & Finance",
      description: "Streamlined billing and financial tracking",
    },
    {
      icon: Clock,
      title: "Queue Management",
      description: "Reduce patient wait times with smart queue system",
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "HIPAA compliant secure patient data storage",
    },
  ];

  const benefits = [
    "Reduce administrative workload by 60%",
    "Improve patient satisfaction scores",
    "Access patient records anytime, anywhere",
    "Generate detailed reports and analytics",
    "Seamless integration with existing workflows",
    "24/7 technical support in Urdu and English",
  ];

  const testimonials = [
    {
      name: "Dr. Zahid Mahmood",
      clinic: "Sargodha Medical Center",
      rating: 5,
      review: "Zonoir has revolutionized our practice. The software is intuitive and the support team is always helpful.",
    },
    {
      name: "Dr. Amina Bibi",
      clinic: "Satellite Town Clinic",
      rating: 5,
      review: "Best EMR solution for doctors in Sargodha. Easy to use and very affordable.",
    },
    {
      name: "Dr. Rashid Khan",
      clinic: "City Healthcare Hospital",
      rating: 5,
      review: "Highly recommend Zonoir for all healthcare professionals in Punjab. Excellent features and reliability.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Serving 180+ Clinics in Sargodha</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              EMR Software for Doctors in <span className="text-primary">Sargodha</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Pakistan's #1 clinic management solution designed specifically for healthcare professionals in Sargodha. 
              Manage patients, appointments, prescriptions, and billing all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/contact")} className="text-lg px-8">
                <Phone className="w-5 h-5 mr-2" />
                Contact Sales
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">180+</div>
              <div className="text-muted-foreground">Sargodha Clinics</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">350K+</div>
              <div className="text-muted-foreground">Patients Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
              <div className="text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Clinic Management for Sargodha Doctors
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run your clinic efficiently, designed with input from healthcare professionals across Sargodha and Central Punjab.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Sargodha Doctors Choose Zonoir
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of successful clinics across Sargodha who trust Zonoir for their practice management.
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Sargodha Doctors Say About Us
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.review}"</p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.clinic}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Sargodha Clinic?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join 180+ successful clinics in Sargodha. Start your free trial today.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg px-8"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default CitySargodha;
