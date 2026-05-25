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
  Save,
  CreditCard,
  Receipt,
  Sparkles,
  RefreshCw,
  Gift,
  Wallet,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  Printer,
  Percent,
  PieChart,
  FileSpreadsheet,
  LogIn,
  KeyRound,
  Fingerprint,
  Lock
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
                    <ul className="text-sm text-muted-foreground space-y-1 list-none pl-0">
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
  "walk-ins": "Managing Walk-ins",
  "appointment-calendar": "Appointment Calendar",
  "subscription": "Understanding Your Subscription",
  "payment-tracking": "Payment Tracking",
  "expenses": "Managing Expenses",
  "managing-expenses": "Managing Expenses",
  "reset-password": "Resetting Your Password",
  "login-portals": "Logging In: Clinic vs Doctor vs Receptionist Portals",
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

  if (slug === "walk-ins" || slug === "managing-walk-ins") {
    return <WalkInsArticle />;
  }

  if (slug === "appointment-calendar" || slug === "calendar") {
    return <AppointmentCalendarArticle />;
  }

  if (slug === "subscription" || slug === "understanding-your-subscription") {
    return <SubscriptionArticle />;
  }

  if (slug === "payment-tracking" || slug === "track-payments") {
    return <PaymentTrackingArticle />;
  }

  if (slug === "expenses" || slug === "managing-expenses") {
    return <ManagingExpensesArticle />;
  }

  if (slug === "reset-password" || slug === "resetting-your-password" || slug === "forgot-password") {
    return <ResetPasswordArticle />;
  }

  if (slug === "login-portals" || slug === "logging-in" || slug === "sign-in") {
    return <LoginPortalsArticle />;
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

const VisitRecordsArticle = () => {
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
            <span className="text-foreground">Recording Patient Visits</span>
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
                8 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Recording Patient Visits
            </h1>
            <p className="text-xl text-muted-foreground">
              A complete walkthrough of capturing a clinical encounter — from vitals and chief
              complaint to diagnosis, prescription, and follow-up — so every visit is documented,
              searchable, and ready to print.
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
                  "Open a visit from an appointment or walk-in",
                  "Record vitals, complaints, and exam findings",
                  "Add a diagnosis using ICD codes",
                  "Apply prescription, test, and report templates",
                  "Save, print, and share via WhatsApp",
                  "Review the full visit history later",
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
              <h2 className="text-2xl font-bold mb-3">Why visit records matter</h2>
              <p>
                Every patient encounter — whether a 5-minute follow-up or a detailed first
                consultation — should leave behind a clear, structured record. Good visit notes
                protect you medico-legally, help you spot patterns over time, and make life easier
                for the next doctor (or yourself in 6 months) reading the chart.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Shield, title: "Medico-Legal Safety", desc: "A timestamped record of what you did and why" },
                  { icon: Activity, title: "Better Continuity", desc: "Trends in BP, sugar, weight visible at a glance" },
                  { icon: Zap, title: "Faster Follow-ups", desc: "Pull up last visit instantly — no re-asking" },
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

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the visit</h2>
                  <p className="text-muted-foreground m-0">Three ways to start a new visit record</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>From Appointments:</strong> open today's calendar, click the patient's appointment card, then <strong>Start Visit</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>From Walk-in:</strong> use the Walk-in screen to register the patient on the spot and jump straight into the visit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>From the patient profile:</strong> open any patient and click <strong>+ New Visit</strong> on the timeline.</span>
                </li>
              </ul>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Tip:</strong> Starting from the appointment automatically marks it as
                  <em> In Progress</em> and links the visit to that booking — no extra clicks.
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
                  <h2 className="text-2xl font-bold m-0">Record vitals</h2>
                  <p className="text-muted-foreground m-0">Quick numbers that drive your decisions</p>
                </div>
              </div>
              <p className="mb-4">Enter the vitals your receptionist captured at triage, or fill them in yourself:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: Activity, label: "Blood Pressure", desc: "Systolic / Diastolic in mmHg" },
                  { icon: Activity, label: "Pulse & SpO₂", desc: "Heart rate and oxygen saturation" },
                  { icon: Activity, label: "Temperature", desc: "°F or °C" },
                  { icon: Activity, label: "Weight & Height", desc: "BMI is calculated automatically" },
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Chief complaint & history</h2>
                  <p className="text-muted-foreground m-0">Capture the story in the patient's own words</p>
                </div>
              </div>
              <p>
                Write a concise <strong>chief complaint</strong> (e.g. "Fever × 3 days, dry cough,
                body ache") and add any relevant <strong>history of present illness</strong>.
                The system also surfaces previously recorded <strong>allergies</strong> and{" "}
                <strong>chronic diseases</strong> from the patient profile so you can't miss them.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Examination & diagnosis</h2>
                  <p className="text-muted-foreground m-0">Findings, ICD codes, and clinical impression</p>
                </div>
              </div>
              <p className="mb-4">
                Add your <strong>examination findings</strong> in free text. Then attach a
                diagnosis — either typed in plain language or selected from your{" "}
                <strong>ICD code</strong> library. Tagging an ICD code makes the visit searchable
                later (e.g. "show me all dengue cases this month").
              </p>
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Smart suggestion:</strong> as soon as you pick a diagnosis, matching{" "}
                  <strong>prescription templates</strong> appear in the next section — one click
                  to apply.
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
                  <h2 className="text-2xl font-bold m-0">Prescription, tests & reports</h2>
                  <p className="text-muted-foreground m-0">Use templates to save time, edit per patient</p>
                </div>
              </div>
              <p className="mb-4">In one visit screen you can attach:</p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: ClipboardList, title: "Prescription", desc: "Apply a disease template, then tweak dose & duration." },
                  { icon: Activity, title: "Test / Investigation", desc: "Pre-built panels (CBC, LFTs, ultrasound) added in one click." },
                  { icon: FileText, title: "Report", desc: "Structured forms with fields like Findings & Impression." },
                ].map((c, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <c.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{c.title}</h4>
                      <p className="text-xs text-muted-foreground m-0">{c.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Don't have templates yet? See{" "}
                <Link to={`${kbBase}/prescription-templates`} className="text-primary underline">
                  Creating Prescription Templates
                </Link>{" "}
                to build your first one in under a minute.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 6 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  6
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Follow-up, fee & save</h2>
                  <p className="text-muted-foreground m-0">Close the loop in seconds</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Follow-up date:</strong> set the next visit so it appears on the patient's reminder list.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Consultation fee:</strong> defaults to your standard fee — override if needed for free follow-ups or special cases.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Procedures:</strong> add any in-clinic procedures with their fees — they roll into the day's revenue automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Save Visit:</strong> the appointment is moved to <em>Completed</em> and revenue is logged for analytics.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Step 7 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  7
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Print & share</h2>
                  <p className="text-muted-foreground m-0">Hand the patient a clean prescription pad</p>
                </div>
              </div>
              <p>
                After saving, click <strong>Print</strong> to generate a branded prescription pad
                with your letterhead, the patient's details, diagnosis, prescription, and
                follow-up date. Use <strong>Share via WhatsApp</strong> to send a PDF directly to
                the patient's number on file — useful for tele-consults or when patients forget
                the printout.
              </p>
            </div>

            <Separator className="my-10" />

            {/* History */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-3">Reviewing past visits</h2>
              <p>
                Open any patient's profile to see the full <strong>visit timeline</strong> —
                every encounter with date, diagnosis, prescription, and any uploaded documents.
                Click a visit to expand the full record, or use the search bar at the top of the
                patient list to find anyone in seconds.
              </p>
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
                    <span>Record vitals on every visit, even short follow-ups — trends are what matter.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Always tag a diagnosis (ICD code if possible) — it powers your analytics later.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Set a follow-up date for chronic conditions — patients return more reliably.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Save the visit before printing — once saved, the record is permanent.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Keep notes concise — focus on what would help the next clinician understand the case.</span>
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
                    <h4 className="font-semibold mb-2">Saved visits are permanent</h4>
                    <p className="text-sm text-muted-foreground m-0">
                      For medico-legal compliance, a saved visit cannot be silently edited or
                      deleted from history. If you need to correct a record, add an addendum
                      visit with the corrected information rather than altering the original.
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
                { title: "Creating Prescription Templates", slug: "prescription-templates" },
                { title: "Patient History & Documents", slug: "patient-history" },
                { title: "Booking Appointments", slug: "book-appointments" },
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

const WalkInsArticle = () => {
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
            <span className="text-foreground">Managing Walk-ins</span>
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
                7 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Managing Walk-ins
            </h1>
            <p className="text-xl text-muted-foreground">
              Register an unscheduled patient, drop them into the queue, and start their visit
              in under a minute — without disturbing the day's booked appointments.
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
                  "Open the Walk-in screen as doctor or receptionist",
                  "Register a brand-new patient on the spot",
                  "Pick an existing patient with smart search",
                  "Set reason for visit and consultation fee",
                  "Slot the walk-in into today's queue",
                  "Convert the walk-in into a full visit record",
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
              <h2 className="text-2xl font-bold mb-3">What is a walk-in?</h2>
              <p>
                A <strong>walk-in</strong> is any patient who arrives at your clinic without a
                pre-booked appointment. In a busy practice they can be 30–50% of the day's
                volume, and how you handle them decides whether the front desk feels calm or
                chaotic. The Walk-in screen is purpose-built so a receptionist (or the doctor)
                can register the patient, capture a fee, and queue them up without wading
                through the full appointment booking flow.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Zap, title: "Under 60 seconds", desc: "From front desk to ready-to-see in one short form" },
                  { icon: Users, title: "New or existing", desc: "Search the database or create a fresh patient inline" },
                  { icon: Activity, title: "Auto-queued", desc: "Today's date & current time set automatically" },
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

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the Walk-in screen</h2>
                  <p className="text-muted-foreground m-0">Available from every relevant role</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Doctor:</strong> sidebar → <em>Walk-in</em>. Patients you create here are linked to your practice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Doctor's receptionist:</strong> sidebar → <em>Walk-in</em>. The patient is automatically tied to the doctor you work for.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Clinic / clinic receptionist:</strong> sidebar → <em>Walk-in</em>, then pick which doctor the patient is here to see.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">New patient or existing?</h2>
                  <p className="text-muted-foreground m-0">Toggle at the top of the form</p>
                </div>
              </div>
              <p className="mb-4">
                The form opens with two big buttons — <strong>New Patient</strong> and{" "}
                <strong>Existing Patient</strong>. Pick the right one before filling anything in:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold m-0">New Patient</h4>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">
                      Captures full name, phone, gender, and date of birth. A unique patient ID
                      (e.g. <code>P-XXXXX</code>) is generated automatically — no manual numbering.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold m-0">Existing Patient</h4>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">
                      A searchable dropdown lets you find anyone by name, phone, or patient ID.
                      Their full history is instantly linked to the new visit.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Avoid duplicates:</strong> always search first. If you see the patient
                  in the dropdown, pick them — never re-create someone who already exists.
                </p>
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
                  <h2 className="text-2xl font-bold m-0">Capture the basics</h2>
                  <p className="text-muted-foreground m-0">Reason for visit and fee</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Reason for visit:</strong> a short note like "Fever" or "Follow-up — BP". Helps the doctor triage at a glance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Consultation fee (Rs.):</strong> defaults to blank — type the fee being charged today. It flows into your daily revenue and finance reports.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>The visit's <strong>date and time</strong> are set to <em>now</em> automatically — no need to pick a slot.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Register & queue</h2>
                  <p className="text-muted-foreground m-0">One click puts them in the day's list</p>
                </div>
              </div>
              <p>
                Hit <strong>Register Walk-in</strong>. The system creates an appointment with
                status <em>Start</em> and type <em>walk-in</em>, links it to the chosen doctor,
                and shows a success toast. Open the <strong>Appointments</strong> screen and
                you'll see the new entry at the bottom of today's list, clearly tagged so the
                doctor knows it's not a pre-booking.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 5 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  5
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Start the visit</h2>
                  <p className="text-muted-foreground m-0">Hand off cleanly from front desk to doctor</p>
                </div>
              </div>
              <p>
                When the doctor is ready, they open the walk-in from <em>Appointments</em> and
                click <strong>Start Visit</strong> — the same flow as a booked patient. From
                there, vitals, complaints, diagnosis, prescription, and follow-up are all
                captured exactly like any other encounter.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Need a refresher on the visit screen?{" "}
                <Link to={`${kbBase}/visit-records`} className="text-primary underline">
                  Recording Patient Visits
                </Link>{" "}
                walks through every field.
              </p>
            </div>

            <Separator className="my-10" />

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
                    <span>Always search before creating — duplicate patients fragment the medical history.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Capture phone numbers correctly — they're used for WhatsApp prescriptions and follow-up reminders.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Enter the consultation fee at registration so daily revenue stays accurate without back-filling.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Use a clear, short reason for visit so the doctor can triage urgent cases first.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>For repeat walk-ins, switch to <em>Existing Patient</em> — never re-enter their demographics.</span>
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
                    <h4 className="font-semibold mb-2">Walk-ins still need a visit record</h4>
                    <p className="text-sm text-muted-foreground m-0">
                      Registering a walk-in only creates the appointment. If the patient is seen
                      and treated, the doctor must also <strong>Start Visit</strong> and save the
                      clinical record — otherwise the encounter has no diagnosis, prescription,
                      or follow-up on file.
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
                { title: "Booking Appointments", slug: "book-appointments" },
                { title: "Recording Patient Visits", slug: "visit-records" },
                { title: "Adding New Patients", slug: "add-patients" },
                { title: "Creating Prescription Templates", slug: "prescription-templates" },
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

const AppointmentCalendarArticle = () => {
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
            <span className="text-foreground">Appointment Calendar</span>
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
                7 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Appointment Calendar
            </h1>
            <p className="text-xl text-muted-foreground">
              See your entire day, week, or month at a glance — spot free slots, drag bookings
              around, and manage every status from a single visual workspace.
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
                  "Switch between Day, Week, and Month views",
                  "Read color-coded statuses at a glance",
                  "Find free 15-minute slots quickly",
                  "Book, reschedule, and cancel from the calendar",
                  "Filter by doctor in multi-doctor clinics",
                  "Print or export the day's schedule",
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
              <h2 className="text-2xl font-bold mb-3">Why the calendar matters</h2>
              <p>
                A list of appointments is fine for a slow day, but the moment your clinic gets
                busy you need to <em>see</em> the day — gaps, back-to-backs, lunch breaks, and
                all. The Appointment Calendar gives you that bird's-eye view, with every slot
                color-coded by status so you can triage at a glance and never accidentally
                double-book a 15-minute window.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: CalendarDays, title: "Three views", desc: "Day, Week, Month — pick what suits the moment" },
                  { icon: Zap, title: "Instant gaps", desc: "Free slots stand out so the front desk fills them fast" },
                  { icon: Activity, title: "Live statuses", desc: "Booked, in-progress, completed, cancelled — all visible" },
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

            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the calendar</h2>
                  <p className="text-muted-foreground m-0">One click from any role's sidebar</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Doctors</strong> open <em>Calendar</em> to see only their own bookings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Receptionists</strong> see the schedule of the doctor(s) they support.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Clinics</strong> can switch between doctors using the filter at the top.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Pick the right view</h2>
                  <p className="text-muted-foreground m-0">Day, Week, or Month — each has a job</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: "Day", desc: "Hour-by-hour grid in 15-minute slots — perfect for the front desk's working view." },
                  { title: "Week", desc: "Seven columns side-by-side — best for spotting busy vs quiet days and planning leaves." },
                  { title: "Month", desc: "High-level dot count per day — useful for forecasting and capacity planning." },
                ].map((c, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <CalendarDays className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{c.title} view</h4>
                      <p className="text-xs text-muted-foreground m-0">{c.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="mt-4">
                Use the <strong>‹ Today ›</strong> controls in the toolbar to jump back to today
                or step forward and backward in time.
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
                  <h2 className="text-2xl font-bold m-0">Read the colors</h2>
                  <p className="text-muted-foreground m-0">Status at a glance, no clicking required</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span><strong>Booked / Start:</strong> upcoming appointment, ready when the patient arrives.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span><strong>In Progress:</strong> patient checked in and the visit is open.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Completed:</strong> visit saved, fee logged, done for the day.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span><strong>Cancelled / No-show:</strong> stays visible so the slot history is honest.</span>
                </li>
              </ul>
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Walk-ins</strong> appear with a small badge so the doctor instantly
                  knows it isn't a pre-booked patient.
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
                  <h2 className="text-2xl font-bold m-0">Book from an empty slot</h2>
                  <p className="text-muted-foreground m-0">Skip the long form when the time is obvious</p>
                </div>
              </div>
              <p>
                Click any free 15-minute cell to open the booking dialog with that date and
                time pre-filled. Search the patient (or create a new one), set the reason, and
                save. The new card appears in the slot immediately — no page reload.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-4">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm m-0">
                  <strong>Slot collisions are blocked</strong> — the system won't let two
                  patients share the same 15-minute window for the same doctor.
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
                  <h2 className="text-2xl font-bold m-0">Manage an existing appointment</h2>
                  <p className="text-muted-foreground m-0">Open the card for the full toolset</p>
                </div>
              </div>
              <p className="mb-4">Click any booked card to open its detail panel, where you can:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Reschedule</strong> to another date or time — patient and history move with it.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Cancel</strong> with an optional reason logged for analytics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Start Visit</strong> to jump straight into the clinical record.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Open patient profile</strong> for full history, allergies, and past visits.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Step 6 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  6
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Filter, search & print</h2>
                  <p className="text-muted-foreground m-0">Tame busy clinics fast</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Doctor filter</strong> (clinic view): focus on one doctor at a time when running multiple practitioners.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Status filter:</strong> hide completed cards to declutter the active queue.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Search:</strong> type a patient's name or phone to highlight their card.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Print today:</strong> generate a clean, printable list for the front desk or the doctor's room.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Schedule respect */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-3">The calendar respects your schedule</h2>
              <p>
                Off-days, half-day leaves, lunch breaks, and weekly availability set in{" "}
                <strong>Doctor Schedule</strong> are reflected automatically — those windows are
                visually blocked so you can't book a patient into them. Update the schedule
                once and every future calendar view obeys it.
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                See{" "}
                <Link to={`${kbBase}/doctor-schedule`} className="text-primary underline">
                  Managing Your Schedule
                </Link>{" "}
                to set weekly hours, breaks, and leaves.
              </p>
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
                    <span>Start the day in <strong>Day view</strong> — it's the truest picture of what's coming.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Check <strong>Week view</strong> on Mondays to balance load across the week.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Don't delete cancellations — leaving them visible keeps the no-show analytics honest.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Reschedule rather than cancel + re-book — patient history stays attached cleanly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Print the morning list so the front desk has a paper backup if Wi-Fi drops.</span>
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
                    <h4 className="font-semibold mb-2">Time zones & 15-minute slots</h4>
                    <p className="text-sm text-muted-foreground m-0">
                      All times use your clinic's local time. Slots are fixed at 15-minute
                      intervals — for longer procedures, book the patient and clearly mark the
                      reason so the front desk knows not to slot another appointment immediately
                      after.
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
                { title: "Booking Appointments", slug: "book-appointments" },
                { title: "Managing Walk-ins", slug: "walk-ins" },
                { title: "Managing Your Schedule", slug: "doctor-schedule" },
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

const SubscriptionArticle = () => {
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
            <Link to={kbBase} className="hover:text-foreground transition-colors">Billing & Payments</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Understanding Your Subscription</span>
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
              <Badge className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20">
                <CreditCard className="w-3 h-3 mr-1" />
                Billing & Payments
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                8 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Understanding Your Subscription
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about your Zonoir plan — the free trial, monthly vs.
              yearly billing, the launch discount, renewal dates, and what happens when a payment
              is missed.
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
                  "How the 14-day free trial works",
                  "Difference between Monthly and Yearly plans",
                  "Reading the launch discount (75% OFF)",
                  "Where to see your next renewal date",
                  "Payment status: Paid, Unpaid, Action Required",
                  "What happens if a payment fails",
                  "How clinic-managed doctors are billed",
                  "How to upgrade, downgrade, or cancel",
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
              <h2 className="text-2xl font-bold mb-3">Your subscription, in plain English</h2>
              <p>
                Zonoir is a subscription product — you pay a fixed fee every month or year and
                get unlimited access to appointments, patient records, prescriptions, billing,
                analytics, and the mobile app. There are no per-patient or per-appointment
                charges, and nothing you build inside the platform is ever locked behind a paywall.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Gift, title: "14-day free trial", desc: "Full access — no card required to start" },
                  { icon: Sparkles, title: "75% launch discount", desc: "PKR 23,999 → PKR 5,999 / month" },
                  { icon: TrendingDown, title: "17% off yearly", desc: "Save two months when you pay annually" },
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

            {/* Step 1: Trial */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">The 14-day free trial</h2>
                  <p className="text-muted-foreground m-0">Test-drive every feature before you pay</p>
                </div>
              </div>
              <p>
                Every new clinic and every new doctor account starts with a <strong>14-day free
                trial</strong>. During the trial you get the same access as a paying subscriber —
                unlimited patients, appointments, doctors (within plan limits), prescriptions,
                analytics, and the mobile app. We do not ask for a card up front.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>The <em>Trial Status</em> card on your Subscription page shows the days remaining.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>You'll see a <em>Trial Banner</em> at the top of the dashboard reminding you when it expires.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Once the trial ends, you must complete payment to keep using the platform — your data is preserved.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Step 2: Plans */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Monthly vs. Yearly plans</h2>
                  <p className="text-muted-foreground m-0">Pick the cycle that fits your cash flow</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 not-prose">
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold m-0">Monthly</h4>
                    </div>
                    <p className="text-2xl font-bold m-0">PKR 5,999<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
                    <p className="text-xs text-muted-foreground mt-1 line-through">PKR 23,999 / month</p>
                    <p className="text-sm text-muted-foreground mt-3 m-0">Billed every 30 days. Cancel anytime — you keep access until the end of the paid period.</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/40 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold m-0">Yearly</h4>
                      <Badge className="ml-auto">Save 17%</Badge>
                    </div>
                    <p className="text-2xl font-bold m-0">PKR 59,710<span className="text-sm font-normal text-muted-foreground"> / year</span></p>
                    <p className="text-xs text-muted-foreground mt-1">≈ PKR 4,976 / month — two months free</p>
                    <p className="text-sm text-muted-foreground mt-3 m-0">Billed once a year. Best for established clinics with predictable budgets.</p>
                  </CardContent>
                </Card>
              </div>
              <p className="mt-6">
                You can switch between Monthly and Yearly at any time from the Subscription page.
                Yearly invoices show the <strong>full annual amount</strong> — never a per-month
                rate — so what you see is exactly what is charged.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 3: Launch discount */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">The 75% launch discount</h2>
                  <p className="text-muted-foreground m-0">Locked in for as long as you stay subscribed</p>
                </div>
              </div>
              <p>
                Our standard rate is <strong>PKR 23,999 / month</strong>. As part of our launch in
                Pakistan, every clinic and doctor that signs up today gets a <strong>75% discount</strong>,
                bringing the price down to <strong>PKR 5,999 / month</strong>. This rate is locked
                to your account — as long as you don't cancel and re-subscribe later, you keep
                paying the discounted price even after the launch period ends.
              </p>
              <Card className="not-prose mt-4 border-cyan-500/20 bg-cyan-500/5">
                <CardContent className="py-5">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                    <p className="text-sm m-0">
                      The Subscription page shows the original price <span className="line-through">PKR 23,999</span> next
                      to the discounted rate so you can always see the value you're getting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-10" />

            {/* Step 4: Reading subscription page */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Reading your Subscription page</h2>
                  <p className="text-muted-foreground m-0">Five cards that tell you everything</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: CreditCard, title: "Current Plan", desc: "Shows Monthly or Yearly, the discounted price, and the original PKR 23,999 rate struck through." },
                  { icon: Calendar, title: "Billing Cycle", desc: "Confirms whether you're billed monthly or annually, and the savings on yearly." },
                  { icon: Clock, title: "Trial Status", desc: "Days remaining in your free trial, or 'Expired' once it ends." },
                  { icon: Wallet, title: "Payment Status", desc: "Paid (green) means you're good. Unpaid means action is required to keep access." },
                  { icon: RefreshCw, title: "Next Renewal", desc: "The exact date your card will be charged next — or when billing begins after the trial." },
                ].map((card, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="py-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <card.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm m-0">{card.title}</h4>
                        <p className="text-sm text-muted-foreground m-0 mt-1">{card.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 5: Billing summary */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  5
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">The Billing Summary breakdown</h2>
                  <p className="text-muted-foreground m-0">Every rupee accounted for</p>
                </div>
              </div>
              <p>
                Below the cards you'll find a clear, line-by-line breakdown so there are no
                surprises:
              </p>
              <div className="not-prose mt-4 rounded-lg border bg-card">
                <div className="px-5 py-3 flex justify-between text-sm border-b">
                  <span className="text-muted-foreground">Original rate</span>
                  <span className="line-through text-muted-foreground">PKR 23,999 / month</span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm border-b text-red-600">
                  <span>Launch discount (75% OFF)</span>
                  <span>− PKR 18,000</span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm border-b">
                  <span className="text-muted-foreground">Discounted rate</span>
                  <span>PKR 5,999 / month</span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm border-b text-green-600">
                  <span>Yearly discount (17%) — yearly plan only</span>
                  <span>− PKR 12,238</span>
                </div>
                <div className="px-5 py-4 flex justify-between font-bold">
                  <span>Total (Yearly)</span>
                  <span>PKR 59,710</span>
                </div>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Step 6: Failed payments */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  6
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">If a payment fails</h2>
                  <p className="text-muted-foreground m-0">What happens, and how to recover</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-1 shrink-0" />
                  <span>The Payment Status card flips to <strong>Action Required</strong> and you'll see a banner on the dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-1 shrink-0" />
                  <span>You get a <strong>3-day grace window</strong> — full access continues so patient care isn't interrupted.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-1 shrink-0" />
                  <span>After the grace period, the account is <em>paused</em> — you can still log in and see your data, but new appointments and visits are blocked until payment clears.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-1 shrink-0" />
                  <span>Your data is <strong>never deleted</strong> for unpaid invoices. Resume the plan and everything is exactly where you left it.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            {/* Step 7: Doctors under clinics */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  7
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Doctors under a clinic</h2>
                  <p className="text-muted-foreground m-0">One subscription, many practitioners</p>
                </div>
              </div>
              <p>
                If a doctor was added by a clinic owner, the <strong>clinic pays a single
                subscription</strong> that covers every doctor on the team. Those doctors will see
                a <em>"Managed by Clinic"</em> notice on their Subscription page instead of a
                billing breakdown — they don't need to enter card details or worry about
                renewals. Independent doctors who signed up directly manage their own
                subscription.
              </p>
            </div>

            <Separator className="my-10" />

            {/* Step 8: Upgrades & cancellation */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  8
                </div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Upgrades, downgrades & cancellation</h2>
                  <p className="text-muted-foreground m-0">You're always in control</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Switch Monthly → Yearly</strong>: takes effect immediately and applies the 17% discount to the next charge.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Switch Yearly → Monthly</strong>: stays on Yearly until the current term ends, then bills monthly from renewal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Cancel</strong>: you keep full access until the end of the period you've already paid for. No partial refunds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Re-subscribe</strong>: your data is restored instantly — but the launch discount may no longer apply.</span>
                </li>
              </ul>
            </div>

            {/* Pro Tips */}
            <Card className="not-prose mb-8 border-success/20 bg-success/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Pro tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 m-0 list-none p-0">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Pay yearly if you can — two months free over twelve covers the cost of a small piece of equipment.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Use the trial to import a sample of patients and run real appointments — you'll know on day 10 if it fits your workflow.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Keep one card on file with auto-renewal on — paused accounts are the #1 reason clinics lose a day of bookings.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-destructive/20 bg-destructive/5 not-prose">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Pricing & currency</h4>
                    <p className="text-sm text-muted-foreground m-0">
                      All prices are in <strong>Pakistani Rupees (PKR)</strong>. We do not bill in
                      USD or any other currency. The launch discount is time-limited — once it
                      ends, new sign-ups will pay the standard PKR 23,999 / month rate.
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
                { title: "Payment Tracking", slug: "payment-tracking" },
                { title: "Managing Expenses", slug: "expenses" },
                { title: "How to Sign Up Your Clinic", slug: "clinic-signup" },
                { title: "Understanding Your Dashboard", slug: "dashboard-overview" },
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

const PaymentTrackingArticle = () => {
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
            <Link to={kbBase} className="hover:text-foreground transition-colors">Billing & Payments</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Payment Tracking</span>
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
              <Badge className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20">
                <Receipt className="w-3 h-3 mr-1" />
                Billing & Payments
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                8 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Payment Tracking
            </h1>
            <p className="text-xl text-muted-foreground">
              Track every rupee that moves through your clinic — consultation fees, procedure
              charges, doctor splits, and date-range totals — all from the Finance page.
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
                  "Where payments are recorded automatically",
                  "Reading the Finance dashboard",
                  "Filtering by date range and doctor",
                  "How clinic vs. doctor share is calculated",
                  "Logging walk-in and cash payments",
                  "Exporting and printing payment reports",
                  "Reconciling daily totals at end of shift",
                  "Common pitfalls to avoid",
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
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-3">Why payment tracking matters</h2>
              <p>
                A clinic that doesn't track payments cleanly bleeds money in three places —
                missed fees on walk-ins, miscalculated doctor splits, and end-of-month reports
                that don't match the cash drawer. Zonoir tracks every payment automatically as
                you record visits, so the Finance page is always a live, accurate picture of what
                your clinic earned.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Receipt, title: "Auto-captured", desc: "Every visit fee feeds Finance instantly" },
                  { icon: PieChart, title: "Split-aware", desc: "Clinic and doctor shares calculated for you" },
                  { icon: Download, title: "Audit-ready", desc: "Export totals to PDF or CSV in one click" },
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

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">1</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">How payments are recorded</h2>
                  <p className="text-muted-foreground m-0">No double entry — record once, see everywhere</p>
                </div>
              </div>
              <p>
                Payments are not entered separately in Zonoir. Instead, every appointment or
                walk-in lets you enter three fee fields when the visit is completed:
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Consultation fee</strong> — the doctor's standard charge for the visit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Procedure fee</strong> — anything done in-clinic (injection, dressing, ECG, ultrasound).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Other fee</strong> — registration, file charges, or any miscellaneous amount.</span>
                </li>
              </ul>
              <p className="mt-4">
                The system adds the three into a <strong>Total Fee</strong> for that visit and
                immediately rolls it into the day's revenue on the Finance page.
              </p>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">2</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Reading the Finance page</h2>
                  <p className="text-muted-foreground m-0">Clinic Finance / Doctor Finance — same idea, different scope</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Wallet, title: "Total Revenue", desc: "Sum of every Total Fee for the selected date range." },
                  { icon: Percent, title: "Clinic Share", desc: "Total Fee × clinic_percentage for each visit, summed up." },
                  { icon: Stethoscope, title: "Doctor Share", desc: "Total Fee minus Clinic Share — what the doctor takes home." },
                  { icon: TrendingUp, title: "Visit Count", desc: "Number of completed visits in the range — handy for averages." },
                  { icon: BarChart3, title: "Daily / Doctor breakdown", desc: "Charts showing which days and which doctors drive revenue." },
                ].map((card, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="py-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <card.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm m-0">{card.title}</h4>
                        <p className="text-sm text-muted-foreground m-0 mt-1">{card.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">3</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Filter the right way</h2>
                  <p className="text-muted-foreground m-0">Date range first, doctor second</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Date range</strong> — pick Today, This Week, This Month, or a custom span. Defaults to this month.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Doctor filter</strong> (clinics only) — narrow to one practitioner to see their share alone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Status</strong> — only <em>Completed</em> visits are counted. Cancelled and pending visits are excluded automatically.</span>
                </li>
              </ul>
              <Card className="not-prose mt-4 border-cyan-500/20 bg-cyan-500/5">
                <CardContent className="py-5">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                    <p className="text-sm m-0">
                      Tip: when reconciling at end of day, set the date to <em>Today</em> and
                      compare the Total Revenue on screen to the cash + card slips in the drawer.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">4</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Clinic vs. doctor share</h2>
                  <p className="text-muted-foreground m-0">A simple percentage on every visit</p>
                </div>
              </div>
              <p>
                Each doctor on a clinic has a <strong>clinic percentage</strong> set on their
                profile (e.g. 30% to clinic, 70% to doctor). When a visit is recorded, Zonoir
                computes:
              </p>
              <div className="not-prose mt-4 rounded-lg border bg-card font-mono text-sm">
                <div className="px-5 py-3 border-b">
                  <span className="text-muted-foreground">Clinic Share = </span>
                  <span>Total Fee × clinic_percentage / 100</span>
                </div>
                <div className="px-5 py-3">
                  <span className="text-muted-foreground">Doctor Share = </span>
                  <span>Total Fee − Clinic Share</span>
                </div>
              </div>
              <p className="mt-4">
                If you change a doctor's percentage later, only <em>future</em> visits use the new
                rate — historical totals stay locked at the rate that was in effect when each
                visit was recorded.
              </p>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">5</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Walk-ins and cash visits</h2>
                  <p className="text-muted-foreground m-0">Same flow, no appointment needed</p>
                </div>
              </div>
              <p>
                Walk-ins follow the exact same payment flow. Open the Walk-in screen, pick or
                create the patient, fill in the visit details and the three fee fields, save —
                the revenue lands in Finance the moment you hit save. There is no separate
                "payment" button to remember.
              </p>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">6</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Export and print</h2>
                  <p className="text-muted-foreground m-0">Reports for owners, accountants, and tax</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>CSV export</strong> — full visit-level breakdown with patient, doctor, fees, and shares. Open in Excel for your own pivots.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Printer className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Print report</strong> — formatted PDF with date range, totals, and per-doctor breakdown. Hand to the owner or auditor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Download className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Per-doctor summary</strong> — switch the doctor filter and re-export to give each doctor their own statement.</span>
                </li>
              </ul>
            </div>

            <Card className="not-prose mb-8 border-success/20 bg-success/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Pro tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 m-0 list-none p-0">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Reconcile daily, not weekly — small mismatches are cheap to fix on the same day.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Use the <em>Other</em> fee for registration or file charges so consultation totals stay clean.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Pair Payment Tracking with the <Link to={`${kbBase}/expenses`} className="underline">Managing Expenses</Link> page for a true profit picture.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5 not-prose">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Common pitfalls</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 m-0 list-none p-0">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Forgetting to mark a visit as <em>Completed</em> — pending visits don't count toward revenue.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Editing fees days later — always edit on the same day so daily totals stay reliable.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>All amounts are in <strong>PKR</strong>. Don't enter dollars or any other currency.</span>
                      </li>
                    </ul>
                  </div>
                </div>
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
                { title: "Understanding Your Subscription", slug: "subscription" },
                { title: "Managing Expenses", slug: "expenses" },
                { title: "Recording Patient Visits", slug: "visit-records" },
                { title: "Managing Walk-ins", slug: "walk-ins" },
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

const ManagingExpensesArticle = () => {
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
            <Link to={kbBase} className="hover:text-foreground transition-colors">Billing & Payments</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Managing Expenses</span>
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
              <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20">
                <Receipt className="w-3 h-3 mr-1" />
                Billing & Payments
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                7 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Managing Expenses
            </h1>
            <p className="text-xl text-muted-foreground">
              Log every rupee that leaves your clinic — rent, salaries, utilities, supplies — so
              your real profit shows up next to your revenue, not just on paper.
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
                  "Where to find the Expenses page",
                  "Adding a new expense in seconds",
                  "Choosing the right category",
                  "Filtering by date range and category",
                  "Editing and deleting past expenses",
                  "Tying expenses to revenue for true profit",
                  "Best practices for monthly bookkeeping",
                  "Common mistakes to avoid",
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
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-3">Why expense tracking matters</h2>
              <p>
                Revenue alone never tells the full story. A clinic doing Rs 800,000 a month in
                consultations can still close the year in the red if rent, salaries, and supplies
                aren't being watched. Zonoir's Expenses module gives clinic owners a single place
                to log every payout — so the moment you open Finance, you see real profit, not
                just gross income.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Receipt, title: "One place", desc: "Every clinic cost in a single ledger" },
                  { icon: Filter, title: "Filterable", desc: "Slice by date or category in one click" },
                  { icon: TrendingDown, title: "Profit-aware", desc: "Pairs with revenue for true margin" },
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

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">1</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Where to find Expenses</h2>
                  <p className="text-muted-foreground m-0">A clinic-only page in your sidebar</p>
                </div>
              </div>
              <p>
                Expenses is available to <strong>clinic owners only</strong>. Doctors and
                receptionists do not see the page — this keeps payroll and rent data private to the
                owner.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Web:</strong> Clinic sidebar &rarr; <em>Expenses</em>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Mobile app:</strong> <em>More</em> tab &rarr; <em>Expenses</em>.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">2</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Add a new expense</h2>
                  <p className="text-muted-foreground m-0">Four fields, ten seconds</p>
                </div>
              </div>
              <p>
                Click <strong>Add Expense</strong> (or the floating + button on mobile) and fill
                in:
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CalendarDays className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Date</strong> — defaults to today. Backdate it if you're catching up on last week's bills.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Category</strong> — pick from the preset list (see step 3).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Wallet className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Amount (PKR)</strong> — whole or decimal rupees. No currency symbols.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Description</strong> (optional) — vendor name, invoice number, or a short note like "Nov electricity bill".</span>
                </li>
              </ul>
              <p className="mt-4">
                Hit <strong>Save</strong> and the expense lands in the ledger immediately.
              </p>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">3</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Pick the right category</h2>
                  <p className="text-muted-foreground m-0">Nine presets cover almost every clinic cost</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Building2, title: "Rent", desc: "Monthly clinic premises rent or lease." },
                  { icon: Zap, title: "Utilities", desc: "Electricity, gas, water, internet, phone." },
                  { icon: Users, title: "Salaries", desc: "Staff wages — receptionists, cleaners, helpers, in-house nurses." },
                  { icon: Activity, title: "Equipment", desc: "Dental chairs, ECG machines, ultrasound, BP monitors, computers." },
                  { icon: Briefcase, title: "Supplies", desc: "Disposables, gloves, syringes, gauze, printer paper, stationery." },
                  { icon: RefreshCw, title: "Maintenance", desc: "Equipment servicing, AC repair, generator fuel, plumbing." },
                  { icon: Shield, title: "Insurance", desc: "Premises insurance, malpractice, equipment cover." },
                  { icon: Sparkles, title: "Marketing", desc: "Boards, leaflets, paid social posts, SEO, photography." },
                  { icon: Receipt, title: "Miscellaneous", desc: "Anything that doesn't fit the categories above." },
                ].map((c, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="py-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <c.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm m-0">{c.title}</h4>
                        <p className="text-sm text-muted-foreground m-0 mt-1">{c.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="not-prose mt-4 border-cyan-500/20 bg-cyan-500/5">
                <CardContent className="py-5">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                    <p className="text-sm m-0">
                      Tip: be consistent. If you log this month's electricity bill under
                      <em> Utilities</em>, log every electricity bill there. Switching categories
                      makes month-over-month comparisons unreliable.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">4</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Filter and review</h2>
                  <p className="text-muted-foreground m-0">Find any expense in seconds</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Date range</strong> — pick a start and end date to see only that window's expenses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Category filter</strong> — narrow to a single category (e.g. only <em>Salaries</em>) to spot trends.</span>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Total card</strong> — the top-of-page total updates with your filters, so you instantly know what you spent in any window.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">5</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Edit or delete</h2>
                  <p className="text-muted-foreground m-0">Mistakes happen — fix them in place</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Tap any row (mobile) or click the <strong>Edit</strong> icon (web) to change date, category, amount, or note.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Use the <strong>Delete</strong> icon to remove a duplicate or wrong entry. Deletions are permanent — there is no trash bin.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">6</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">From expenses to true profit</h2>
                  <p className="text-muted-foreground m-0">The simple equation every owner should run weekly</p>
                </div>
              </div>
              <div className="not-prose mt-4 rounded-lg border bg-card font-mono text-sm">
                <div className="px-5 py-3 border-b">
                  <span className="text-muted-foreground">Net Profit = </span>
                  <span>Revenue (Finance) &minus; Expenses (this page)</span>
                </div>
                <div className="px-5 py-3">
                  <span className="text-muted-foreground">Margin % = </span>
                  <span>Net Profit &divide; Revenue &times; 100</span>
                </div>
              </div>
              <p className="mt-4">
                Open <Link to={`${kbBase}/payment-tracking`} className="underline">Payment Tracking</Link> for
                the same date range, subtract the Expenses total, and you have your real take-home
                for the period — not the fluffy gross figure that hides costs.
              </p>
            </div>

            <Card className="not-prose mb-8 border-success/20 bg-success/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Pro tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 m-0 list-none p-0">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Log expenses on the same day the payment is made — paper bills get lost in a week.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Put the invoice or receipt number in the description — makes auditing trivial.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Block 10 minutes every Friday to enter the week's small cash expenses (cleaning, tea, sundries).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>For salaries, log each staff payment as a separate row with the staff name in the description — easier to verify later.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5 not-prose">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Common pitfalls</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 m-0 list-none p-0">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Logging personal spending under <em>Miscellaneous</em> — keep household and clinic costs strictly separate.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Lumping a year's rent into one entry — log each month so date-range filters work properly.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Switching the same recurring bill between categories — pick one and stick with it forever.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>All amounts are in <strong>PKR</strong>. Don't enter dollars or any other currency.</span>
                      </li>
                    </ul>
                  </div>
                </div>
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
                { title: "Payment Tracking", slug: "payment-tracking" },
                { title: "Understanding Your Subscription", slug: "subscription" },
                { title: "Recording Patient Visits", slug: "visit-records" },
                { title: "Understanding Your Dashboard", slug: "dashboard-overview" },
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

const ResetPasswordArticle = () => {
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
            <Link to={kbBase} className="hover:text-foreground transition-colors">Account & Security</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Resetting Your Password</span>
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
              <Badge className="bg-violet-500/10 text-violet-600 hover:bg-violet-500/20">
                <Shield className="w-3 h-3 mr-1" />
                Account & Security
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                5 min read
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Resetting Your Password
            </h1>
            <p className="text-xl text-muted-foreground">
              Forgot your Zonoir password? Reset it yourself in under two minutes — from any
              device, without contacting support. Works for clinic owners, doctors, receptionists,
              and admins.
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
                  "Where to find the Forgot Password link",
                  "Requesting a reset email",
                  "Opening the secure reset link",
                  "Choosing a strong new password",
                  "Why some accounts can't reset",
                  "What to do if the email doesn't arrive",
                  "Password rules and best practices",
                  "When to contact your clinic owner or support",
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
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-3">When you need this</h2>
              <p>
                You forgot your password, you're locked out after too many wrong attempts, or you
                just want to rotate to a stronger one. Zonoir uses a self-service reset flow — a
                one-time secure link is emailed to the address on your account, and you set a new
                password yourself. Nobody at Zonoir (or your clinic) ever sees your password.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Mail, title: "Email-based", desc: "A unique link is sent to your registered email" },
                  { icon: Shield, title: "Secure", desc: "Link expires in 1 hour and works only once" },
                  { icon: Smartphone, title: "Any device", desc: "Works on web and the mobile app" },
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

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">1</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the login page</h2>
                  <p className="text-muted-foreground m-0">Same page you normally sign in from</p>
                </div>
              </div>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Clinic owners, doctors, receptionists:</strong> go to the main <em>Login</em> page on zonoir.com.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Admins / content writers:</strong> use the <em>Admin Login</em> page.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span><strong>Mobile app:</strong> open the app, tap <em>Forgot Password</em> on the login screen, or go to <em>More → Profile → Change Password</em>.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">2</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Click "Forgot your password?"</h2>
                  <p className="text-muted-foreground m-0">The small link below the password field</p>
                </div>
              </div>
              <p>
                On every Zonoir login screen there is a <strong>Forgot your password?</strong> link
                directly below the password input. Click it and you'll land on the reset request
                page.
              </p>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">3</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Enter your registered email</h2>
                  <p className="text-muted-foreground m-0">The same email you use to sign in</p>
                </div>
              </div>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Type your email exactly as it's stored on your account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Click <strong>Send Reset Link</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>You'll see a green "Check Your Email" confirmation on the page.</span>
                </li>
              </ul>
              <Card className="not-prose mt-4 border-amber-500/20 bg-amber-500/5">
                <CardContent className="py-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm m-0">
                      <strong>Doctors and receptionists added by a clinic:</strong> use the email
                      address your clinic owner set when creating your account. If you're not sure
                      what that is, ask the clinic owner to check your profile.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">4</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Open the email and click the link</h2>
                  <p className="text-muted-foreground m-0">From "Zonoir &lt;noreply@zonoir.com&gt;"</p>
                </div>
              </div>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Subject line: <em>"Zonoir - Password Reset Request"</em>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Tap the <strong>Reset Password</strong> button — or copy the long link into your browser.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>The link expires in <strong>1 hour</strong> and can only be used <strong>once</strong>. Request a new one if it's older than that.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">5</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Choose a new password</h2>
                  <p className="text-muted-foreground m-0">Make it strong — you'll only set it once</p>
                </div>
              </div>
              <p>
                The link drops you on the <strong>Reset Password</strong> page. Enter your new
                password twice (to catch typos) and click <strong>Update Password</strong>. You'll
                be signed in automatically and redirected to your dashboard.
              </p>
              <Card className="not-prose mt-4 border-primary/20 bg-primary/5">
                <CardContent className="py-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Password rules
                  </h4>
                  <ul className="text-sm space-y-2 m-0 list-none p-0">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Minimum <strong>8 characters</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Mix upper, lower, a number, and a symbol for the strongest score.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Don't reuse a password from another website — patient data lives behind this login.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Avoid clinic name, phone number, or "Password123" — these are guessed first.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">6</div>
                <div>
                  <h2 className="text-2xl font-bold m-0">Sign in with the new password</h2>
                  <p className="text-muted-foreground m-0">From any device — desktop, tablet, mobile app</p>
                </div>
              </div>
              <p>
                Your old password is permanently invalidated the moment you save the new one.
                Update any saved passwords in your browser or password manager so they don't auto-fill
                the stale value.
              </p>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Why some accounts can't reset</h2>
              <p>
                Zonoir checks eligibility before sending the link. If your account isn't allowed to
                reset, you'll see a clear message on screen instead of the email being sent.
              </p>
              <div className="space-y-3 mt-4">
                {[
                  {
                    icon: AlertCircle,
                    title: "Clinic Not Active",
                    desc: "Your clinic's status is pending, suspended, or its billing cycle is overdue. The clinic owner must clear the unpaid invoice in Monthly Payments first — then everyone in that clinic can sign in and reset again.",
                  },
                  {
                    icon: AlertCircle,
                    title: "Account Not Active",
                    desc: "Your individual doctor or receptionist account has been set to inactive or draft. Ask your clinic owner to reactivate you from the Doctors or Receptionists page.",
                  },
                  {
                    icon: AlertCircle,
                    title: "Email not found",
                    desc: "The email you entered isn't on any Zonoir account. Double-check spelling, and try the exact address you used to sign up or that your clinic owner used to create your profile.",
                  },
                ].map((c, idx) => (
                  <Card key={idx} className="border-destructive/20 bg-destructive/5">
                    <CardContent className="py-4 flex items-start gap-4">
                      <c.icon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm m-0">{c.title}</h4>
                        <p className="text-sm text-muted-foreground m-0 mt-1">{c.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-10" />

            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Email didn't arrive?</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Wait <strong>2–3 minutes</strong> — delivery is usually instant but can occasionally be delayed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Check your <strong>Spam / Junk / Promotions</strong> folder. Mark <em>noreply@zonoir.com</em> as "Not spam" so the next one lands in your inbox.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Make sure you typed the email correctly — a single missing letter sends the link to nobody.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>Click <strong>Try a Different Email</strong> on the confirmation screen if you used the wrong address.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>If your inbox is full or your mail server is blocking external senders, the email will silently drop — free up space and try again.</span>
                </li>
              </ul>
            </div>

            <Card className="not-prose mb-8 border-success/20 bg-success/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Pro tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 m-0 list-none p-0">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Use a password manager (Apple Keychain, Google Password Manager, 1Password, Bitwarden) to store the new password — you'll never have to reset again.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Rotate your password every 6–12 months, especially if a staff member who knew it has left the clinic.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>Never share your password over WhatsApp or SMS — every staff member should have their own account instead.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>If you suspect someone else used your account, reset the password immediately — it logs every other session out.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5 not-prose">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Common pitfalls</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 m-0 list-none p-0">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Clicking an old reset link — they expire in 1 hour. Always request a fresh one.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Opening the reset link, then closing the page without saving — your old password is still active until you click <em>Update Password</em>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Trying to reset a clinic-staff account while the clinic's billing is overdue — settle the invoice first, then reset.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span>Asking your clinic owner for "my password" — nobody (not Zonoir, not the owner) can see it. They can only trigger a reset link the same way you can.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-3">Still stuck?</h2>
              <p>
                If you've tried the steps above and still can't get in, contact your clinic owner
                (they can verify your email on file) or reach Zonoir support via the contact form
                on the website. Include the email you're trying to reset and a screenshot of the
                error message — it speeds the fix up dramatically.
              </p>
            </div>
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
                { title: "How to Sign Up Your Clinic", slug: "clinic-signup" },
                { title: "How to Add Doctors in Your Clinic", slug: "add-doctors" },
                { title: "Managing Receptionists", slug: "manage-receptionists" },
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
