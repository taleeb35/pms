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
import { KBHeader as PublicHeader, KBFooter as PublicFooter, useKBBase } from "@/contexts/KnowledgeBaseContext";


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

const KnowledgeBaseArticle = () => {
  const kbBase = useKBBase();
  const { slug } = useParams();

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
