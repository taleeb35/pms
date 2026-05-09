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
  Stethoscope,
  Briefcase,
  AlertTriangle,
  Search,
  CalendarDays,
  Coffee,
  Plane,
  Save
} from "lucide-react";
import { KBHeader as PublicHeader, KBFooter as PublicFooter, useKBBase } from "@/contexts/KnowledgeBaseContext";
import { useSEO } from "@/hooks/useSEO";


const ClinicSignupArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />
      
      {/* Breadcrumb & Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">Getting Started</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">How to Sign Up Your Clinic</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to={kbBase}>
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
                  "Get started instantly — no approval needed"
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
                  <h2 className="text-2xl font-bold m-0">Submit & Get Started Instantly</h2>
                  <p className="text-muted-foreground m-0">No review process — you can start using your account right away</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm m-0 font-medium">Instant Access</p>
                  <p className="text-sm m-0 text-muted-foreground">
                    There is no manual review or approval process for clinic signups.
                    As soon as you complete registration, your clinic account is active and ready to use.
                  </p>
                </div>
              </div>

              <p>
                After submitting your registration:
              </p>
              
              <div className="relative pl-8 space-y-6 my-6">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
                
                {[
                  { title: "Account Created", desc: "Your clinic account is created instantly" },
                  { title: "Confirmation Email", desc: "You'll receive a welcome email with login details" },
                  { title: "Login to Dashboard", desc: "Sign in immediately — no waiting required" },
                  { title: "Start Adding Doctors", desc: "Begin adding doctors and managing your clinic right away" },
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
                Log in right after signup to access your clinic dashboard where you can:
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
                      <li>• Ensure all information provided is accurate for your records and invoicing</li>
                      <li>• Your account is active immediately — start adding doctors right after signup</li>
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
                { title: "How to Add Doctors in Your Clinic", slug: "add-doctors" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />
      
      {/* Breadcrumb & Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">Getting Started</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">How to Sign Up as a Single Doctor</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to={kbBase}>
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
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />
      
      {/* Breadcrumb & Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">Getting Started</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Understanding Your Dashboard</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to={kbBase}>
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
                { title: "How to Add Doctors in Your Clinic", slug: "add-doctors" },
                { title: "Managing Your Schedule", slug: "doctor-schedule" },
                { title: "Understanding Your Subscription", slug: "subscription" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />
      
      {/* Breadcrumb & Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">Getting Started</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">How to Add Doctors in Your Clinic</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to={kbBase}>
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
              How to Add Doctors in Your Clinic
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
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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

const slugTitleMap: Record<string, string> = {
  "clinic-signup": "How to Sign Up Your Clinic",
  "doctor-signup": "How to Sign Up as a Doctor",
  "dashboard-overview": "Understanding Your Dashboard",
  "add-doctors": "How to Add Doctors in Your Clinic",
  "manage-receptionists": "Managing Receptionists",
  "add-patients": "Adding New Patients",
  "medical-records": "Managing Medical Records",
  "patient-history": "Patient History & Documents",
  "book-appointments": "Booking Appointments",
  "setup-specializations": "Setting Up Specializations",
  "specializations": "Setting Up Specializations",
  "doctor-schedule": "Managing Your Schedule",
  "manage-schedule": "Managing Your Schedule",
  "prescription-templates": "Creating Prescription Templates",
  "visit-records": "Recording Patient Visits",
};

const KnowledgeBaseArticle = () => {
  const kbBase = useKBBase();
  const { slug } = useParams();

  const articleTitle = slug ? slugTitleMap[slug] : undefined;
  useSEO({
    title: articleTitle
      ? `${articleTitle} — Knowledge Base | Zonoir`
      : "Knowledge Base Article | Zonoir",
    description: articleTitle
      ? `${articleTitle} — step-by-step guide on the Zonoir help center for clinics, doctors, and receptionists.`
      : "Step-by-step guides and tutorials for using Zonoir clinic management software.",
    canonicalUrl: `https://zonoir.com/knowledge-base/${slug ?? ""}`,
    ogUrl: `https://zonoir.com/knowledge-base/${slug ?? ""}`,
    ogType: "article",
    breadcrumbs: [
      { name: "Home", url: "https://zonoir.com/" },
      { name: "Knowledge Base", url: "https://zonoir.com/knowledge-base" },
      ...(articleTitle
        ? [{ name: articleTitle, url: `https://zonoir.com/knowledge-base/${slug}` }]
        : []),
    ],
    jsonLd: articleTitle
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: articleTitle,
          author: { "@type": "Organization", name: "Zonoir" },
          publisher: {
            "@type": "Organization",
            name: "Zonoir",
            logo: {
              "@type": "ImageObject",
              url: "https://zonoir.com/favicon.png",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://zonoir.com/knowledge-base/${slug}`,
          },
        }
      : undefined,
  });

  if (slug === "clinic-signup") {
    return <ClinicSignupArticle />;
  }

  if (slug === "doctor-signup") {
    return <AddDoctorsArticle />;
  }

  if (slug === "dashboard-overview") {
    return <DashboardOverviewArticle />;
  }

  if (slug === "add-doctors") {
    return <AddDoctorsArticle />;
  }

  if (slug === "manage-receptionists") {
    return <ManageReceptionistsArticle />;
  }

  if (slug === "add-patients") {
    return <AddPatientsArticle />;
  }

  if (slug === "medical-records") {
    return <MedicalRecordsArticle />;
  }

  if (slug === "patient-history") {
    return <PatientHistoryArticle />;
  }

  if (slug === "book-appointments") {
    return <BookAppointmentsArticle />;
  }

  if (slug === "setup-specializations" || slug === "specializations") {
    return <SetupSpecializationsArticle />;
  }

  if (slug === "doctor-schedule" || slug === "manage-schedule" || slug === "schedule") {
    return <DoctorScheduleArticle />;
  }

  if (slug === "prescription-templates") {
    return <PrescriptionTemplatesArticle />;
  }

  if (slug === "visit-records" || slug === "recording-visits") {
    return <VisitRecordsArticle />;
  }

  // Placeholder for other articles
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Coming Soon</h1>
        <p className="text-muted-foreground mb-6">This article is currently being written. Check back soon!</p>
        <Link to={kbBase}>
          <Button>Back to Knowledge Base</Button>
        </Link>
      </div>
      <PublicFooter />
    </div>
  );
};

const ManageReceptionistsArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />
      
      {/* Breadcrumb & Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">For Clinics</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Managing Receptionists</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to={kbBase}>
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
              Managing Receptionists
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn how to add, manage, and control access for receptionists in your clinic. 
              Receptionists act as Personal Assistants with full clinic management capabilities.
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
                  "Add new receptionists to your clinic",
                  "Understand receptionist permissions",
                  "Activate and deactivate accounts",
                  "Manage receptionist access levels"
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
            
            {/* Introduction */}
            <div className="mb-12">
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-6">
                <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm m-0 font-medium">Receptionists as Personal Assistants</p>
                  <p className="text-sm m-0 text-muted-foreground">
                    Receptionists in your clinic have the same access permissions as clinic owners. 
                    They can manage patients, appointments, walk-ins, view analytics, access finance, 
                    and perform all clinic management tasks.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Navigate to Receptionists</h2>
                  <p className="text-muted-foreground m-0">Access the receptionists management page</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <p>
                  From your clinic dashboard sidebar, click on <strong>"Receptionists"</strong> to 
                  access the receptionist management page. Here you'll see a list of all receptionists 
                  associated with your clinic.
                </p>
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm m-0">
                    <strong>Pro Tip:</strong> The receptionists page shows each receptionist's name, 
                    email, status (active/draft), and the date they were added.
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
                  <h2 className="text-2xl font-bold m-0">Add a New Receptionist</h2>
                  <p className="text-muted-foreground m-0">Create an account for your clinic staff</p>
                </div>
              </div>

              <p className="mb-6">
                Click the <strong>"Add Receptionist"</strong> button to open the registration form. 
                Fill in the following required information:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: User, label: "Full Name", desc: "Receptionist's complete name" },
                  { icon: Mail, label: "Email Address", desc: "For login credentials" },
                  { icon: Smartphone, label: "Phone Number", desc: "Contact number" },
                  { icon: Shield, label: "Password", desc: "Secure login password" },
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

              <p>
                Once submitted, the receptionist account is created and they can immediately 
                log in using their email and password at the <strong>Receptionist Login</strong> page.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Receptionist Permissions</h2>
                  <p className="text-muted-foreground m-0">Full Personal Assistant capabilities</p>
                </div>
              </div>

              <p className="mb-6">
                Receptionists have identical access to clinic owners, allowing them to fully 
                manage day-to-day clinic operations:
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Users, label: "Manage Patients", desc: "Add, edit, view patient records" },
                  { icon: Calendar, label: "Appointments", desc: "Schedule and manage bookings" },
                  { icon: ClipboardList, label: "Walk-In Patients", desc: "Handle walk-in registrations" },
                  { icon: Stethoscope, label: "View Doctors", desc: "Access doctor information" },
                  { icon: DollarSign, label: "Finance Access", desc: "View financial reports" },
                  { icon: BarChart3, label: "Analytics", desc: "View clinic statistics" },
                ].map((feature, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <feature.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{feature.label}</h4>
                          <p className="text-xs text-muted-foreground">{feature.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Data Isolation:</strong> Receptionists can only access data for your specific 
                  clinic. They cannot see information from other clinics on the platform.
                </p>
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
                  <h2 className="text-2xl font-bold m-0">Activate & Deactivate Accounts</h2>
                  <p className="text-muted-foreground m-0">Control receptionist access</p>
                </div>
              </div>

              <p className="mb-6">
                You can control whether a receptionist can access the system by changing their 
                account status:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-emerald-700">Active Status</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receptionist can log in and access all clinic features. This is the 
                      default status for new accounts.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-amber-700">Draft Status</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receptionist cannot log in. They'll see an "Account Not Active" message 
                      if they attempt to access the system.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <p>To change a receptionist's status:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Go to the Receptionists page</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Find the receptionist in the list</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Use the status dropdown to select "Active" or "Draft"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Changes take effect immediately</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-6">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Use Case:</strong> Set a receptionist to "Draft" status if they're 
                  on leave or you want to temporarily restrict their access without deleting their account.
                </p>
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
                  <h2 className="text-2xl font-bold m-0">Receptionist Login Process</h2>
                  <p className="text-muted-foreground m-0">How receptionists access the system</p>
                </div>
              </div>

              <div className="relative pl-8 space-y-6 my-6">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
                
                {[
                  { title: "Visit Login Page", desc: "Receptionist navigates to the dedicated login page" },
                  { title: "Enter Credentials", desc: "Email and password provided by clinic owner" },
                  { title: "Account Verification", desc: "System checks if account status is 'Active'" },
                  { title: "Access Dashboard", desc: "If active, redirected to receptionist dashboard" },
                ].map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
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
                      <li>• Receptionists have full access to clinic data - add only trusted staff</li>
                      <li>• Each receptionist has their own login credentials</li>
                      <li>• Deactivated accounts retain their data and can be reactivated anytime</li>
                      <li>• Activity logs track all actions performed by receptionists</li>
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
                { title: "How to Add Doctors in Your Clinic", slug: "add-doctors" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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

export default KnowledgeBaseArticle;

const AddPatientsArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">Patient Management</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Adding New Patients</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Link to={kbBase}>
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                <Users className="w-3 h-3 mr-1" />
                Patient Management
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                6 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Adding New Patients
            </h1>
            <p className="text-xl text-muted-foreground">
              A complete guide to registering new patients, capturing their details, and getting them
              ready for appointments and visit records.
            </p>
          </div>

          {/* What you'll learn */}
          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Where to find the Add Patient option",
                  "Required vs optional patient fields",
                  "Adding allergies, diseases & medical history",
                  "Linking patients to appointments instantly",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Before you begin */}
          <Card className="mb-10 border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Before You Begin</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You must be logged in as a Clinic, Doctor, or Receptionist</li>
                    <li>• Have the patient's basic details ready (name & contact number)</li>
                    <li>• Optionally collect medical history, allergies and CNIC for completeness</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <article className="prose prose-lg max-w-none">
            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the Patients Section</h2>
                  <p className="text-muted-foreground m-0">Navigate from the sidebar</p>
                </div>
              </div>
              <p>
                From your dashboard, click <strong>"Patients"</strong> in the left sidebar under the
                <em> Patient Care</em> group. Then click the <strong>"Add Patient"</strong> button at the
                top right of the page to open the registration form.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Card className="border-border/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Patients Menu</h4>
                        <p className="text-xs text-muted-foreground">View & search all patients</p>
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
                        <h4 className="font-medium text-sm">Add Patient Button</h4>
                        <p className="text-xs text-muted-foreground">Top-right corner of the list</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  <h2 className="text-2xl font-bold m-0">Fill in Required Details</h2>
                  <p className="text-muted-foreground m-0">Only two fields are mandatory</p>
                </div>
              </div>
              <p>
                To keep registration fast at the front desk, only two fields are required. You can
                always edit and complete the rest later from the patient's detail page.
              </p>
              <div className="grid md:grid-cols-2 gap-4 my-6">
                {[
                  { icon: User, label: "Full Name", desc: "Patient's complete name" },
                  { icon: Smartphone, label: "Contact Number", desc: "Used for reminders & search" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{item.label} <Badge variant="outline" className="ml-1 text-[10px]">Required</Badge></h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  <h2 className="text-2xl font-bold m-0">Add Optional Information</h2>
                  <p className="text-muted-foreground m-0">Build a richer patient profile</p>
                </div>
              </div>
              <p>The form also lets you capture additional information that improves clinical care:</p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-1" /><span><strong>Date of Birth & Gender</strong> — used for age-aware records and Gynaecology workflows</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-1" /><span><strong>CNIC / ID Number</strong> — useful for verification and avoiding duplicates</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-1" /><span><strong>Address & City</strong> — for follow-ups and demographics</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-1" /><span><strong>Emergency Contact</strong> — name & number of next of kin</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-1" /><span><strong>Allergies & Existing Diseases</strong> — selected from your clinic's master list</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-1" /><span><strong>Notes</strong> — any free-text remarks for the doctor</span></li>
              </ul>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mt-6">
                <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Tip:</strong> Email and Blood Group are intentionally not used as filters in
                  patient listings — focus on Name, Contact and CNIC for fast lookup.
                </p>
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
                  <h2 className="text-2xl font-bold m-0">Save & Next Steps</h2>
                  <p className="text-muted-foreground m-0">What happens after you click Save</p>
                </div>
              </div>
              <div className="relative pl-8 space-y-6 my-6">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
                {[
                  { title: "Patient Created Instantly", desc: "Record is saved to your clinic and appears in the Patients list" },
                  { title: "Searchable Everywhere", desc: "Patient can be selected when booking appointments or walk-ins" },
                  { title: "Open Patient Profile", desc: "Add documents, prescriptions, visit records and pregnancy details" },
                  { title: "Book First Appointment", desc: "Click 'Book Appointment' from the patient page to schedule a 15-min slot" },
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

            {/* Step 5 - Bulk import */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  5
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Importing Patients in Bulk</h2>
                  <p className="text-muted-foreground m-0">Migrating from another system?</p>
                </div>
              </div>
              <p>
                If you already have a patient database, use the <strong>Import</strong> button on the
                Patients page to upload a CSV file. Download the sample template first to make sure
                your columns match — at minimum you need <em>Name</em> and <em>Contact Number</em>.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Heads up:</strong> Duplicate contact numbers will be flagged during import so
                  you don't end up with multiple records for the same patient.
                </p>
              </div>
            </div>

            {/* Was this helpful */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mt-12">
              <CardContent className="py-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-primary" />
                  Was this article helpful?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Let us know so we can keep improving the knowledge base.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2"><ThumbsUp className="w-4 h-4" /> Yes</Button>
                  <Button variant="outline" size="sm" className="gap-2"><ThumbsDown className="w-4 h-4" /> No</Button>
                </div>
              </CardContent>
            </Card>

            {/* Related */}
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Related Articles
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Managing Medical Records", slug: "medical-records" },
                  { title: "Patient History & Documents", slug: "patient-history" },
                  { title: "Booking Appointments", slug: "book-appointments" },
                  { title: "How to Add Doctors in Your Clinic", slug: "add-doctors" },
                ].map((article, idx) => (
                  <Link key={idx} to={`${kbBase}/${article.slug}`}>
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
          </article>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};


const MedicalRecordsArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">Patient Management</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Managing Medical Records</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Link to={kbBase}>
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                <Users className="w-3 h-3 mr-1" />
                Patient Management
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                7 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Managing Medical Records
            </h1>
            <p className="text-xl text-muted-foreground">
              A complete guide to creating, updating, and organizing patient medical records
              securely on the platform — from visit notes and prescriptions to allergies, diseases,
              and uploaded documents.
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Open a patient's medical record",
                  "Record visits with diagnosis & prescriptions",
                  "Track allergies, diseases & ICD codes",
                  "Upload lab reports and documents",
                  "View complete patient timeline & history",
                  "Export and print medical records",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <article className="prose prose-lg max-w-none">

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">1</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open a Patient Record</h2>
                  <p className="text-muted-foreground m-0">Find any patient and access their full chart</p>
                </div>
              </div>
              <p>
                Go to the <strong>Patients</strong> section from the sidebar. Use the search bar to find
                a patient by name, phone number, or MRN. Click the patient row to open their full
                medical record — this is the central place where all clinical data lives.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Tip:</strong> If the patient doesn't exist yet, create them first using
                  "Add New Patient". Every visit and document must be linked to a patient profile.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">2</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Record a Visit</h2>
                  <p className="text-muted-foreground m-0">Capture diagnosis, prescription & follow-up</p>
                </div>
              </div>
              <p>
                Inside the patient profile, click <strong>"New Visit"</strong> (or open an existing
                appointment to record its visit). The visit form lets you capture everything that
                happened during the consultation:
              </p>
              <div className="grid md:grid-cols-2 gap-4 my-6">
                {[
                  { icon: Stethoscope, label: "Chief Complaint", desc: "Reason for the visit" },
                  { icon: Activity, label: "Vitals", desc: "BP, pulse, weight, temperature" },
                  { icon: ClipboardList, label: "Diagnosis", desc: "Use ICD codes or free text" },
                  { icon: FileText, label: "Prescription", desc: "Medicines, dosage & duration" },
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
              <p>
                Save the visit to add it to the patient's permanent history. You can also schedule a
                follow-up appointment directly from the visit form.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">3</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Track Allergies & Chronic Diseases</h2>
                  <p className="text-muted-foreground m-0">Critical safety information visible on every visit</p>
                </div>
              </div>
              <p>
                In the patient record, use the <strong>Allergies</strong> and <strong>Diseases</strong>
                tabs to maintain an up-to-date list. These appear as visible alerts on every future
                visit so doctors never miss critical safety information.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Add drug, food, or environmental allergies with severity</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Track chronic conditions (diabetes, hypertension, etc.)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Link diagnoses to standard ICD codes for reporting</li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">4</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Upload Documents & Reports</h2>
                  <p className="text-muted-foreground m-0">Lab results, scans, referral letters and more</p>
                </div>
              </div>
              <p>
                Open the <strong>Documents</strong> tab inside the patient record and click
                <strong> Upload</strong>. You can attach PDFs and images such as lab reports,
                X-rays, MRIs, prescriptions from other clinics, or insurance documents. Each file is
                stored securely and tagged to the patient for instant retrieval.
              </p>
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mt-4">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Secure by design:</strong> All medical records and documents are
                  encrypted and only accessible to authorized clinic staff.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 5 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">5</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">View Patient Timeline & History</h2>
                  <p className="text-muted-foreground m-0">A chronological view of every interaction</p>
                </div>
              </div>
              <p>
                The <strong>Timeline</strong> tab shows every visit, prescription, document upload,
                and appointment in chronological order. Use it to quickly review the patient's
                journey before a consultation, or to share a complete summary with another doctor.
              </p>
              <p>
                You can <strong>print or export</strong> any visit, prescription, or the full record
                as a PDF directly from the patient profile.
              </p>
            </div>

            {/* Best Practices */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Best Practices
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Update allergies and chronic diseases on every first visit</li>
                  <li>• Use ICD codes consistently for accurate analytics & reporting</li>
                  <li>• Upload lab reports immediately so they appear in the timeline</li>
                  <li>• Use prescription templates to save time on common diagnoses</li>
                  <li>• Always save the visit before closing — drafts are not part of the official record</li>
                </ul>
              </CardContent>
            </Card>
          </article>

          {/* Feedback */}
          <div className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Was this article helpful?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="gap-2"><ThumbsUp className="w-4 h-4" />Yes, it helped</Button>
                <Button variant="outline" className="gap-2"><ThumbsDown className="w-4 h-4" />No, I need more help</Button>
              </div>
            </div>
          </div>

          {/* Related */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Adding New Patients", slug: "add-patients" },
                { title: "Recording Patient Visits", slug: "visit-records" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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


const PatientHistoryArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">Patient Management</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Patient History & Documents</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Link to={kbBase}>
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                <Users className="w-3 h-3 mr-1" />
                Patient Management
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                8 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Patient History & Documents
            </h1>
            <p className="text-xl text-muted-foreground">
              Build a complete, longitudinal view of every patient — visits, prescriptions,
              vitals, allergies, lab reports and uploaded files — all in one secure place,
              accessible to authorized clinic staff in seconds.
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Open the full patient profile",
                  "Read the chronological visit timeline",
                  "Upload, preview & download documents",
                  "Organize lab reports, X-rays & PDFs",
                  "Share history securely with other doctors",
                  "Print or export the complete record",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <article className="prose prose-lg max-w-none">

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">1</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the Patient Profile</h2>
                  <p className="text-muted-foreground m-0">One screen for the entire medical journey</p>
                </div>
              </div>
              <p>
                From the sidebar go to <strong>Patients</strong>, search by name, phone or MRN,
                and click any row. The profile opens with the patient's demographics on top and
                tabs underneath for <strong>Overview, Visits, Prescriptions, Allergies,
                Diseases, Documents</strong> and <strong>Timeline</strong>. Receptionists,
                doctors and clinic owners all see the same record — exactly what they're
                permitted to see based on their role.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Tip:</strong> Critical alerts (allergies, chronic diseases,
                  pregnancy status) are pinned at the top of the profile so doctors see them
                  before starting any consultation.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">2</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Read the Visit Timeline</h2>
                  <p className="text-muted-foreground m-0">Every interaction in chronological order</p>
                </div>
              </div>
              <p>
                The <strong>Timeline</strong> tab gives you a vertical, date-sorted feed of
                everything that has happened with the patient — appointments booked, visits
                completed, prescriptions issued, documents uploaded, and follow-ups scheduled.
                Each entry expands to show full details (diagnosis, vitals, ICD codes,
                attending doctor) without leaving the page.
              </p>
              <div className="grid md:grid-cols-3 gap-4 my-6">
                {[
                  { icon: Calendar, label: "Appointments", desc: "Booked, completed, cancelled" },
                  { icon: Stethoscope, label: "Visits", desc: "Diagnosis, vitals, notes" },
                  { icon: FileText, label: "Documents", desc: "Lab reports, scans, PDFs" },
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
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">3</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Upload Documents</h2>
                  <p className="text-muted-foreground m-0">Lab reports, X-rays, referral letters & more</p>
                </div>
              </div>
              <p>
                Open the <strong>Documents</strong> tab and click <strong>Upload</strong>. You
                can drag-and-drop or browse to select files — PDFs, JPEGs and PNGs are all
                supported. Give each document a clear name and pick a type
                (<em>Lab Report, X-Ray, MRI, Prescription, Insurance, Other</em>) so it's easy
                to find later.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Multiple files can be uploaded in a single batch</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Each file is tagged to the patient and timestamped</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Preview PDFs and images directly in the browser</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> On mobile, capture documents with the native camera</li>
              </ul>
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mt-4">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Encrypted storage:</strong> All uploads are stored with AES-256
                  encryption and served through signed URLs — only authorized clinic staff
                  can open them.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">4</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Organize & Find Files Fast</h2>
                  <p className="text-muted-foreground m-0">Filter, sort and search across all documents</p>
                </div>
              </div>
              <p>
                As a patient's chart grows, use the controls inside the Documents tab to filter
                by <strong>type</strong> or <strong>date range</strong>, sort newest-first, and
                search by file name. Click the eye icon to preview, or download to share
                offline. Documents you no longer need can be removed by users with the right
                permissions.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 5 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">5</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Share History with Another Doctor</h2>
                  <p className="text-muted-foreground m-0">Print, export, or hand off the chart</p>
                </div>
              </div>
              <p>
                Need to refer the patient or send the file to a specialist? Use
                <strong> Print Report</strong> from the patient profile to generate a clean,
                clinic-branded PDF that includes demographics, allergies, chronic diseases, the
                visit timeline and a list of attached documents. You can also export individual
                visits or prescriptions one at a time.
              </p>
              <p>
                Within the same clinic, simply assign the next appointment to another doctor —
                they'll see the entire history the moment they open the patient.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 6 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">6</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Privacy, Roles & Audit Trail</h2>
                  <p className="text-muted-foreground m-0">Built for HIPAA & GDPR-aware clinics</p>
                </div>
              </div>
              <p>
                Patient history is only accessible to authenticated users belonging to the
                clinic that owns the record. Doctors see their own patients, receptionists
                see the clinic's patients, and clinic owners see everything. Every view,
                upload and deletion is recorded in the <strong>Activity Logs</strong> so you
                always know who touched a record and when.
              </p>
            </div>

            {/* Best Practices */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Best Practices
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Upload lab reports the same day they arrive so the timeline stays current</li>
                  <li>• Always pick the correct document type — it powers search & filters later</li>
                  <li>• Use clear file names like "CBC-Report-12-Apr-2026.pdf" instead of generic names</li>
                  <li>• Review allergies & chronic diseases before every consultation</li>
                  <li>• Export a PDF summary before referring a patient to another specialist</li>
                  <li>• Use Activity Logs to investigate any unexpected access to a record</li>
                </ul>
              </CardContent>
            </Card>
          </article>

          {/* Feedback */}
          <div className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Was this article helpful?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="gap-2"><ThumbsUp className="w-4 h-4" />Yes, it helped</Button>
                <Button variant="outline" className="gap-2"><ThumbsDown className="w-4 h-4" />No, I need more help</Button>
              </div>
            </div>
          </div>

          {/* Related */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Managing Medical Records", slug: "medical-records" },
                { title: "Adding New Patients", slug: "add-patients" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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


const BookAppointmentsArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">Appointments</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Booking Appointments</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Link to={kbBase}>
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20">
                <Calendar className="w-3 h-3 mr-1" />
                Appointments
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                8 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Booking Appointments
            </h1>
            <p className="text-xl text-muted-foreground">
              A step-by-step guide to booking, rescheduling and managing patient
              appointments — using the doctor's live schedule, 15-minute slots, and the
              full 4-status workflow built into the platform.
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Book appointments from any role",
                  "Pick the right doctor & 15-min slot",
                  "Handle returning vs new patients",
                  "Confirm, complete, cancel or no-show",
                  "Reschedule without losing history",
                  "Send reminders & view the calendar",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <article className="prose prose-lg max-w-none">

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">1</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the Appointments Screen</h2>
                  <p className="text-muted-foreground m-0">Same flow for clinic owners, receptionists & doctors</p>
                </div>
              </div>
              <p>
                From the sidebar click <strong>Appointments</strong> and then
                <strong> + New Appointment</strong>. Every role — Clinic Owner, Receptionist
                and Doctor — uses the same booking dialog. The list shows you a snapshot of
                today's appointments with quick filters for status, doctor and date range.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Tip:</strong> Need to register a walk-in instead? Use the
                  <strong> Walk-in</strong> screen — it skips slot selection and books
                  the patient into the next available time.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">2</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Select the Patient</h2>
                  <p className="text-muted-foreground m-0">Returning patient or instant new registration</p>
                </div>
              </div>
              <p>
                Start typing the patient's name or phone in the <strong>patient search</strong>.
                Matching records appear instantly so you can pick a returning patient with one
                click — their full history follows them into the appointment automatically.
              </p>
              <p>
                If the patient isn't in your system yet, click <strong>+ Add New Patient</strong>
                inline. Capture name, phone, gender and date of birth — that's enough to book.
                You can fill in the rest of the profile later from their patient page.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">3</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Pick Doctor, Date & 15-Minute Slot</h2>
                  <p className="text-muted-foreground m-0">Live availability — never double-book</p>
                </div>
              </div>
              <p>
                Choose the doctor and date. The platform reads the doctor's
                <strong> weekly schedule, break times and leaves</strong> and only shows
                <strong> available 15-minute slots</strong> for that day. Slots already taken
                are hidden, and the system blocks bookings that would clash with existing
                appointments.
              </p>
              <div className="grid md:grid-cols-3 gap-4 my-6">
                {[
                  { icon: Stethoscope, label: "Doctor", desc: "Pre-filtered by specialty" },
                  { icon: Calendar, label: "Date", desc: "Days off are disabled" },
                  { icon: Clock, label: "15-min Slot", desc: "Live, conflict-free" },
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
              <p>
                Add the <strong>reason for visit</strong> and (optionally) the consultation
                <strong> fee</strong> — the fee defaults to the doctor's standard charge but
                you can override it for follow-ups or discounts.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">4</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Confirm & Save</h2>
                  <p className="text-muted-foreground m-0">Status: Scheduled</p>
                </div>
              </div>
              <p>
                Click <strong>Book Appointment</strong>. The new entry appears immediately on
                the appointments list, the doctor's calendar, and the patient's timeline with
                status <strong>Scheduled</strong>. Receptionists assigned to that doctor see
                it the moment they refresh.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 5 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">5</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">The 4-Status Workflow</h2>
                  <p className="text-muted-foreground m-0">From booked all the way to completed</p>
                </div>
              </div>
              <p>
                Every appointment moves through one of four statuses. Each transition is
                timestamped so you get accurate analytics later.
              </p>
              <div className="grid md:grid-cols-2 gap-4 my-6">
                {[
                  { label: "Scheduled", desc: "Newly booked & waiting", color: "bg-blue-500/10 text-blue-600" },
                  { label: "Completed", desc: "Visit recorded & saved", color: "bg-emerald-500/10 text-emerald-600" },
                  { label: "Cancelled", desc: "Called off before visit", color: "bg-rose-500/10 text-rose-600" },
                  { label: "No-show", desc: "Patient didn't arrive", color: "bg-amber-500/10 text-amber-600" },
                ].map((s, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="pt-4 pb-4 flex items-center gap-3">
                      <Badge className={s.color}>{s.label}</Badge>
                      <span className="text-sm text-muted-foreground">{s.desc}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p>
                When the patient arrives, open the appointment and click
                <strong> Record Visit</strong> — saving the visit automatically marks the
                appointment as <strong>Completed</strong>.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 6 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">6</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Reschedule or Cancel</h2>
                  <p className="text-muted-foreground m-0">Without losing the original record</p>
                </div>
              </div>
              <p>
                Open any scheduled appointment and click <strong>Reschedule</strong> to pick a
                new doctor/date/slot — the original entry is updated rather than duplicated, so
                the patient's history stays clean. To cancel, use <strong>Cancel</strong> and
                add a reason — the slot becomes available for re-booking immediately.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 7 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">7</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Calendar View & Reminders</h2>
                  <p className="text-muted-foreground m-0">See the day at a glance</p>
                </div>
              </div>
              <p>
                Switch to the <strong>Calendar</strong> tab for a day, week or month view of
                every appointment colour-coded by status. Patients automatically receive
                appointment confirmations and reminders by email (and push notifications
                inside the mobile app), reducing no-shows.
              </p>
            </div>

            {/* Best Practices */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Best Practices
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Always search before adding — avoids duplicate patient records</li>
                  <li>• Keep doctor schedules & leaves up to date so slots stay accurate</li>
                  <li>• Mark no-shows the same day to keep analytics meaningful</li>
                  <li>• Reschedule instead of cancel + re-book — keeps the timeline clean</li>
                  <li>• Use the calendar view every morning to spot gaps and over-booked hours</li>
                </ul>
              </CardContent>
            </Card>
          </article>

          {/* Feedback */}
          <div className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Was this article helpful?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="gap-2"><ThumbsUp className="w-4 h-4" />Yes, it helped</Button>
                <Button variant="outline" className="gap-2"><ThumbsDown className="w-4 h-4" />No, I need more help</Button>
              </div>
            </div>
          </div>

          {/* Related */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Managing Walk-ins", slug: "walk-ins" },
                { title: "Appointment Calendar", slug: "appointment-calendar" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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

const SetupSpecializationsArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">For Clinics</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Setting Up Specializations</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Link to={kbBase}>
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-violet-500/10 text-violet-600 hover:bg-violet-500/20">
                <Briefcase className="w-3 h-3 mr-1" />
                For Clinics
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                6 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Setting Up Specializations
            </h1>
            <p className="text-xl text-muted-foreground">
              Specializations power your entire doctor catalogue — they decide which
              specialties patients can browse, how doctors are filtered when booking
              appointments, and which doctors appear on your public clinic page.
              Here's how to set them up the right way.
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Why specializations matter",
                  "Add your first specialization",
                  "Edit, rename or delete entries",
                  "Bulk-search & paginate the list",
                  "How doctors get linked to specialties",
                  "Best practices & common mistakes",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <article className="prose prose-lg max-w-none">

            {/* Why */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Why specializations matter</h2>
              <p>
                A <strong>specialization</strong> (Cardiologist, Dermatologist, Gynaecologist,
                ENT Specialist, etc.) is the single most important attribute on a doctor's
                profile. The platform uses it in three critical places:
              </p>
              <div className="grid md:grid-cols-3 gap-4 my-6">
                {[
                  { icon: Stethoscope, label: "Doctor Profiles", desc: "Shown on every doctor's card and public profile" },
                  { icon: Calendar, label: "Appointment Booking", desc: "Filters the doctor list when booking by specialty" },
                  { icon: Search, label: "Public Discovery", desc: "Patients find doctors via specialty pages & search" },
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
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Already set up:</strong> Every clinic starts with
                  <strong> "Dentist"</strong> automatically added so dental clinics can
                  begin onboarding doctors immediately. You can keep, rename or delete it.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">1</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the Specializations Screen</h2>
                  <p className="text-muted-foreground m-0">Sidebar → Specializations</p>
                </div>
              </div>
              <p>
                From the clinic sidebar click <strong>Specializations</strong>. You'll see
                the full list of every specialty currently available inside your clinic,
                a count badge, a live search box and the <strong>+ Add Specialization</strong>
                button at the top right.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Who can edit?</strong> Only the Clinic Owner manages
                  specializations. Receptionists and Doctors see them while booking but
                  cannot create or delete entries.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">2</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Add a Specialization</h2>
                  <p className="text-muted-foreground m-0">One name per entry — keep it precise</p>
                </div>
              </div>
              <p>
                Click <strong>+ Add Specialization</strong>. A small dialog appears with a
                single field — the specialization <strong>name</strong>. Type the specialty
                exactly as you want it shown to patients and doctors (for example:
                <em> Cardiologist</em>, <em>Pediatric Dentist</em>, <em>ENT Specialist</em>),
                then press <strong>Add</strong> or hit <kbd>Enter</kbd>.
              </p>
              <p>
                The system enforces uniqueness — if the name already exists in your clinic
                you'll see a friendly error so you don't end up with duplicates like
                "Cardiologist" and "Cardiology".
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">3</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Edit or Rename Existing Entries</h2>
                  <p className="text-muted-foreground m-0">Changes flow everywhere instantly</p>
                </div>
              </div>
              <p>
                Click the <strong>pencil</strong> icon next to any specialization to edit
                its name. The new name immediately reflects on every doctor profile,
                booking dropdown and public listing — no migrations or refreshes needed.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">4</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Delete Carefully</h2>
                  <p className="text-muted-foreground m-0">Removed entries can't be auto-restored</p>
                </div>
              </div>
              <p>
                Click the red <strong>trash</strong> icon to delete a specialization. A
                confirmation dialog appears so you don't lose anything by accident. If a
                doctor is currently assigned to that specialty, you should reassign them
                <strong> first</strong> from the doctor's profile, otherwise their
                specialty field will appear blank.
              </p>
              <div className="flex items-start gap-3 p-4 bg-rose-500/10 rounded-lg border border-rose-500/20 mt-4">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Heads up:</strong> Deletion is permanent. Renaming is almost
                  always safer than deleting & re-creating.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 5 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">5</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Search & Pagination</h2>
                  <p className="text-muted-foreground m-0">Built for clinics with 50+ specialties</p>
                </div>
              </div>
              <p>
                Use the <strong>search box</strong> in the card header to instantly filter
                the list — handy as your catalogue grows. The table paginates at
                <strong> 25 / 50 / 75 / 100</strong> rows per page so you can scan or
                jump quickly without lag.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 6 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">6</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Linking Doctors to Specializations</h2>
                  <p className="text-muted-foreground m-0">Done while adding or editing a doctor</p>
                </div>
              </div>
              <p>
                When you go to <strong>Doctors → + Add Doctor</strong>, the
                <strong> Specialization</strong> dropdown is populated from this exact
                list. Each doctor is linked to one primary specialization. If you can't
                find a specialty while adding a doctor, just come back to this screen and
                add it — the dropdown updates instantly.
              </p>
            </div>

            {/* Best Practices */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Best Practices
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Use the <strong>singular form</strong> ("Cardiologist", not "Cardiology") — that's how patients search</li>
                  <li>• Keep names <strong>patient-friendly</strong> — avoid internal abbreviations</li>
                  <li>• Add only the specialties your clinic actually offers — fewer, sharper options convert better on the public profile</li>
                  <li>• Reassign doctors <strong>before</strong> deleting a specialty</li>
                  <li>• Rename instead of delete when fixing typos — it preserves all doctor links</li>
                </ul>
              </CardContent>
            </Card>
          </article>

          {/* Feedback */}
          <div className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Was this article helpful?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="gap-2"><ThumbsUp className="w-4 h-4" />Yes, it helped</Button>
                <Button variant="outline" className="gap-2"><ThumbsDown className="w-4 h-4" />No, I need more help</Button>
              </div>
            </div>
          </div>

          {/* Related */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Adding Doctors", slug: "add-doctors" },
                { title: "Booking Appointments", slug: "book-appointments" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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

const DoctorScheduleArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />

      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">For Doctors</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Managing Your Schedule</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Link to={kbBase}>
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-sky-500/10 text-sky-600 hover:bg-sky-500/20">
                <Stethoscope className="w-3 h-3 mr-1" />
                For Doctors
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                7 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Managing Your Schedule
            </h1>
            <p className="text-xl text-muted-foreground">
              Your schedule is the heart of your practice on the platform — it controls
              which days and hours you're available, your daily break time, and any
              upcoming leaves. Everything you set here directly drives the appointment
              slots patients (and your receptionist) can book.
            </p>
          </div>

          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Set your weekly working hours",
                  "Mark days off and break time",
                  "Add full-day & half-day leaves",
                  "How 15-minute slots are generated",
                  "Edit on web or the mobile app",
                  "Best practices to avoid conflicts",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <article className="prose prose-lg max-w-none">

            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Why your schedule matters</h2>
              <p>
                Your weekly availability and leaves are the <strong>single source of truth</strong>
                used everywhere on the platform — your public profile, the booking
                dialog, the clinic dashboard and the receptionist's walk-in screen all
                read from the same schedule. If a slot isn't on your schedule, no one
                can book it. If it is, it auto-appears in <strong>15-minute intervals</strong>.
              </p>
              <div className="grid md:grid-cols-3 gap-4 my-6">
                {[
                  { icon: CalendarDays, label: "Weekly Hours", desc: "Per-day start / end times" },
                  { icon: Coffee, label: "Break Time", desc: "Daily lunch / prayer break" },
                  { icon: Plane, label: "Leaves", desc: "Full-day & half-day off" },
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
            </div>

            <Separator className="my-10" />

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">1</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the Schedule Screen</h2>
                  <p className="text-muted-foreground m-0">Sidebar → My Schedule</p>
                </div>
              </div>
              <p>
                From the doctor sidebar click <strong>My Schedule</strong>. You'll see two
                tabs: <strong>Weekly Hours</strong> (Sunday → Saturday) and
                <strong> Leaves</strong>. Clinic Owners can also reach this screen for
                any of their doctors via <em>Doctors → Schedules</em>.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>On mobile?</strong> The same controls live under
                  <strong> More → Schedule & Leaves</strong> in the Zonoir app.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">2</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Set Weekly Working Hours</h2>
                  <p className="text-muted-foreground m-0">One row per day, toggle + start/end time</p>
                </div>
              </div>
              <p>
                Each day of the week has its own row with an <strong>Available</strong>
                toggle. Switch it on for working days and pick your <strong>start</strong>
                and <strong>end</strong> times. Switch it off to mark the day as a
                weekly off — that day will stop showing in the booking dropdown
                immediately.
              </p>
              <p>
                Click <strong>Save schedule</strong> at the bottom to commit. Existing
                future appointments are <em>not</em> deleted — only new bookings are
                affected.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">3</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Add a Daily Break</h2>
                  <p className="text-muted-foreground m-0">Lunch, prayer or any midday gap</p>
                </div>
              </div>
              <p>
                Inside each day's card you can also set an optional <strong>break
                start</strong> and <strong>break end</strong>. Slots that fall inside
                the break window are automatically removed from the booking grid, so
                patients can't book over your lunch or prayer time.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">4</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Add Leaves (Full or Half Day)</h2>
                  <p className="text-muted-foreground m-0">For travel, conferences or sick days</p>
                </div>
              </div>
              <p>
                Switch to the <strong>Leaves</strong> tab and click <strong>+ Add leave</strong>.
                Pick a date, choose the type and optionally add a reason:
              </p>
              <ul>
                <li><strong>Full day</strong> — entire day blocked, no slots offered.</li>
                <li><strong>Morning (Half day)</strong> — morning slots blocked, afternoon stays open.</li>
                <li><strong>Evening (Half day)</strong> — afternoon/evening slots blocked, mornings stay open.</li>
              </ul>
              <p>
                Leaves immediately reflect on your public profile's weekly schedule
                (greyed-out days), the booking dialog and the clinic calendar. Remove
                a leave anytime with the trash icon — slots reopen instantly.
              </p>
              <div className="flex items-start gap-3 p-4 bg-rose-500/10 rounded-lg border border-rose-500/20 mt-4">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Already-booked appointments are not auto-cancelled</strong>
                  when you mark a leave. Open the appointment list and reschedule or
                  cancel them manually so patients are notified properly.
                </p>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 5 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">5</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">How 15-Minute Slots Are Generated</h2>
                  <p className="text-muted-foreground m-0">It all happens automatically</p>
                </div>
              </div>
              <p>
                Once your weekly hours, breaks and leaves are saved, the platform
                generates bookable slots in <strong>15-minute intervals</strong> between
                your start and end times — skipping breaks, leaves and any slot already
                booked. There's nothing else to configure: edit the schedule, save,
                and the booking experience updates everywhere within seconds.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 6 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">6</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Edit on the Go (Mobile App)</h2>
                  <p className="text-muted-foreground m-0">Same controls, native experience</p>
                </div>
              </div>
              <p>
                The Zonoir mobile app mirrors the web schedule screen 1:1. Open
                <strong> More → Schedule & Leaves</strong>, flip the day toggles, set
                your hours, tap <strong>Save schedule</strong>, and add leaves from the
                bottom sheet. Useful when you're between consultations and need to
                block off a sudden afternoon.
              </p>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Best Practices
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Keep weekly hours <strong>realistic</strong> — overcommitting leads to overbooked days</li>
                  <li>• Always set a <strong>break window</strong> so patients don't book your lunch slot</li>
                  <li>• Add planned leaves <strong>well in advance</strong> — patients can't book leave dates the moment you save</li>
                  <li>• <strong>Reschedule existing appointments</strong> after marking a leave — the leave only blocks future bookings</li>
                  <li>• Use <strong>half-day leaves</strong> for short personal commitments instead of blocking the whole day</li>
                  <li>• Review your schedule once a week to keep your public profile accurate</li>
                </ul>
              </CardContent>
            </Card>
          </article>

          <div className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Was this article helpful?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="gap-2"><ThumbsUp className="w-4 h-4" />Yes, it helped</Button>
                <Button variant="outline" className="gap-2"><ThumbsDown className="w-4 h-4" />No, I need more help</Button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Booking Appointments", slug: "book-appointments" },
                { title: "Adding Doctors", slug: "add-doctors" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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

const PrescriptionTemplatesArticle = () => {
  const kbBase = useKBBase();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <PublicHeader />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={kbBase} className="hover:text-foreground transition-colors">Knowledge Base</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={kbBase} className="hover:text-foreground transition-colors">For Doctors</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Creating Prescription Templates</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Link to={kbBase}>
            <Button variant="ghost" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Knowledge Base
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">
                <Stethoscope className="w-3 h-3 mr-1" />
                For Doctors
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                7 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Creating Prescription Templates
            </h1>
            <p className="text-xl text-muted-foreground">
              Save hours every week by building reusable prescription, test, report, and leave
              templates — then apply them to any patient visit with a single click.
            </p>
          </div>

          {/* What you'll learn */}
          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What you'll learn
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Why templates matter for busy clinics",
                  "Five template types you can create",
                  "Step-by-step: create your first template",
                  "How to apply templates during a visit",
                  "Editing, duplicating, and deleting templates",
                  "Best practices for safer prescribing",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <article className="prose prose-lg max-w-none">
            {/* Intro */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-3">Why use prescription templates?</h2>
              <p>
                Every doctor sees the same conditions over and over — hypertension, viral fever,
                URTI, gastritis, diabetes follow-ups. Typing the same prescription dozens of times
                a day is slow and error-prone. Templates let you write the prescription{" "}
                <strong>once</strong> and reuse it instantly, while still allowing patient-specific
                tweaks before printing.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Zap, title: "Faster Visits", desc: "Apply a full prescription in one click" },
                  { icon: Shield, title: "Fewer Errors", desc: "Standardised dosing and instructions" },
                  { icon: ClipboardList, title: "Consistent Care", desc: "Every patient gets the same quality" },
                ].map((b, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <b.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{b.title}</h4>
                      <p className="text-xs text-muted-foreground m-0">{b.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-10" />

            {/* Template Types */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-3">The five template types</h2>
              <p className="mb-6">
                Inside <strong>Templates</strong> in your sidebar, you'll find five tabs.
                Each one targets a specific part of the visit workflow.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Stethoscope,
                    color: "from-purple-500 to-purple-600",
                    title: "Disease / Prescription",
                    desc: "Full prescriptions tied to a diagnosis (e.g. Hypertension, Type 2 Diabetes). The most-used template type.",
                  },
                  {
                    icon: Activity,
                    color: "from-rose-500 to-rose-600",
                    title: "Test / Investigation",
                    desc: "Pre-built lab and imaging panels — CBC, LFTs, lipid profile, ultrasound, etc.",
                  },
                  {
                    icon: FileText,
                    color: "from-blue-500 to-blue-600",
                    title: "Report Templates",
                    desc: "Structured report forms with custom fields (vitals, findings, impression).",
                  },
                  {
                    icon: Clock,
                    color: "from-amber-500 to-amber-600",
                    title: "Sick Leave",
                    desc: "Standard sick-leave certificates with editable duration and reason.",
                  },
                  {
                    icon: Briefcase,
                    color: "from-emerald-500 to-emerald-600",
                    title: "Work / Fitness Leave",
                    desc: "Fitness-to-work and return-to-duty letters with your signature block.",
                  },
                ].map((t, i) => (
                  <Card key={i} className="border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0 shadow`}>
                          <t.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{t.title}</h4>
                          <p className="text-xs text-muted-foreground m-0">{t.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the Templates page</h2>
                  <p className="text-muted-foreground m-0">From your doctor or clinic sidebar</p>
                </div>
              </div>
              <p>
                Sign in and click <strong>Templates</strong> in the left sidebar. Clinic owners
                can manage templates that are shared across all their doctors; individual doctors
                manage their own private library.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Tip:</strong> On mobile, tap <strong>More → Templates</strong>. The
                  Disease tab supports full create/edit/delete directly inside the app.
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
                  <h2 className="text-2xl font-bold m-0">Pick a template type and click "New"</h2>
                  <p className="text-muted-foreground m-0">Start with Disease / Prescription — it's the highest-impact one</p>
                </div>
              </div>
              <p>
                Choose the tab that matches what you want to build. Click the <strong>+ New
                Template</strong> button in the top right.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Fill in the template content</h2>
                  <p className="text-muted-foreground m-0">Be specific — this becomes your default text</p>
                </div>
              </div>

              <p className="mb-4">For a <strong>Disease / Prescription</strong> template you'll enter:</p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Activity, label: "Disease Name", desc: "e.g. Hypertension Stage 1" },
                  { icon: FileText, label: "Prescription Text", desc: "Drug name, dose, frequency, duration, instructions" },
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

              <Card className="bg-muted/40 border-dashed">
                <CardContent className="py-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Example prescription template
                  </p>
                  <pre className="text-sm whitespace-pre-wrap font-mono m-0 text-foreground">{`Tab. Amlodipine 5mg — once daily, morning, for 30 days
Tab. Losartan 50mg — once daily, morning, for 30 days
Cap. Aspirin 75mg — once daily, after dinner, for 30 days

Advice:
- Low salt diet, avoid pickles and processed food
- 30 minutes brisk walk daily
- Monitor BP twice weekly, log readings

Follow up after 4 weeks with BP chart.`}</pre>
                </CardContent>
              </Card>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mt-6">
                <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>For Report Templates:</strong> add custom fields (Title + default Value)
                  for things like Vitals, Findings, Impression. You can add as many fields as you
                  need.
                </p>
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
                  <h2 className="text-2xl font-bold m-0">Save the template</h2>
                  <p className="text-muted-foreground m-0">It's instantly available across all your visits</p>
                </div>
              </div>
              <p>
                Click <strong>Save</strong>. The template appears in your list immediately and is
                ready to use during the next patient visit. There's no limit on how many templates
                you can create.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 5 - applying */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  5
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Apply a template to a visit</h2>
                  <p className="text-muted-foreground m-0">One click — fully editable before printing</p>
                </div>
              </div>

              <div className="relative pl-8 space-y-6 my-6">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
                {[
                  { title: "Open the patient visit", desc: "From Appointments or Walk-in, open the visit record." },
                  { title: "Pick a diagnosis", desc: "Select the disease — matching templates appear automatically." },
                  { title: "Click Apply Template", desc: "The prescription text fills in instantly." },
                  { title: "Tweak for the patient", desc: "Adjust dosage, duration, or add patient-specific notes." },
                  { title: "Save & print", desc: "Print the prescription pad or share via WhatsApp." },
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

            {/* Editing */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-3">Editing & deleting templates</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Edit:</strong> Click any template row to reopen the editor. Changes apply only to future visits — past prescriptions remain unchanged.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Duplicate:</strong> Open an existing template, change the disease name, save — instant variant (e.g. "Hypertension + Diabetes combo").</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Delete:</strong> Use the trash icon. Deleted templates can't be recovered, so review carefully.</span>
                </li>
              </ul>
            </div>

            {/* Best Practices */}
            <Card className="border-primary/20 bg-primary/5 mb-8">
              <CardContent className="py-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Best practices
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Name templates clearly — include severity or patient type ("URTI — Adult", "URTI — Paediatric").</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Always include drug, strength, frequency, duration, and route on every line.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Add a short Advice / lifestyle section — patients value it.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Specify a follow-up window so patients know when to return.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Review your templates every 6 months — guidelines and brand availability change.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Always double-check before printing</h4>
                    <p className="text-sm text-muted-foreground m-0">
                      Templates are a starting point — not a substitute for clinical judgement.
                      Always verify dose, allergies, drug interactions, pregnancy status, and
                      renal/hepatic function for each individual patient before saving the
                      prescription.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Feedback */}
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

          {/* Related */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Managing Your Schedule", slug: "doctor-schedule" },
                { title: "Booking Appointments", slug: "book-appointments" },
              ].map((article, idx) => (
                <Link key={idx} to={`${kbBase}/${article.slug}`}>
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
