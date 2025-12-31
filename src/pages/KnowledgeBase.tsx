import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Building2, 
  Stethoscope, 
  Users, 
  Calendar, 
  CreditCard, 
  Settings,
  ChevronRight,
  BookOpen,
  HelpCircle,
  FileText,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of setting up your account",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    articles: [
      { title: "How to Sign Up Your Clinic", slug: "clinic-signup", isNew: true },
      { title: "How to Sign Up as a Single Doctor", slug: "doctor-signup" },
      { title: "Understanding Your Dashboard", slug: "dashboard-overview" },
    ]
  },
  {
    id: "clinics",
    title: "For Clinics",
    description: "Everything about managing your clinic",
    icon: Building2,
    color: "from-emerald-500 to-emerald-600",
    articles: [
      { title: "Adding Doctors to Your Clinic", slug: "add-doctors" },
      { title: "Managing Receptionists", slug: "manage-receptionists" },
      { title: "Setting Up Specializations", slug: "specializations" },
    ]
  },
  {
    id: "doctors",
    title: "For Doctors",
    description: "Guides for managing your practice",
    icon: Stethoscope,
    color: "from-purple-500 to-purple-600",
    articles: [
      { title: "Managing Your Schedule", slug: "doctor-schedule" },
      { title: "Creating Prescription Templates", slug: "prescription-templates" },
      { title: "Recording Patient Visits", slug: "visit-records" },
    ]
  },
  {
    id: "patients",
    title: "Patient Management",
    description: "Learn how to manage patient records",
    icon: Users,
    color: "from-amber-500 to-amber-600",
    articles: [
      { title: "Adding New Patients", slug: "add-patients" },
      { title: "Managing Medical Records", slug: "medical-records" },
      { title: "Patient History & Documents", slug: "patient-history" },
    ]
  },
  {
    id: "appointments",
    title: "Appointments",
    description: "Scheduling and managing appointments",
    icon: Calendar,
    color: "from-rose-500 to-rose-600",
    articles: [
      { title: "Booking Appointments", slug: "book-appointments" },
      { title: "Managing Walk-ins", slug: "walk-ins" },
      { title: "Appointment Calendar", slug: "appointment-calendar" },
    ]
  },
  {
    id: "billing",
    title: "Billing & Payments",
    description: "Handle finances and invoicing",
    icon: CreditCard,
    color: "from-cyan-500 to-cyan-600",
    articles: [
      { title: "Understanding Your Subscription", slug: "subscription" },
      { title: "Payment Tracking", slug: "payment-tracking" },
      { title: "Managing Expenses", slug: "expenses" },
    ]
  },
];

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    searchQuery === "" || category.articles.length > 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            Help Center
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            Knowledge Base
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Everything you need to know about using our clinic management system. 
            Find guides, tutorials, and answers to common questions.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for articles, guides, tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-background/80 backdrop-blur-sm border-border/50 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 -mt-6 mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          {["Getting Started", "Appointments", "Billing", "Troubleshooting"].map((tag) => (
            <Badge key={tag} variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      {/* Featured Article */}
      <section className="container mx-auto px-4 mb-16">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-8 lg:p-12">
              <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
                <FileText className="w-3 h-3 mr-1" />
                Featured Guide
              </Badge>
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">How to Sign Up Your Clinic</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                A complete step-by-step guide to registering your clinic and getting started 
                with our platform in just 5 minutes.
              </p>
              <Link to="/knowledge-base/clinic-signup">
                <Button size="lg" className="gap-2">
                  Read Full Guide
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="lg:w-80 bg-gradient-to-br from-primary/20 to-primary/30 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-background rounded-2xl flex items-center justify-center shadow-xl">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
                <p className="text-sm font-medium">5 min read</p>
                <p className="text-xs text-muted-foreground">Updated Dec 2025</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <Link 
                        to={`/knowledge-base/${article.slug}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group/item"
                      >
                        <span className="text-sm flex items-center gap-2">
                          {article.title}
                          {article.isNew && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">New</Badge>
                          )}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Need Help CTA */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Still need help?</h3>
                <p className="text-muted-foreground">Our support team is here to assist you</p>
              </div>
            </div>
            <Link to="/contact">
              <Button variant="outline" size="lg">Contact Support</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <PublicFooter />
    </div>
  );
};

export default KnowledgeBase;
