import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  FileText,
  Coins,
  Video,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Clock,
  Globe,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";

const PAGE_URL = "https://zonoir.com/clinic-management-system-guide";
const PILLAR_URL = "https://zonoir.com/clinic-management-software";

const sections = [
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    body: "The front desk is where most clinics lose time. A modern clinic management system replaces the paper register with a live calendar: doctors set weekly availability and breaks, the system offers only valid slots, and double bookings become impossible. Online booking from your public profile lets patients self-schedule without a phone call, and 15-minute slot grids keep multi-doctor days predictable.",
  },
  {
    icon: Users,
    title: "Patient Records & EMR",
    body: "Every patient gets one searchable record: demographics, contact number, allergies, chronic conditions, uploaded documents and a complete visit timeline. Duplicate detection by phone number stops the same patient being registered twice — a common source of broken histories in busy clinics. Receptionists can import existing records from CSV, so switching from paper or another system takes hours, not weeks.",
  },
  {
    icon: FileText,
    title: "Charting, Prescriptions & Templates",
    body: "Doctors record visits with structured fields for vitals, complaints, ICD-coded diagnoses and procedures. Reusable disease templates and prescription templates cut documentation time on repetitive cases. Prescriptions print on a clean, professional layout grouped by diagnosis — readable for the patient and defensible for the record.",
  },
  {
    icon: Coins,
    title: "Billing, Finance & Reports",
    body: "Consultation fees, procedure charges and expenses flow into a single ledger. The system calculates net profit and margin automatically, and monthly statements export to PDF or CSV for your accountant. Analytics dashboards show revenue trends, peak-hour heatmaps, new vs returning patients, doctor performance scorecards and patient drop-off points.",
  },
  {
    icon: Video,
    title: "Telemedicine",
    body: "Video consultations are no longer optional. A good clinic management system includes them natively: the patient receives a browser link, joins without installing an app, and the doctor documents the visit in the same record as an in-person consultation. No separate telehealth subscription to manage.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    body: "Patient data must be encrypted in transit and at rest, isolated per clinic so one practice can never see another's records, and protected by role-based access — the receptionist sees what the front desk needs, not the doctor's finances. Audit logs record who changed what and when. These controls are the foundation of HIPAA and GDPR readiness for small practices.",
  },
];

const checklist = [
  "Cloud-based — works from any browser, no server to maintain",
  "Multi-doctor scheduling with availability, breaks and leave handling",
  "Complete EMR: visit timeline, documents, allergies, ICD diagnoses",
  "Printable prescriptions from your own medicine catalog",
  "Built-in video consultations, no third-party tool required",
  "Financial reports: profit & loss, expenses, monthly exports",
  "AI assistance for prescriptions, visit summaries and revenue forecasts",
  "Public profile page so new patients can find and book you online",
  "Role-based access for owners, doctors and receptionists",
  "Transparent per-doctor pricing with a free trial",
];

const faqs = [
  {
    q: "What is a clinic management system?",
    a: "A clinic management system is software that runs the daily operations of an outpatient clinic: appointment scheduling, patient records (EMR), prescriptions, billing and reporting. Instead of separate paper registers, spreadsheets and accounting files, everything lives in one system that the whole team shares in real time.",
  },
  {
    q: "Is a clinic management system the same as an EMR?",
    a: "No. An EMR (electronic medical record) covers the clinical side — histories, notes, diagnoses and prescriptions. A clinic management system includes the EMR but also handles scheduling, billing, expenses, staff roles and analytics. Small and mid-sized clinics usually get more value from a combined system than from buying an EMR alone.",
  },
  {
    q: "How much does a clinic management system cost?",
    a: "Cloud systems are typically priced per doctor per month, ranging from around $15 to $200 depending on features and market. Zonoir starts at $19.99 per doctor per month with a 14-day free trial, and an annual plan that reduces the effective monthly rate. Watch for hidden costs: setup fees, per-SMS charges and paid add-ons for telemedicine or reports.",
  },
  {
    q: "Cloud or desktop — which is better for a small clinic?",
    a: "Cloud, in almost every case. Desktop software ties your records to one computer, needs manual backups and blocks remote access. A cloud system runs in any browser, backs up automatically, lets the doctor check tomorrow's schedule from home, and survives hardware failures. The only requirement is a stable internet connection.",
  },
  {
    q: "How long does it take to switch from paper to a clinic management system?",
    a: "The system itself can be set up in a day — register the clinic, add doctors, set schedules. Migrating historical patient data takes longer, but CSV import tools let you bring in existing patient lists in bulk. Most small clinics are fully operational within one to two weeks, running new visits digitally from day one.",
  },
];

const ClinicManagementSystemGuide = () => {
  useSEO({
    title: "Clinic Management System: Complete Guide for 2026 | Zonoir",
    description:
      "What a clinic management system is, how it works, and how to choose one. Covers scheduling, EMR, prescriptions, billing, telemedicine, security and pricing for small and mid-sized clinics.",
    keywords:
      "clinic management system, clinic management software, clinic software, EMR for clinics, medical practice software",
    canonicalUrl: PAGE_URL,
    ogUrl: PAGE_URL,
    ogType: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Clinic Management System: Complete Guide for 2026",
        description:
          "A complete guide to clinic management systems — scheduling, EMR, prescriptions, billing, telemedicine, security and how to choose one for your practice.",
        author: { "@type": "Organization", name: "Zonoir" },
        publisher: { "@type": "Organization", name: "Zonoir" },
        mainEntityOfPage: PAGE_URL,
        datePublished: "2026-09-06",
        dateModified: "2026-09-06",
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
      { name: "Clinic Management System Guide", url: PAGE_URL },
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
            Complete Guide
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Clinic Management System: The Complete Guide for 2026
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            What a clinic management system actually does, which features matter for small and
            mid-sized practices, and how to choose one without overpaying. Written for clinic
            owners and doctors making the switch from paper or spreadsheets.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 12 min read
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
          <h2>What Is a Clinic Management System?</h2>
          <p>
            A clinic management system is software that runs the daily operations of an outpatient
            clinic from a single place: appointment scheduling, patient records (EMR),
            prescriptions, billing and reporting. Instead of a paper appointment book at the front
            desk, a file cabinet of patient folders, a separate prescription pad and a spreadsheet
            for accounts, everything lives in one shared system that updates in real time.
          </p>
          <p>
            The term is often used interchangeably with{" "}
            <Link to="/clinic-management-software" className="text-primary hover:underline">
              clinic management software
            </Link>
            . Whatever the name, the goal is the same: less admin time, fewer errors, and a clear
            picture of how the practice is performing.
          </p>
          <p>
            Clinics that switch from paper typically report three immediate wins: the front desk
            stops playing phone-tag over appointments, doctors stop rewriting the same
            prescriptions, and the owner finally knows the month's profit without waiting for the
            accountant.
          </p>
        </article>
      </section>

      {/* Core modules */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <h2 className="text-3xl font-bold mb-3">The Six Core Modules to Look For</h2>
        <p className="text-muted-foreground mb-8">
          Every vendor's feature list looks different, but a complete clinic management system
          covers these six areas. If one is missing, you will end up paying for it separately.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((s) => (
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

      {/* Checklist */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold mb-6">
              Buyer's Checklist: 10 Things to Verify Before You Pay
            </h2>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* How to choose */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <article className="prose prose-lg max-w-none">
          <h2>How to Choose: A Practical Process</h2>
          <h3>1. Start with your biggest pain, not the longest feature list</h3>
          <p>
            If missed appointments are killing revenue, scheduling and reminders matter more than
            AI features. If doctors stay late finishing notes, charting speed matters most. Rank
            your top three problems and judge every demo against them.
          </p>
          <h3>2. Insist on a real free trial with your own data</h3>
          <p>
            A sales demo shows the software at its best. A 14-day trial with your actual doctors,
            schedules and patient volume shows the truth. Add two or three real doctors, run a
            normal clinic day, and watch where the system slows your team down.
          </p>
          <h3>3. Calculate the true monthly cost</h3>
          <p>
            Per-doctor pricing is the norm, but check what is excluded: telemedicine, SMS
            reminders, reports and support are common paid add-ons. A $15/doctor system with $60
            of add-ons costs more than a $19.99/doctor system that includes everything.
          </p>
          <h3>4. Check the exit door before you enter</h3>
          <p>
            Your patient data is yours. Confirm you can export patients, visits and financial
            records to CSV or PDF at any time, without paying a fee. A vendor that makes leaving
            hard is a vendor to avoid.
          </p>
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
              Try a Complete Clinic Management System Free for 14 Days
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Scheduling, EMR, prescriptions, billing, telemedicine and reports — everything in
              this guide, live in your clinic today. $19.99 per doctor per month after the trial.
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

export default ClinicManagementSystemGuide;
