import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";
import {
  Shield,
  Lock,
  Eye,
  Server,
  UserCheck,
  Bell,
  Globe,
  Mail,
  Stethoscope,
  Ban,
  KeyRound,
  FileLock2,
} from "lucide-react";

const PrivacyPolicy = () => {
  useSEO({
    title: "Privacy Policy | Zonoir - Clinic Management Software",
    description:
      "Zonoir's privacy commitment to doctors and clinics: we never access your patient data, we never sell data to anyone, and your records remain fully under your control.",
    canonicalUrl: "https://zonoir.com/privacy-policy",
    ogUrl: "https://zonoir.com/privacy-policy",
  });

  const lastUpdated = "May 1, 2026";

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-4 mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        {/* Doctor Trust Pledge — highlighted up top */}
        <section className="mb-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold m-0">Our Privacy Pledge to Doctors & Clinics</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We understand that the trust your patients place in you is sacred — and the data you
            store on Zonoir is the foundation of that trust. As a clinic management platform built
            for healthcare, we have made a clear, written commitment to protect your patient
            information at every level.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-xl bg-background/60 p-4 border border-border/50">
              <Ban className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">We Never Sell Your Data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Patient records, contact details, and medical information are never sold, rented,
                  shared, or licensed to advertisers, insurers, pharma, or any third party — ever.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-background/60 p-4 border border-border/50">
              <FileLock2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Admins Cannot See Patient Records</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Zonoir staff and administrators have <strong>no access</strong> to your patients'
                  names, diagnoses, prescriptions, visit notes, or medical history. Only you and
                  your authorized clinic team can view this data.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-background/60 p-4 border border-border/50">
              <KeyRound className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">You Own Your Data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Every record you enter belongs to you and your clinic. You can export, edit, or
                  request deletion at any time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-background/60 p-4 border border-border/50">
              <Lock className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Bank-Grade Encryption</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All patient data is encrypted in transit (TLS) and at rest (AES-256), with strict
                  database-level access controls (Row-Level Security).
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed text-muted-foreground">
              At Zonoir ("we," "our," or "us"), your privacy — and the privacy of your patients —
              is our highest priority. This Privacy Policy explains how we collect, use, store, and
              protect information when you use our clinic management software and related services
              (the "Platform"). By using our Platform, you agree to the practices described below.
            </p>
          </section>

          {/* 1. Roles & Data Ownership */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-5 w-5 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">1. Roles & Data Ownership</h2>
            </div>
            <p className="text-muted-foreground">
              Under healthcare data protection principles (and frameworks like GDPR and HIPAA),
              roles are clearly separated:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>
                <strong>You (the Clinic / Doctor) are the Data Controller.</strong> You decide what
                patient information is collected, how it is used, and who in your team can access
                it.
              </li>
              <li>
                <strong>Zonoir is the Data Processor.</strong> We provide secure infrastructure to
                store and process the data on your behalf, strictly according to your instructions.
                We do not use your patient data for our own purposes.
              </li>
              <li>
                <strong>Patient records always belong to the clinic / doctor</strong> who created
                them — not to Zonoir.
              </li>
            </ul>
          </section>

          {/* 2. Information We Collect */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">2. Information We Collect</h2>
            </div>

            <h3 className="text-xl font-medium mt-6">2.1 Account Information (Visible to Us)</h3>
            <p className="text-muted-foreground">
              To operate the Platform, we collect basic account information that we can see for
              support, billing, and security purposes:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>Doctor / clinic name, email, phone number, and professional credentials.</li>
              <li>Clinic address, specialty, and registration details.</li>
              <li>Subscription, payment, and billing information.</li>
              <li>Support tickets, messages, and feedback you send us.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6">
              2.2 Patient & Clinical Data (Encrypted — Not Visible to Us)
            </h3>
            <p className="text-muted-foreground">
              Patient records that you enter — including names, contact details, medical history,
              diagnoses, prescriptions, ICD codes, lab results, visit notes, appointments, and
              uploaded documents — are stored under <strong>strict access controls</strong>. This
              data is:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>Visible only to you and the staff you have authorized inside your clinic.</li>
              <li>
                Protected by database-level Row-Level Security policies that block all other users,
                including Zonoir admins.
              </li>
              <li>Never used for analytics, marketing, AI training, or research by Zonoir.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6">2.3 Information Collected Automatically</h3>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, and timestamps — used
                only to improve the product. This never includes patient record contents.
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, and IP address
                for security and abuse prevention.
              </li>
              <li>
                <strong>Cookies:</strong> Only essential cookies for session and preferences. No
                third-party advertising cookies.
              </li>
            </ul>
          </section>

          {/* 3. Admin Access Policy */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Ban className="h-5 w-5 text-rose-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">
                3. Zonoir Admin Access — What We Can and Cannot See
              </h2>
            </div>
            <p className="text-muted-foreground">
              This is one of the most common questions doctors ask us, so we want to be completely
              transparent.
            </p>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                ✅ What Zonoir admins CAN see:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-6 text-sm">
                <li>Your clinic / doctor account profile (name, email, phone, specialty).</li>
                <li>Subscription plan, billing, and payment status.</li>
                <li>Aggregate, anonymized usage metrics (e.g., total appointments this month).</li>
                <li>Support tickets and messages you send us directly.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
              <p className="font-semibold text-rose-700 dark:text-rose-400 mb-2">
                ❌ What Zonoir admins CANNOT see:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-6 text-sm">
                <li>Patient names, contact details, age, gender, or addresses.</li>
                <li>Medical history, diagnoses, allergies, or prescriptions.</li>
                <li>Visit notes, consultation details, or lab/test results.</li>
                <li>Uploaded medical documents, scans, or images.</li>
                <li>Financial details specific to individual patients.</li>
              </ul>
            </div>

            <p className="text-muted-foreground">
              These restrictions are enforced at the <strong>database level</strong> using
              Row-Level Security policies — not just in the user interface. This means no Zonoir
              employee, support agent, or administrator can query, export, or browse your patient
              records, even with full backend access.
            </p>
            <p className="text-muted-foreground">
              <strong>The only exception</strong> is if you explicitly grant temporary access to
              our support team in writing to debug a specific issue you have reported. Such access
              is logged, time-bound, and revoked immediately after the issue is resolved.
            </p>
          </section>

          {/* 4. We Never Sell Your Data */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">4. We Never Sell Your Data</h2>
            </div>
            <p className="text-muted-foreground">
              Zonoir's business model is simple and transparent: we are funded by clinic and doctor
              subscriptions. We do <strong>not</strong> — and will never — sell, rent, license,
              trade, or share your data or your patients' data with:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>Pharmaceutical companies or medical device vendors.</li>
              <li>Insurance companies or third-party payers.</li>
              <li>Advertisers, marketers, or data brokers.</li>
              <li>Researchers or academic institutions.</li>
              <li>Any other third party for commercial gain.</li>
            </ul>
            <p className="text-muted-foreground">
              The only situations in which we share information are:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>
                <strong>Within your own clinic:</strong> Authorized staff (doctors, receptionists)
                can access records based on the roles you assign.
              </li>
              <li>
                <strong>Trusted infrastructure providers:</strong> Cloud hosting, email delivery,
                and video consultation providers process data strictly on our behalf under signed
                confidentiality and data protection agreements. They cannot use the data for any
                other purpose.
              </li>
              <li>
                <strong>Legal compliance:</strong> If required by a valid court order or law, we
                will notify the affected clinic before disclosure where legally permitted.
              </li>
              <li>
                <strong>Business transfer:</strong> In the unlikely event of a merger or
                acquisition, you will be notified in advance and the same privacy commitments will
                continue to apply.
              </li>
            </ul>
          </section>

          {/* 5. How We Use Your Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">5. How We Use Account Information</h2>
            </div>
            <p className="text-muted-foreground">
              We use the limited account information we collect (not patient records) to:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>Provide and operate the Platform's features.</li>
              <li>Authenticate users and enforce role-based access.</li>
              <li>Process subscription payments and send billing receipts.</li>
              <li>Send service communications (account alerts, security notices, updates).</li>
              <li>Provide customer support when you contact us.</li>
              <li>Improve product reliability through aggregated, anonymized analytics.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="text-muted-foreground">
              We <strong>never</strong> use patient data for these purposes, even in aggregate
              form, without explicit clinic-level consent.
            </p>
          </section>

          {/* 6. Data Protection & Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-purple-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">6. Security Measures</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>
                <strong>Encryption in transit:</strong> All connections use TLS 1.2+ (HTTPS).
              </li>
              <li>
                <strong>Encryption at rest:</strong> Patient records are encrypted using AES-256.
              </li>
              <li>
                <strong>Row-Level Security (RLS):</strong> Database policies enforce that only
                authorized members of your clinic can read or modify your records.
              </li>
              <li>
                <strong>Role-based access controls:</strong> You decide what each receptionist or
                team member can access.
              </li>
              <li>
                <strong>Audit logging:</strong> Every access to a patient record inside your clinic
                is logged and visible to you in Activity Logs.
              </li>
              <li>
                <strong>Secure authentication:</strong> Hashed passwords, secure session
                management, and optional multi-factor authentication.
              </li>
              <li>
                <strong>Automated backups:</strong> Daily encrypted backups protect against data
                loss; backups inherit the same access restrictions.
              </li>
              <li>
                <strong>Principle of least privilege:</strong> Even our engineering team operates
                under the strictest possible access boundaries.
              </li>
            </ul>
          </section>

          {/* 7. Data Retention */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Server className="h-5 w-5 text-cyan-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">7. Data Retention & Deletion</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>
                <strong>Patient records:</strong> Retained as long as your clinic account is
                active. You may delete individual records at any time.
              </li>
              <li>
                <strong>Account closure:</strong> When you close your account, you may export all
                your data first. We will permanently delete patient records within 90 days, unless
                a longer period is required by healthcare regulations applicable to your practice.
              </li>
              <li>
                <strong>Financial records:</strong> Retained for the period required by tax law
                (typically 7 years).
              </li>
              <li>
                <strong>Activity logs:</strong> Retained for 12 months for security and audit
                purposes.
              </li>
            </ul>
          </section>

          {/* 8. Your Rights */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">8. Your Rights</h2>
            </div>
            <p className="text-muted-foreground">As a clinic or doctor using Zonoir, you have the right to:</p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>Access</strong> all data stored in your account.</li>
              <li><strong>Export</strong> your patient records in a machine-readable format at any time.</li>
              <li><strong>Correct</strong> inaccurate information.</li>
              <li><strong>Delete</strong> records or your full account.</li>
              <li><strong>Restrict</strong> processing or withdraw consent for optional features.</li>
              <li><strong>Lodge a complaint</strong> with a data protection authority.</li>
            </ul>
            <p className="text-muted-foreground">
              Contact us at{" "}
              <a href="mailto:hello@zonoir.com" className="text-primary hover:underline">
                hello@zonoir.com
              </a>{" "}
              to exercise any of these rights. We respond within 30 days.
            </p>
          </section>

          {/* 9. Changes */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">9. Changes to This Policy</h2>
            </div>
            <p className="text-muted-foreground">
              We may update this Privacy Policy occasionally. Material changes — especially any
              that could affect doctor or patient data privacy — will be notified by email and an
              in-app notice at least 30 days before they take effect.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PrivacyPolicy;
