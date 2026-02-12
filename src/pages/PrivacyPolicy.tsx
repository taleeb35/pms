import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";
import { Shield, Lock, Eye, Server, UserCheck, Bell, Globe, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  useSEO({
    title: "Privacy Policy | Zonoir - Clinic Management Software",
    description:
      "Learn how Zonoir protects your personal and medical data. Our privacy policy outlines data collection, usage, storage, and your rights as a user.",
    canonicalUrl: "https://zonoir.com/privacy-policy",
    ogUrl: "https://zonoir.com/privacy-policy",
  });

  const lastUpdated = "February 12, 2026";

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

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed text-muted-foreground">
              At Zonoir ("we," "our," or "us"), your privacy is of utmost importance. This Privacy
              Policy explains how we collect, use, store, and protect your information when you use
              our clinic management software and related services (the "Platform"). By using our
              Platform, you agree to the practices described in this policy.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">1. Information We Collect</h2>
            </div>

            <h3 className="text-xl font-medium mt-6">1.1 Information You Provide</h3>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>Account Information:</strong> Name, email address, phone number, and professional credentials when you register as a doctor, clinic, or receptionist.</li>
              <li><strong>Patient Records:</strong> Patient names, contact details, date of birth, gender, medical history, diagnoses, prescriptions, and visit records — entered by authorized healthcare providers.</li>
              <li><strong>Appointment Data:</strong> Scheduling details, consultation fees, notes, and status updates.</li>
              <li><strong>Financial Data:</strong> Payment records, subscription details, and billing information processed through the Platform.</li>
              <li><strong>Support Communications:</strong> Messages, tickets, and feedback you submit through our support channels.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6">1.2 Information Collected Automatically</h3>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>Usage Data:</strong> Pages visited, features used, timestamps, and interaction patterns to improve our service.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, screen resolution, and IP address.</li>
              <li><strong>Cookies:</strong> We use essential cookies to maintain your session and preferences. No third-party advertising cookies are used.</li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">2. How We Use Your Information</h2>
            </div>
            <p className="text-muted-foreground">We use the information we collect to:</p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>Provide, operate, and maintain the Platform's core functionality including patient management, appointment scheduling, and medical record keeping.</li>
              <li>Authenticate users and enforce role-based access controls to protect sensitive data.</li>
              <li>Process payments, manage subscriptions, and generate financial reports for clinics and doctors.</li>
              <li>Send service-related communications, including appointment reminders, account notifications, and security alerts.</li>
              <li>Improve the Platform through analytics, bug fixes, and feature development.</li>
              <li>Respond to support requests and provide customer assistance.</li>
              <li>Comply with legal obligations and enforce our Terms of Service.</li>
            </ul>
          </section>

          {/* 3. Data Protection & Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-purple-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">3. Data Protection & Security</h2>
            </div>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>Encryption:</strong> All data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption.</li>
              <li><strong>Access Controls:</strong> Role-based access ensures that only authorized personnel (doctors, clinic staff, receptionists) can view relevant patient data.</li>
              <li><strong>Row-Level Security:</strong> Database-level policies ensure users can only access data they are authorized to view.</li>
              <li><strong>Audit Logging:</strong> All access to patient records and critical actions are logged for accountability and compliance.</li>
              <li><strong>Secure Authentication:</strong> Multi-factor authentication support, secure password hashing, and session management.</li>
              <li><strong>Regular Backups:</strong> Automated daily backups to prevent data loss.</li>
            </ul>
          </section>

          {/* 4. Data Sharing & Disclosure */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">4. Data Sharing & Disclosure</h2>
            </div>
            <p className="text-muted-foreground">
              We do <strong>not</strong> sell, rent, or trade your personal or medical data to third parties. We may share information only in the following circumstances:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>With Your Clinic/Doctor:</strong> Patient data is accessible to the healthcare providers and authorized staff within the same clinic or practice.</li>
              <li><strong>Service Providers:</strong> We work with trusted partners (e.g., cloud hosting, email services) who process data on our behalf under strict confidentiality agreements.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred with prior notice.</li>
            </ul>
          </section>

          {/* 5. Data Retention */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Server className="h-5 w-5 text-cyan-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">5. Data Retention</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>Account Data:</strong> Retained for the duration of your active account and for up to 90 days after account deletion.</li>
              <li><strong>Medical Records:</strong> Retained in accordance with applicable healthcare regulations and the data retention policies of the clinic or doctor.</li>
              <li><strong>Financial Records:</strong> Retained for a minimum of 7 years to comply with tax and regulatory requirements.</li>
              <li><strong>Activity Logs:</strong> Retained for 12 months for security and audit purposes.</li>
            </ul>
          </section>

          {/* 6. Your Rights */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">6. Your Rights</h2>
            </div>
            <p className="text-muted-foreground">Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong>Data Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> Object to the processing of your data for specific purposes.</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="text-muted-foreground">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:hello@zonoir.com" className="text-primary hover:underline">
                hello@zonoir.com
              </a>.
            </p>
          </section>

          {/* 7. Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our Platform is designed for use by healthcare professionals and their authorized staff.
              We do not knowingly collect personal information directly from individuals under the age
              of 18. Pediatric patient records are managed exclusively by authorized healthcare
              providers in compliance with applicable laws.
            </p>
          </section>

          {/* 8. Changes to This Policy */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">8. Changes to This Policy</h2>
            </div>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. When we make significant changes,
              we will notify registered users via email or an in-app notification. The "Last updated"
              date at the top of this page reflects the most recent revision. Continued use of the
              Platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 9. Contact Us */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-rose-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">9. Contact Us</h2>
            </div>
            <p className="text-muted-foreground">
              If you have any questions, concerns, or requests regarding this Privacy Policy or how we
              handle your data, please contact us:
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

export default PrivacyPolicy;
