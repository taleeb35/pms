import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Mail, Phone, MapPin, Clock, MessageSquare, Calendar, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    subject: "",
    message: "",
    requestType: "inquiry",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast.success("Your message has been sent successfully!");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again or email us directly at hello@zonoir.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full text-center p-8 border-primary/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Thank You!</h2>
                <p className="text-muted-foreground mb-6">
                  Your message has been received. Our team will get back to you within 24-48 hours.
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/">Return to Home</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        organization: "",
                        subject: "",
                        message: "",
                        requestType: "inquiry",
                      });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <PublicHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Let's Start a{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Conversation
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about Zonoir? Want to schedule a demo? We're here to help you transform your clinic
            management.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Cards */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                    <p className="text-muted-foreground text-sm mb-2">For general inquiries and support</p>
                    <a href="mailto:hello@zonoir.com" className="text-primary hover:underline font-medium">
                      hello@zonoir.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                    <p className="text-muted-foreground text-sm mb-2">Mon-Fri from 9am to 6pm</p>
                    <a href="tel:+923004313139" className="text-primary hover:underline font-medium">
                      +92 300 4313139
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Visit Us</h3>
                    <p className="text-muted-foreground text-sm mb-2">Our Office</p>
                    <p className="text-foreground">
                      140 B, Khayaban e Amin,
                      <br />
                      Lahore,
                      <br />
                      Pakistan 54000
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                    <p className="text-muted-foreground text-sm mb-2">When we're available</p>
                    <div className="text-foreground text-sm space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 2:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 border-0">
              <CardContent className="p-6 text-primary-foreground">
                <Calendar className="w-10 h-10 mb-4" />
                <h3 className="font-semibold text-xl mb-2">Schedule a Demo</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  See Zonoir in action with a personalized demo from our team.
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    window.open("https://calendar.app.google/vkzUUndGFT4Afq1D9", "_blank");
                  }}
                >
                  Request Demo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Send us a Message</h2>
                    <p className="text-muted-foreground text-sm">Fill out the form and we'll get back to you shortly</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Request Type */}
                  <div id="request-type">
                    <Label htmlFor="requestType" className="text-foreground font-medium">
                      What can we help you with? *
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {[
                        { value: "inquiry", label: "General Inquiry" },
                        { value: "demo", label: "Request Demo" },
                        { value: "pricing", label: "Pricing Info" },
                        { value: "support", label: "Technical Support" },
                        { value: "partnership", label: "Partnership" },
                        { value: "other", label: "Other" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, requestType: option.value })}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                            formData.requestType === option.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Dr. John Smith"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@clinic.com"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Phone and Organization */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-foreground font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+92 300 123 4567"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization" className="text-foreground font-medium">
                        Clinic/Organization Name
                      </Label>
                      <Input
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="Your Clinic Name"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject" className="text-foreground font-medium">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                      className="mt-2"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-foreground font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your requirements, questions, or how we can assist you..."
                      required
                      rows={5}
                      className="mt-2 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-center text-muted-foreground text-sm">
                    By submitting this form, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>
                    .
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Find Our Office</h2>
            <p className="text-muted-foreground">Visit us at our headquarters in Lahore, Pakistan</p>
          </div>
          <Card className="border-primary/20 overflow-hidden">
            <div className="aspect-[21/9] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
              <div className="text-center z-10">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MapPin className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">Zonoir Headquarters</h3>
                <p className="text-muted-foreground">123 Healthcare Avenue, Gulberg III, Lahore, Pakistan 54000</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default Contact;
