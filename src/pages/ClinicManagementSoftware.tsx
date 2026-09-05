import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  FileText,
  Pill,
  Coins,
  BarChart3,
  Video,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Globe,
  Clock,
  Star,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";
import featureDashboard from "@/assets/feature-dashboard.png";
import featureAppointments from "@/assets/feature-appointments.png";
import featureVisitRecord from "@/assets/feature-visit-record.png";
import featureFinance from "@/assets/feature-finance.png";
import featureAIInsights from "@/assets/feature-ai-insights.png";
import {
  USD_ORIGINAL_PRICE,
  USD_DISCOUNT_PERCENT,
  USD_DISCOUNTED_PRICE,
  USD_YEARLY_MONTHLY_RATE,
} from "@/lib/pricingConfig";

const PAGE_URL = "https://app.zonoir.com/clinic-management-software";

const modules = [
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    description:
      "Book, reschedule and track appointments on a 15-minute slot grid. Doctor availability, breaks and leaves are respected automatically, so double bookings cannot happen.",
  },
  {
    icon: Users,
    title: "Patient Records (EMR)",
    description:
      "One searchable record per patient: demographics, allergies, chronic conditions, documents and a complete visit timeline your team can read in seconds.",
  },
  {
    icon: FileText,
    title: "Visit Notes & Charting",
    description:
      "Structured consultation notes with vitals, complaints, ICD-coded diagnoses, procedures and reusable disease templates for repetitive cases.",
  },
  {
    icon: Pill,
    title: "Prescriptions",
    description:
      "Generate clean, printable prescriptions from your own medicine list, with dosage, frequency, duration and instructions grouped by diagnosis.",
  },
  {
    icon: Coins,
    title: "Billing & Finance",
    description:
      "Track consultation revenue, procedures, expenses and net profit. Monthly statements export to PDF or CSV for your accountant.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Revenue trends, profit and loss, peak-hour heatmaps, new vs returning patients, doctor scorecards and patient drop-off analysis.",
  },
  {
    icon: Video,
    title: "Telemedicine",
    description:
      "Built-in video consultations. Patients join from a browser link — no app install, no third-party subscription to manage.",
  },
  {
    icon: Brain,
    title: "AI Assistants",
    description:
      "AI visit summaries, prescription suggestions, patient insights and revenue forecasting — all grounded in the data already in your clinic.",
  },
  {
    icon: ShieldCheck,
    title: "Roles & Security",
    description:
      "Separate access for clinic owners, doctors and receptionists, with row-level data isolation, encryption in transit and at rest, and full audit logs.",
  },
];

const faqs = [
  {
    question: "What is clinic management software?",
    answer:
      "Clinic management software is a single system that runs the day-to-day operations of a medical practice: scheduling appointments, storing patient medical records, writing prescriptions, billing patients and reporting on performance. Zonoir combines all of those in one cloud application, so your front desk, doctors and owner all work from the same live data.",
  },
  {
    question: "How much does Zonoir cost?",
    answer: `Zonoir is $${USD_DISCOUNTED_PRICE} per doctor per month during our launch offer (regular price $${USD_ORIGINAL_PRICE}), or $${USD_YEARLY_MONTHLY_RATE} per doctor per month when billed annually. Every plan includes unlimited patients, all modules and free updates. Every signup starts with a 14-day free trial and no credit card is required.`,
  },
  {
    question: "Is Zonoir suitable for a single-doctor practice?",
    answer:
      "Yes. Pricing is per doctor, so a solo practitioner pays for one doctor and still gets the complete system, including receptionist accounts, telemedicine and analytics. Clinics with multiple doctors simply add more doctor accounts.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. Zonoir is cloud-based and runs in any modern browser on desktop, tablet or phone. There is also an installable mobile app experience for staff who prefer a home-screen icon.",
  },
  {
    question: "Can I move my existing patient data into Zonoir?",
    answer:
      "Yes. Patients can be imported from a CSV file, with built-in duplicate detection on contact number and national ID so the same patient is not created twice. You can export your data back out as CSV at any time.",
  },
  {
    question: "How is patient data protected?",
    answer:
      "Data is encrypted in transit and at rest, each clinic's records are isolated at the database level so one clinic can never read another's data, and every sensitive action is written to an audit log. Automated backups run continuously with point-in-time recovery.",
  },
  {
    question: "Does Zonoir include telemedicine?",
    answer:
      "Yes, video consultations are included at no extra subscription cost. The doctor starts the call from the appointment and the patient joins through a secure browser link.",
  },
];

const ClinicManagementSoftware = () => {
  const navigate = useNavigate();

  useSEO({
    title: "Clinic Management Software — All-in-One EMR & Practice System | Zonoir",
    description:
      "Zonoir is cloud clinic management software with scheduling, EMR, prescriptions, billing, telemedicine and AI reports. From $19.99 per doctor/month. 14-day free trial.",
    keywords:
      "clinic management software, clinic management system, medical practice software, EMR software, patient management software, telemedicine software",
    canonicalUrl: PAGE_URL,
    ogUrl: PAGE_URL,
    breadcrumbs: [
      { name: "Home", url: "https://app.zonoir.com/" },
      { name: "Clinic Management Software", url: PAGE_URL },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Zonoir Clinic Management Software",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web browser, iOS, Android",
        description:
          "Cloud clinic management software with appointment scheduling, electronic medical records, prescriptions, billing, telemedicine and AI-powered analytics.",
        url: PAGE_URL,
        offers: {
          "@type": "Offer",
          price: String(USD_DISCOUNTED_PRICE),
          priceCurrency: "USD",
          category: "SaaS subscription per doctor per month",
          availability: "https://schema.org/InStock",
          url: PAGE_URL,
        },
        featureList: modules.map((m) => m.title),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                Used by clinics and solo practices worldwide
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Clinic Management Software That Runs Your Whole Practice
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Zonoir brings appointments, electronic medical records, prescriptions,
                billing, telemedicine and analytics into one cloud system — so your front
                desk, your doctors and your accounts all work from the same live data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button size="lg" className="text-lg px-8" onClick={() => navigate("/login")}>
                  Start 14-Day Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate("/contact")}>
                  Book a Live Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Setup in under an hour
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Cancel anytime
                </span>
              </p>
            </div>
            <div>
              <img
                src={featureDashboard}
                alt="Zonoir clinic management software dashboard showing appointments, patients and revenue"
                className="rounded-xl border shadow-2xl w-full"
                loading="eager"
                width={1200}
                height={800}
              />
            </div>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What is clinic management software?
          </h2>
          <p className="text-muted-foreground text-lg mb-4">
            Clinic management software replaces the patchwork of paper registers,
            spreadsheets and messaging apps most practices still rely on. One system holds
            the appointment book, the patient chart, the prescription pad, the cash ledger
            and the reports the owner needs at month end.
          </p>
          <p className="text-muted-foreground text-lg">
            Because everything is connected, a booking made at the front desk instantly
            appears on the doctor's schedule, the consultation note attaches to the
            patient's timeline, and the fee collected shows up in that month's revenue
            report without anyone re-typing it.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything a clinic needs, in one system
            </h2>
            <p className="text-muted-foreground">
              Nine connected modules, included in every plan — no add-on modules and no
              per-feature upsells.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => (
              <Card key={m.title} className="border-primary/15 hover:border-primary/40 transition-colors h-full">
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <m.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{m.title}</h3>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots walkthrough */}
      <section className="container mx-auto px-4 py-16 md:py-20 space-y-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <img
            src={featureAppointments}
            alt="Appointment scheduling screen with 15-minute time slots per doctor"
            className="rounded-xl border shadow-lg w-full"
            loading="lazy"
          />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              A schedule your front desk can trust
            </h2>
            <p className="text-muted-foreground mb-4">
              Slots are generated from each doctor's real working hours, break times and
              approved leaves. Staff see only bookable times, and the system blocks
              conflicting bookings before they happen.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" /> 15-minute slot grid with walk-in and waitlist handling</li>
              <li className="flex gap-2"><Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Four clear statuses: scheduled, started, completed, cancelled</li>
              <li className="flex gap-2"><Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Calendar and list views for every doctor</li>
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="lg:order-2">
            <img
              src={featureVisitRecord}
              alt="Patient visit record with vitals, diagnosis and prescription"
              className="rounded-xl border shadow-lg w-full"
              loading="lazy"
            />
          </div>
          <div className="lg:order-1">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Charting that takes minutes, not hours
            </h2>
            <p className="text-muted-foreground mb-4">
              Record vitals, complaints, examination findings, ICD-coded diagnoses and
              medications on one screen. Disease templates pre-fill the cases you see every
              day, and the printed prescription is generated from the same note.
            </p>
            <Button variant="outline" asChild>
              <Link to="/features">See all features</Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <img
            src={featureFinance}
            alt="Clinic finance dashboard with revenue, expenses and net profit"
            className="rounded-xl border shadow-lg w-full"
            loading="lazy"
          />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Know exactly what the practice earned
            </h2>
            <p className="text-muted-foreground">
              Consultation fees, procedures and expenses roll up into monthly revenue,
              expense and net-profit figures with margin percentages. Filter any report by
              date range and export it to PDF or CSV.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="lg:order-2">
            <img
              src={featureAIInsights}
              alt="AI patient insights panel summarising history and risks"
              className="rounded-xl border shadow-lg w-full"
              loading="lazy"
            />
          </div>
          <div className="lg:order-1">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              AI that works on your own clinic data
            </h2>
            <p className="text-muted-foreground">
              Draft visit summaries, surface risks in a long patient history, suggest
              prescriptions for review and forecast next month's revenue. Every AI output
              is a draft the doctor confirms — nothing is saved to the chart automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted/40 border-y">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Simple per-doctor pricing</h2>
            <p className="text-muted-foreground">
              One plan with every module included. Add doctors as your practice grows.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-primary shadow-xl overflow-hidden">
              <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                <Star className="w-4 h-4 inline mr-1" />
                14-day free trial included
              </div>
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xl text-muted-foreground/70 line-through">
                    ${USD_ORIGINAL_PRICE}
                  </span>
                  <Badge className="bg-red-500 text-white border-0 text-xs">
                    {USD_DISCOUNT_PERCENT}% OFF
                  </Badge>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-foreground">${USD_DISCOUNTED_PRICE}</span>
                  <span className="text-muted-foreground">/doctor/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Or ${USD_YEARLY_MONTHLY_RATE} per doctor per month billed annually.
                </p>

                <div className="text-left space-y-3 mb-8">
                  {[
                    "Unlimited patients and visits",
                    "All modules — EMR, billing, telemedicine, AI",
                    "2 receptionist accounts per doctor",
                    "Reports, exports and audit logs",
                    "Email support and free updates",
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full" size="lg" onClick={() => navigate("/login")}>
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Clinics in Pakistan are billed in rupees —{" "}
                  <Link to="/pricing" className="underline">
                    see PKR pricing
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Clinic management software FAQs
          </h2>
          <div className="space-y-5">
            {faqs.map((f) => (
              <Card key={f.question} className="border-primary/15">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{f.question}</h3>
                  <p className="text-sm text-muted-foreground">{f.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="bg-primary border-0 p-10 md:p-14 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Try Zonoir free for 14 days
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Set up your clinic, add your doctors and see your first week of appointments
            run through the system. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate("/login")}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/contact")}
            >
              Talk to Sales
            </Button>
          </div>
        </Card>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ClinicManagementSoftware;
