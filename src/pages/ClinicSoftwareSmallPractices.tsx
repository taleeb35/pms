import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Timer,
  Calendar,
  FileText,
  Smartphone,
  LifeBuoy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Clock,
  Globe,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";

const PAGE_URL = "https://zonoir.com/clinic-software-small-practices";
const PILLAR_URL = "https://zonoir.com/clinic-management-software";

const priorities = [
  {
    icon: Wallet,
    title: "Pricing a Small Practice Can Actually Afford",
    body: "Enterprise hospital systems cost thousands per month and need IT staff. Small practices need per-doctor pricing under $25/month with everything included — no setup fees, no per-SMS charges, no paid add-ons for basics like reports or telemedicine. Zonoir is $19.99 per doctor per month, with an annual plan that cuts the effective rate further.",
  },
  {
    icon: Timer,
    title: "Setup Measured in Hours, Not Months",
    body: "A solo practitioner or 3-doctor clinic cannot pause operations for a software migration. The right system lets you register, add doctors, set schedules and start booking the same day. CSV import brings your existing patient list across in bulk, so historical records arrive without weeks of retyping.",
  },
  {
    icon: Calendar,
    title: "Scheduling That Handles Your Real Day",
    body: "Small practices run on tight slots and shared reception desks. Look for doctor-set availability, break times, leave handling, walk-in support and online booking from a public profile — so patients self-schedule while your front desk handles the waiting room instead of the phone.",
  },
  {
    icon: FileText,
    title: "Fast Charting and One-Click Prescriptions",
    body: "Doctors in small practices see 30–50 patients a day and have no time for slow software. Structured visit records, reusable disease and prescription templates, and an AI prescription assistant cut documentation to minutes. Prescriptions should print professionally from your own medicine catalog.",
  },
  {
    icon: Smartphone,
    title: "Works on the Devices You Already Own",
    body: "No new hardware budget. Cloud software runs in any browser on the reception PC, the doctor's laptop and the owner's phone. A mobile-friendly app experience means the owner can check today's revenue from home and the doctor can review tomorrow's schedule on the way in.",
  },
  {
    icon: LifeBuoy,
    title: "Support That Answers a Small Team",
    body: "Small practices have no IT department. When something breaks at 9 AM with a full waiting room, you need chat or WhatsApp support that responds in minutes — plus a searchable knowledge base so receptionists can solve common issues themselves.",
  },
];

const avoid = [
  "Systems designed for hospitals that bury small clinics in unused modules",
  "Per-feature pricing where telemedicine, reports and reminders each cost extra",
  "Desktop-only software that locks records to one computer and needs manual backups",
  "Vendors that charge you to export your own patient data",
  "Long contracts with no genuine free trial using your own data",
];

const faqs = [
  {
    q: "What is the best clinic software for a small practice?",
    a: "The best clinic software for a small practice combines scheduling, patient records (EMR), prescriptions, billing and reports in one affordable, cloud-based system. It should set up in a day, cost under $25 per doctor per month, include telemedicine and support without add-on fees, and let you export your data freely. Zonoir covers all of these with a 14-day free trial.",
  },
  {
    q: "How much should a small clinic spend on software?",
    a: "A realistic budget is $15–$25 per doctor per month for a complete cloud system. Below that, systems usually exclude essentials like reports or video consultations and charge them as add-ons. Above that, you are often paying for hospital-scale features a small practice never uses. Always calculate the total monthly cost including add-ons, not the headline price.",
  },
  {
    q: "Can a solo doctor use clinic management software?",
    a: "Yes — solo practitioners benefit the most per dollar. Online booking removes phone interruptions during consultations, prescription templates save an hour a day of repetitive writing, and automatic financial reports replace a part-time accountant's monthly summary. A single-doctor clinic can run Zonoir for $19.99/month after the free trial.",
  },
  {
    q: "Do I need to keep paper records as backup?",
    a: "No, once your clinic software is cloud-based with automatic backups. Cloud systems store data on redundant servers with encryption, so records survive hardware failures, theft and fire — none of which paper survives. During the first two weeks of transition many clinics run both, then retire paper for anything except original signed consent forms.",
  },
  {
    q: "How do I move my existing patient list into new software?",
    a: "Export or compile your patients into a CSV file with columns for name, phone, age, gender and city, then use the software's bulk import. Zonoir's CSV importer validates rows, flags duplicates by phone number and imports hundreds of patients in one pass. Historical visit notes can be attached to records as documents over time.",
  },
];

const ClinicSoftwareSmallPractices = () => {
  useSEO({
    title: "Best Clinic Software for Small Practices (2026 Guide) | Zonoir",
    description:
      "How to choose clinic software for a small practice: affordable per-doctor pricing, fast setup, scheduling, EMR, prescriptions and support. What to look for, what to avoid, and real costs.",
    keywords:
      "clinic software for small practices, small clinic software, best clinic software, solo practice software, affordable clinic management software",
    canonicalUrl: PAGE_URL,
    ogUrl: PAGE_URL,
    ogType: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Best Clinic Software for Small Practices: 2026 Buyer's Guide",
        description:
          "How small practices should choose clinic software — pricing, setup speed, scheduling, EMR, prescriptions, devices and support, plus common traps to avoid.",
        author: { "@type": "Organization", name: "Zonoir" },
        publisher: { "@type": "Organization", name: "Zonoir" },
        mainEntityOfPage: PAGE_URL,
        datePublished: "2026-09-07",
        dateModified: "2026-09-07",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
    breadcrumbs: [
      { name: "Home", url: "https://zonoir.com/" },
      { name: "Clinic Management Software", url: PILLAR_URL },
      { name: "Clinic Software for Small Practices", url: PAGE_URL },
    ],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative mx-auto px-4 max-w-4xl">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Buyer's Guide
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Best Clinic Software for Small Practices: What Actually Matters in 2026
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Small practices don't need hospital software with a smaller invoice. They need a
            system built around a tight team, a full waiting room and a real budget. Here's how
            to choose one — and the traps that cost clinics thousands.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 10 min read
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> Updated September 2026
            </span>
          </div>
          <Link to="/clinic-management-software">
            <Button size="lg" className="gap-2">
              See Zonoir's Clinic Management Software
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Intro */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <article className="prose prose-lg max-w-none">
          <h2>Why Small Practices Need Different Software</h2>
          <p>
            Most clinic software is designed for hospitals and then sold to small practices with
            a discount. The result: a solo doctor or 3-physician clinic pays for modules it never
            opens, needs training it has no time for, and still can't answer the question that
            matters — <em>how did the practice do this month?</em>
          </p>
          <p>
            A small practice has specific constraints: one receptionist doing three jobs, doctors
            seeing a patient every 10–15 minutes, no IT staff, and no tolerance for downtime. The
            right{" "}
            <Link to="/clinic-management-software" className="text-primary hover:underline">
              clinic management software
            </Link>{" "}
            is judged by how fast the front desk books a follow-up, how quickly the doctor
            finishes a prescription, and whether the owner can read the month's profit without
            calling an accountant.
          </p>
        </article>
      </section>

      {/* Priorities */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <h2 className="text-3xl font-bold mb-3">Six Things That Matter Most</h2>
        <p className="text-muted-foreground mb-8">
          Rank every system you evaluate against these six criteria — in this order.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {priorities.map((s) => (
            <Card key={s.title} className="border-border/50">
              <CardContent className="pt-6">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What to avoid */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold mb-6">Five Traps to Avoid</h2>
            <ul className="space-y-3">
              {avoid.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* How Zonoir fits */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <article className="prose prose-lg max-w-none">
          <h2>How Zonoir Fits a Small Practice</h2>
          <p>
            Zonoir was built around the small-practice day. The receptionist books from a live
            15-minute slot grid that respects each doctor's availability, breaks and leaves —
            double bookings are structurally impossible. Patients book themselves from your
            public profile page, cutting front-desk phone load. The doctor charts with structured
            visit records, ICD-coded diagnoses, reusable templates and an AI prescription
            assistant, and prints a professional prescription in one click.
          </p>
          <p>
            The owner gets a financial dashboard — revenue, expenses, net profit and margin —
            plus analytics on peak hours, new vs returning patients and doctor performance.
            Video consultations are built in, not bolted on. Everything runs in the browser on
            devices you already own, encrypted and isolated per clinic, with automatic backups.
          </p>
          <ul>
            {[
              "Live in one day: register, add doctors, set schedules, start booking",
              "$19.99 per doctor per month — all features included, no add-on fees",
              "14-day free trial with your real doctors and patient volume",
              "CSV patient import and free data export at any time",
              "Built-in video consultations and AI documentation tools",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 not-prose mb-2">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <Card key={f.q} className="border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 max-w-4xl pb-20">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20">
          <CardContent className="py-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Run Your Small Practice on Software Built for It
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Scheduling, EMR, prescriptions, billing, telemedicine and reports — live in your
              clinic today. Free for 14 days, then $19.99 per doctor per month.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/clinic-management-software">
                <Button size="lg" className="gap-2">
                  Explore Features & Pricing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ClinicSoftwareSmallPractices;
