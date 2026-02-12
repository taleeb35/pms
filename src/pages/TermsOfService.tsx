import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";
import { FileText, Scale, AlertTriangle, CreditCard, Ban, RefreshCw, Gavel, Mail } from "lucide-react";

const TermsOfService = () => {
  useSEO({
    title: "Terms of Service | Zonoir - Clinic Management Software",
    description:
      "Read the Terms of Service for Zonoir clinic management software. Understand your rights, responsibilities, and our commitment to healthcare data privacy.",
    canonicalUrl: "https://zonoir.com/terms-of-service",
    ogUrl: "https://zonoir.com/terms-of-service",
  });

  const lastUpdated = "February 12, 2026";

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-4 mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed text-muted-foreground">
              These Terms of Service ("Terms") govern your use of the Zonoir clinic management
              platform and all related services (the "Platform"). By accessing or using the Platform,
              you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
            </p>
          </section>

          {/* 1. Definitions */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">1. Definitions</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>"User"</strong> refers to any individual or entity who accesses or uses the Platform, including doctors, clinics, receptionists, content writers, and administrators.</li>
              <li><strong>"Healthcare Provider"</strong> refers to licensed medical professionals (doctors) and clinics using the Platform to manage their practice.</li>
              <li><strong>"Patient Data"</strong> refers to any personal health information, medical records, or identifiable patient details entered into the Platform.</li>
              <li><strong>"Subscription"</strong> refers to the paid plan that grants access to premium features and services.</li>
            </ul>
          </section>

          {/* 2. Eligibility & Account Registration */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Scale className="h-5 w-5 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">2. Eligibility & Account Registration</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>You must be at least 18 years of age or the age of majority in your jurisdiction to use the Platform.</li>
              <li>Healthcare Providers must hold valid medical licenses and credentials as required by their jurisdiction.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.</li>
              <li>You agree to provide accurate, current, and complete information during registration and to keep it updated.</li>
              <li>Zonoir reserves the right to approve, suspend, or terminate accounts at its discretion, particularly for non-compliance with these Terms.</li>
            </ul>
          </section>

          {/* 3. Acceptable Use */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Ban className="h-5 w-5 text-purple-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">3. Acceptable Use</h2>
            </div>
            <p className="text-muted-foreground">You agree <strong>not</strong> to:</p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>Use the Platform for any unlawful purpose or in violation of any applicable law or regulation.</li>
              <li>Access, modify, or share Patient Data without proper authorization from the respective Healthcare Provider.</li>
              <li>Attempt to reverse-engineer, decompile, or gain unauthorized access to any part of the Platform's infrastructure.</li>
              <li>Upload malicious code, viruses, or any content that could harm the Platform or its users.</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
              <li>Use the Platform in a manner that could overload, disable, or impair our servers or networks.</li>
              <li>Share your account credentials or allow unauthorized persons to access the Platform through your account.</li>
            </ul>
          </section>

          {/* 4. Patient Data & Healthcare Compliance */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">4. Patient Data & Healthcare Compliance</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>Healthcare Providers</strong> are the data controllers for all Patient Data entered into the Platform. Zonoir acts as a data processor on their behalf.</li>
              <li>Healthcare Providers are solely responsible for obtaining necessary patient consent before entering any personal health information into the Platform.</li>
              <li>Zonoir implements technical safeguards (encryption, access controls, audit logs) but does not provide medical advice, diagnoses, or treatment recommendations.</li>
              <li>The Platform is a management tool — all clinical decisions remain the sole responsibility of the Healthcare Provider.</li>
              <li>Users must comply with all applicable healthcare data protection laws in their jurisdiction, including but not limited to HIPAA (USA), GDPR (EU), and local data protection regulations.</li>
            </ul>
          </section>

          {/* 5. Subscriptions & Payments */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">5. Subscriptions & Payments</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>Free Trial:</strong> New accounts may receive a trial period. Features available during the trial are subject to change.</li>
              <li><strong>Paid Plans:</strong> Subscription fees are billed monthly. Pricing details are available on our Pricing page.</li>
              <li><strong>Payment Terms:</strong> Payments are due as per the agreed billing cycle. Late payments may result in service suspension.</li>
              <li><strong>Refunds:</strong> Subscription fees are non-refundable unless otherwise required by law. Unused portions of a billing cycle are not eligible for refunds.</li>
              <li><strong>Price Changes:</strong> Zonoir may adjust pricing with 30 days' prior written notice. Continued use after the effective date constitutes acceptance of new pricing.</li>
            </ul>
          </section>

          {/* 6. Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>The Platform, including its design, code, logos, trademarks, and documentation, is the exclusive property of Zonoir and is protected by intellectual property laws.</li>
              <li>You retain ownership of all data you input into the Platform. By using the Platform, you grant Zonoir a limited license to process this data solely for providing the services.</li>
              <li>Blog content and articles published through the Platform remain the property of their respective authors and Zonoir.</li>
              <li>You may not copy, modify, distribute, or create derivative works of any part of the Platform without prior written consent.</li>
            </ul>
          </section>

          {/* 7. Service Availability & Limitations */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">7. Service Availability & Limitations</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>We strive for high availability but do not guarantee uninterrupted access. Scheduled maintenance and updates may cause temporary downtime.</li>
              <li>The Platform is provided "as is" and "as available" without warranties of any kind, whether express or implied.</li>
              <li>Zonoir is not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform.</li>
              <li>Our total liability shall not exceed the amount you paid for the Platform in the 12 months preceding the claim.</li>
            </ul>
          </section>

          {/* 8. Termination */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Termination</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>You may terminate your account at any time by contacting our support team.</li>
              <li>Zonoir may suspend or terminate your access for violation of these Terms, non-payment, or any activity that threatens the security or integrity of the Platform.</li>
              <li>Upon termination, your right to access the Platform ceases immediately. Data retention following termination is governed by our Privacy Policy.</li>
              <li>Healthcare Providers should export their data before account termination. Zonoir will provide a reasonable period for data export upon request.</li>
            </ul>
          </section>

          {/* 9. Governing Law & Dispute Resolution */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Gavel className="h-5 w-5 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">9. Governing Law & Dispute Resolution</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>These Terms are governed by and construed in accordance with the laws of Pakistan.</li>
              <li>Any disputes arising from or relating to these Terms shall first be resolved through good-faith negotiation.</li>
              <li>If negotiation fails, disputes shall be submitted to binding arbitration in Lahore, Pakistan, in accordance with applicable arbitration rules.</li>
              <li>Nothing in these Terms limits your right to seek injunctive relief in a court of competent jurisdiction.</li>
            </ul>
          </section>

          {/* 10. Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Changes to These Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. Material changes will be
              communicated via email or in-app notification at least 30 days before taking effect.
              Your continued use of the Platform after such changes constitutes your acceptance of the
              revised Terms.
            </p>
          </section>

          {/* 11. Contact */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-rose-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">11. Contact Us</h2>
            </div>
            <p className="text-muted-foreground">
              For questions or concerns about these Terms, please reach out to us:
            </p>
            <div className="bg-muted/50 rounded-xl p-6 space-y-2 text-muted-foreground">
              <p><strong>Zonoir</strong></p>
              <p>Email: <a href="mailto:hello@zonoir.com" className="text-primary hover:underline">hello@zonoir.com</a></p>
              <p>Phone: <a href="tel:+923004313139" className="text-primary hover:underline">+92 300 4313139</a></p>
              <p>Address: Gulberg III, Lahore, Pakistan</p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default TermsOfService;
