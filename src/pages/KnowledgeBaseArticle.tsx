import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Mail,
  Shield,
  Smartphone,
  User,
  ChevronRight,
  Lightbulb,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  BookOpen
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const ClinicSignupArticle = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />
      
      {/* Breadcrumb & Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/knowledge-base" className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/knowledge-base" className="hover:text-foreground transition-colors">Getting Started</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">How to Sign Up Your Clinic</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/knowledge-base">
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          {/* Article Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                <Building2 className="w-3 h-3 mr-1" />
                For Clinics
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                5 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              How to Sign Up Your Clinic
            </h1>
            <p className="text-xl text-muted-foreground">
              Complete guide to registering your clinic on our platform and getting started 
              with patient management, appointments, and more.
            </p>
          </div>

          {/* Quick Overview */}
          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Create your clinic account",
                  "Complete clinic profile setup",
                  "Add your first doctors",
                  "Understand the approval process"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            
            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Visit the Registration Page</h2>
                  <p className="text-muted-foreground m-0">Start your clinic registration journey</p>
                </div>
              </div>
              
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="bg-muted rounded-xl p-8 text-center mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-background rounded-xl flex items-center justify-center shadow-lg">
                          <Building2 className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Registration Form Preview</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm text-center">
                    Navigate to the homepage and click on "Register as Clinic" button
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <p>
                  To begin registering your clinic, navigate to our homepage and look for the 
                  <strong> "Register as Clinic"</strong> button in the header or the main call-to-action section.
                </p>
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm m-0">
                    <strong>Pro Tip:</strong> Make sure you have your clinic's official details ready, 
                    including the clinic name, address, and contact information before starting.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Fill in Your Details</h2>
                  <p className="text-muted-foreground m-0">Provide accurate clinic information</p>
                </div>
              </div>

              <p className="mb-6">
                Complete the registration form with the following required information:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: User, label: "Owner's Full Name", desc: "Name of the clinic owner/manager" },
                  { icon: Building2, label: "Clinic Name", desc: "Official registered name" },
                  { icon: Mail, label: "Email Address", desc: "For account verification" },
                  { icon: Smartphone, label: "Phone Number", desc: "Primary contact number" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{item.label}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-3">
                <p>Additional information you'll need to provide:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>City:</strong> Select your clinic's city from the dropdown</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Complete Address:</strong> Full street address with landmarks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Number of Doctors:</strong> How many doctors will use the system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Password:</strong> Create a secure password (min. 8 characters)</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Submit & Await Approval</h2>
                  <p className="text-muted-foreground m-0">Our team will review your application</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-6">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm m-0 font-medium">Security & Verification</p>
                  <p className="text-sm m-0 text-muted-foreground">
                    All clinic registrations are reviewed by our team to ensure authenticity 
                    and protect the integrity of our healthcare network.
                  </p>
                </div>
              </div>

              <p>
                After submitting your registration:
              </p>
              
              <div className="relative pl-8 space-y-6 my-6">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
                
                {[
                  { title: "Application Received", desc: "You'll receive a confirmation email" },
                  { title: "Review Process", desc: "Our team verifies your clinic details (24-48 hours)" },
                  { title: "Approval Notification", desc: "Email sent with login credentials" },
                  { title: "Access Dashboard", desc: "Start managing your clinic!" },
                ].map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Start Using Your Dashboard</h2>
                  <p className="text-muted-foreground m-0">You're all set to manage your clinic!</p>
                </div>
              </div>

              <p className="mb-6">
                Once approved, log in to access your clinic dashboard where you can:
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Add doctors to your clinic",
                  "Manage patient records",
                  "Schedule appointments",
                  "Track finances",
                  "Add receptionists",
                  "Generate reports",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Note */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Important Notes</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Monthly fees apply based on the number of doctors in your clinic</li>
                      <li>• Ensure all information provided is accurate to avoid delays</li>
                      <li>• Contact support if you don't receive approval within 48 hours</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Feedback Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Was this article helpful?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Yes, it helped
                </Button>
                <Button variant="outline" className="gap-2">
                  <ThumbsDown className="w-4 h-4" />
                  No, I need more help
                </Button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "How to Sign Up as a Single Doctor", slug: "doctor-signup" },
                { title: "Adding Doctors to Your Clinic", slug: "add-doctors" },
              ].map((article, idx) => (
                <Link key={idx} to={`/knowledge-base/${article.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4 flex items-center justify-between">
                      <span className="text-sm font-medium">{article.title}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

const DoctorSignupArticle = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />
      
      {/* Breadcrumb & Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/knowledge-base" className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/knowledge-base" className="hover:text-foreground transition-colors">Getting Started</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">How to Sign Up as a Single Doctor</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/knowledge-base">
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          {/* Article Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                <User className="w-3 h-3 mr-1" />
                For Doctors
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                4 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              How to Sign Up as a Single Doctor
            </h1>
            <p className="text-xl text-muted-foreground">
              Complete guide for independent doctors to register on the platform and start 
              managing patients, appointments, and practice operations.
            </p>
          </div>

          {/* Quick Overview */}
          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Create your doctor account",
                  "Complete your professional profile",
                  "Set up your schedule",
                  "Start accepting patients"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            
            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Visit the Doctor Registration Page</h2>
                  <p className="text-muted-foreground m-0">Begin your independent practice journey</p>
                </div>
              </div>
              
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="bg-muted rounded-xl p-8 text-center mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-background rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">Doctor Registration Form</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm text-center">
                    Navigate to the homepage and click on "Register as Doctor" button
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <p>
                  To begin registering as a single doctor, navigate to our homepage and look for the 
                  <strong> "Register as Doctor"</strong> button in the header or the main call-to-action section.
                </p>
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm m-0">
                    <strong>Pro Tip:</strong> Have your PMDC registration number and qualifications 
                    ready before starting the registration process.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Complete Your Professional Profile</h2>
                  <p className="text-muted-foreground m-0">Provide your medical credentials</p>
                </div>
              </div>

              <p className="mb-6">
                Complete the registration form with the following required information:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: User, label: "Full Name", desc: "Your complete legal name" },
                  { icon: Mail, label: "Email Address", desc: "For account verification & login" },
                  { icon: Smartphone, label: "Contact Number", desc: "Your professional contact" },
                  { icon: Shield, label: "PMDC Number", desc: "Pakistan Medical & Dental Council ID" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{item.label}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-3">
                <p>Additional information you'll need to provide:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Specialization:</strong> Your area of medical expertise</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Qualification:</strong> Your medical degree (MBBS, MD, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Experience:</strong> Years of professional experience</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>City:</strong> Your practice location</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Consultation Fee:</strong> Your standard appointment fee</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Submit & Await Verification</h2>
                  <p className="text-muted-foreground m-0">Your credentials will be verified</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-6">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm m-0 font-medium">Credential Verification</p>
                  <p className="text-sm m-0 text-muted-foreground">
                    We verify all PMDC registrations to ensure patient safety and maintain 
                    the highest standards of medical practice.
                  </p>
                </div>
              </div>

              <p>
                After submitting your registration:
              </p>
              
              <div className="relative pl-8 space-y-6 my-6">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
                
                {[
                  { title: "Application Received", desc: "You'll receive a confirmation email instantly" },
                  { title: "PMDC Verification", desc: "We verify your medical credentials (24-48 hours)" },
                  { title: "Account Activated", desc: "Email notification with your login details" },
                  { title: "Start Practicing", desc: "Access your dashboard and begin!" },
                ].map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Set Up Your Practice</h2>
                  <p className="text-muted-foreground m-0">Configure your schedule and preferences</p>
                </div>
              </div>

              <p className="mb-6">
                Once approved, log in to access your doctor dashboard where you can:
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Set your weekly schedule",
                  "Manage patient records",
                  "Schedule appointments",
                  "Create prescription templates",
                  "Track your finances",
                  "Generate medical reports",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 mb-8">
              <CardContent className="py-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Benefits of Single Doctor Registration
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Complete control over your practice
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    No clinic management overhead
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Direct patient communication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Flexible scheduling options
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Important Notes</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Valid PMDC registration is mandatory for verification</li>
                      <li>• Monthly subscription fees apply after the trial period</li>
                      <li>• You can later join a clinic if you wish to work under one</li>
                      <li>• Contact support if verification takes longer than 48 hours</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Feedback Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Was this article helpful?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Yes, it helped
                </Button>
                <Button variant="outline" className="gap-2">
                  <ThumbsDown className="w-4 h-4" />
                  No, I need more help
                </Button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "How to Sign Up Your Clinic", slug: "clinic-signup" },
                { title: "Setting Up Your Schedule", slug: "schedule-setup" },
              ].map((article, idx) => (
                <Link key={idx} to={`/knowledge-base/${article.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4 flex items-center justify-between">
                      <span className="text-sm font-medium">{article.title}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

const KnowledgeBaseArticle = () => {
  const { slug } = useParams();

  if (slug === "clinic-signup") {
    return <ClinicSignupArticle />;
  }

  if (slug === "doctor-signup") {
    return <DoctorSignupArticle />;
  }

  // Placeholder for other articles
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Coming Soon</h1>
        <p className="text-muted-foreground mb-6">This article is currently being written. Check back soon!</p>
        <Link to="/knowledge-base">
          <Button>Back to Knowledge Base</Button>
        </Link>
      </div>
      <PublicFooter />
    </div>
  );
};

export default KnowledgeBaseArticle;
