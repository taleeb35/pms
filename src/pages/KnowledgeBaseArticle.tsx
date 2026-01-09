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
  BookOpen,
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  BarChart3,
  UserPlus,
  ClipboardList,
  HeadphonesIcon,
  Stethoscope
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

const DashboardOverviewArticle = () => {
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
            <span className="text-foreground">Understanding Your Dashboard</span>
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
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                <LayoutDashboard className="w-3 h-3 mr-1" />
                Getting Started
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                6 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Understanding Your Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive guide to navigating and utilizing your dashboard effectively. 
              Learn about key features, statistics, and quick actions available to you.
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
                  "Navigate your dashboard layout",
                  "Understand key statistics",
                  "Use quick action buttons",
                  "View analytics and activity logs"
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
            
            {/* Dashboard Types Overview */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Dashboard Types</h2>
                  <p className="text-muted-foreground m-0">Different dashboards for different roles</p>
                </div>
              </div>
              
              <p className="mb-6">
                Zonoir provides customized dashboards based on your user role. Each dashboard 
                is tailored to show the most relevant information and actions for your specific needs.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Building2, label: "Clinic Dashboard", desc: "For clinic owners and administrators", color: "bg-emerald-500/10 text-emerald-600" },
                  { icon: Stethoscope, label: "Doctor Dashboard", desc: "For individual doctors (single practice)", color: "bg-blue-500/10 text-blue-600" },
                  { icon: Users, label: "Receptionist Dashboard", desc: "For clinic receptionists", color: "bg-purple-500/10 text-purple-600" },
                  { icon: User, label: "Doctor Receptionist", desc: "For receptionists of single doctors", color: "bg-amber-500/10 text-amber-600" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                          <item.icon className="w-5 h-5" />
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
            </div>

            <Separator className="my-10" />

            {/* Key Statistics Section */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Key Statistics at a Glance</h2>
                  <p className="text-muted-foreground m-0">Important metrics displayed on your dashboard</p>
                </div>
              </div>

              <p className="mb-6">
                Your dashboard displays real-time statistics to help you monitor your practice's performance:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Users, label: "Total Patients", desc: "Complete count of registered patients in your practice" },
                  { icon: Calendar, label: "Today's Appointments", desc: "Number of appointments scheduled for today" },
                  { icon: ClipboardList, label: "Monthly Appointments", desc: "Total appointments for the current month" },
                  { icon: DollarSign, label: "Revenue Overview", desc: "Financial summary and payment tracking" },
                  { icon: Stethoscope, label: "Total Doctors", desc: "Number of doctors (for clinics)" },
                  { icon: Activity, label: "Waitlist Count", desc: "Patients currently on the waiting list" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-border/50 hover:shadow-md transition-shadow">
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

              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Pro Tip:</strong> Click on any statistic card to navigate directly to that section. 
                  For example, clicking on "Total Patients" takes you to the patients list.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Quick Actions */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Quick Actions</h2>
                  <p className="text-muted-foreground m-0">Common tasks at your fingertips</p>
                </div>
              </div>

              <p className="mb-6">
                The Quick Actions section provides one-click access to the most frequently used features:
              </p>

              <div className="space-y-4 mb-6">
                <h4 className="font-semibold">For Clinics:</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: UserPlus, label: "Add New Doctor", desc: "Register a new doctor to your clinic" },
                    { icon: HeadphonesIcon, label: "Contact Support", desc: "Get help from our support team" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{item.label}</span>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="font-semibold">For Doctors:</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: Calendar, label: "New Appointment", desc: "Schedule a new appointment" },
                    { icon: UserPlus, label: "Add Patient", desc: "Register a new patient" },
                    { icon: ClipboardList, label: "View Waitlist", desc: "Manage your waiting list" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{item.label}</span>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">For Receptionists:</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Zap, label: "Walk-In Appointment", desc: "Quick appointment for walk-in patients" },
                    { icon: Calendar, label: "View Appointments", desc: "See all scheduled appointments" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{item.label}</span>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Analytics Section */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Analytics & Charts</h2>
                  <p className="text-muted-foreground m-0">Visual insights into your practice</p>
                </div>
              </div>

              <p className="mb-6">
                Your dashboard includes powerful analytics to help you understand trends and make informed decisions:
              </p>

              <div className="space-y-3 mb-6">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Appointment Trends:</strong> View daily, weekly, or monthly appointment patterns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Patient Growth:</strong> Track how your patient base is growing over time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Revenue Analytics:</strong> Monitor financial performance and payment trends</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Appointment Status:</strong> See completion rates, cancellations, and no-shows</span>
                  </li>
                </ul>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="bg-muted rounded-xl p-8 text-center">
                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-background rounded-xl flex items-center justify-center shadow-lg">
                          <BarChart3 className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Analytics Charts Preview</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-10" />

            {/* Activity Logs */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  5
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Activity Logs</h2>
                  <p className="text-muted-foreground m-0">Track all actions in your practice</p>
                </div>
              </div>

              <p className="mb-6">
                The Activity Logs section keeps a record of all important actions taken within your practice. 
                This feature is available for clinic owners and single doctors.
              </p>

              <div className="space-y-3 mb-6">
                <h4 className="font-semibold">What gets logged:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Patient registration - See who added each patient</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Appointment creation - Track who scheduled appointments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Procedure assignments - Record of procedure additions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Discounts applied - Track all fee adjustments and discounts</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm m-0 font-medium">Transparency & Accountability</p>
                  <p className="text-sm m-0 text-muted-foreground">
                    Activity logs help maintain transparency and accountability across your team. 
                    You can always see who performed which action and when.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Trial & Subscription */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  6
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Trial Banner & Subscription</h2>
                  <p className="text-muted-foreground m-0">Manage your subscription status</p>
                </div>
              </div>

              <p className="mb-6">
                If you're on a trial period, you'll see a trial banner at the top of your dashboard 
                showing the remaining days. The banner helps you keep track of:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  "Days remaining in your trial",
                  "Trial expiration date",
                  "Quick access to subscription page",
                  "Current payment plan details"
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
                      <li>• Dashboard data refreshes automatically when you navigate to it</li>
                      <li>• Statistics are calculated in real-time from your actual data</li>
                      <li>• Some features may vary based on your subscription plan</li>
                      <li>• Contact support if you notice any discrepancies in your statistics</li>
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
                { title: "How to Sign Up as a Single Doctor", slug: "doctor-signup" },
                { title: "Managing Your Schedule", slug: "doctor-schedule" },
                { title: "Understanding Your Subscription", slug: "subscription" },
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

const AddDoctorsArticle = () => {
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
            <span className="text-foreground">Adding Doctors to Your Clinic</span>
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
                6 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Adding Doctors to Your Clinic
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn how to add and manage doctors in your clinic, assign permissions, 
              and get them started with patient management.
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
                  "Navigate to the Add Doctor section",
                  "Fill in doctor details correctly",
                  "Understand doctor limits and plans",
                  "Manage doctor accounts and statuses"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="mb-10 border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Before You Begin</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your clinic account must be approved by the admin</li>
                    <li>• You need to be logged in as a clinic owner</li>
                    <li>• Have doctor's details ready (name, email, qualifications, etc.)</li>
                    <li>• Ensure you have available doctor slots in your subscription</li>
                  </ul>
                </div>
              </div>
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
                  <h2 className="text-2xl font-bold m-0">Access the Doctors Section</h2>
                  <p className="text-muted-foreground m-0">Navigate to doctor management</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p>
                  From your clinic dashboard, locate the <strong>"Doctors"</strong> option in the 
                  left sidebar menu. Click on it to access the doctors management section.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Doctors Menu</h4>
                          <p className="text-xs text-muted-foreground">View and manage all doctors</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <UserPlus className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Add Doctor Button</h4>
                          <p className="text-xs text-muted-foreground">Located at top right of page</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <p>
                  Once in the Doctors section, click the <strong>"Add Doctor"</strong> button 
                  located at the top right corner of the page to open the doctor registration form.
                </p>
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
                  <h2 className="text-2xl font-bold m-0">Fill in Doctor Details</h2>
                  <p className="text-muted-foreground m-0">Provide complete doctor information</p>
                </div>
              </div>

              <p className="mb-6">
                Complete the doctor registration form with the following required information:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: User, label: "Full Name", desc: "Doctor's complete name" },
                  { icon: Mail, label: "Email Address", desc: "For login credentials" },
                  { icon: Smartphone, label: "Contact Number", desc: "Phone number for contact" },
                  { icon: Shield, label: "PMDC Number", desc: "Medical registration number" },
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
                    <span><strong>Specialization:</strong> Doctor's area of expertise (e.g., Cardiologist, Dermatologist)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Qualification:</strong> Educational qualifications (MBBS, FCPS, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Consultation Fee:</strong> Default fee for patient consultations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Clinic Percentage:</strong> Revenue share percentage (if applicable)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span><strong>Password:</strong> Create a secure password for the doctor's account</span>
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
                  <h2 className="text-2xl font-bold m-0">Understanding Doctor Limits</h2>
                  <p className="text-muted-foreground m-0">Know your subscription capacity</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-6">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm m-0 font-medium">Doctor Limits</p>
                  <p className="text-sm m-0 text-muted-foreground">
                    Your clinic has a maximum number of doctors based on your subscription plan. 
                    You specified this number during registration.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  When you registered your clinic, you specified the number of doctors you need. 
                  This is your <strong>requested doctor limit</strong>. Here's what you need to know:
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Current Doctors
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Shows how many doctors are currently added to your clinic
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Requested Limit
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Maximum doctors allowed in your subscription
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm m-0">
                    <strong>Need more doctors?</strong> If you need to add more doctors than your 
                    current limit allows, contact the admin to request an increase in your doctor limit.
                  </p>
                </div>
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
                  <h2 className="text-2xl font-bold m-0">Submit & Doctor Access</h2>
                  <p className="text-muted-foreground m-0">What happens after adding a doctor</p>
                </div>
              </div>

              <p>
                After submitting the doctor registration form:
              </p>
              
              <div className="relative pl-8 space-y-6 my-6">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
                
                {[
                  { title: "Doctor Account Created", desc: "System creates login credentials" },
                  { title: "Appears in Doctors List", desc: "Doctor shows in your clinic's doctor list" },
                  { title: "Doctor Can Login", desc: "Doctor uses email and password to access their dashboard" },
                  { title: "Start Managing Patients", desc: "Doctor can begin scheduling and seeing patients" },
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

            {/* Step 5 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  5
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Managing Doctor Accounts</h2>
                  <p className="text-muted-foreground m-0">Edit, delete, or manage doctors</p>
                </div>
              </div>

              <p className="mb-6">
                Once doctors are added, you can manage their accounts from the Doctors list:
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: ClipboardList, label: "View Details", desc: "See complete doctor information" },
                  { icon: Calendar, label: "Manage Schedule", desc: "Set available days and hours" },
                  { icon: Users, label: "View Patients", desc: "See doctor's patient list" },
                  { icon: DollarSign, label: "Track Earnings", desc: "Monitor consultation revenue" },
                  { icon: Activity, label: "Activity Logs", desc: "View doctor's activity history" },
                  { icon: Shield, label: "Delete Account", desc: "Remove doctor from clinic" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-xs">{item.label}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                      <li>• Each doctor email must be unique and not used by another account</li>
                      <li>• Doctors can only be associated with one clinic at a time</li>
                      <li>• Deleting a doctor does NOT free up your doctor limit slot</li>
                      <li>• Doctor schedules must be set before they can receive appointments</li>
                      <li>• Make sure to share login credentials securely with the doctor</li>
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
                { title: "Understanding Your Dashboard", slug: "dashboard-overview" },
                { title: "Managing Doctor Schedules", slug: "doctor-schedule" },
                { title: "Managing Receptionists", slug: "manage-receptionists" },
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

  if (slug === "dashboard-overview") {
    return <DashboardOverviewArticle />;
  }

  if (slug === "add-doctors") {
    return <AddDoctorsArticle />;
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
