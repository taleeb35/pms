import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { validateEmail, validateText } from "@/lib/validations";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const ClinicSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchUserData();
    fetchTickets();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.full_name,
          email: profile.email,
        }));
      }
    }
  };

  const fetchTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, subject, message, status, created_at")
        .eq("clinic_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors: Record<string, string> = {};
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.message;
    
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    } else if (formData.subject.length > 200) {
      errors.subject = "Subject must be less than 200 characters";
    }
    
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else {
      const messageValidation = validateText(formData.message, 2000);
      if (!messageValidation.isValid) errors.message = messageValidation.message;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const missingFields = Object.values(errors).join(", ");
      toast({ 
        title: "Missing Required Fields", 
        description: missingFields,
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("support_tickets").insert({
        clinic_id: user.id,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: "open",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Support ticket created successfully. Our team will respond soon.",
      });

      // Reset form
      setFormData(prev => ({
        name: prev.name,
        email: prev.email,
        subject: "",
        message: "",
      }));

      // Refresh tickets
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in_progress":
        return "bg-amber-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/clinic/dashboard")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create New Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Create Support Ticket
            </CardTitle>
            <CardDescription>
              Need more doctor slots or have questions? Contact our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Request to increase doctor limit"
                  required
                  maxLength={200}
                  className={formErrors.subject ? "border-destructive" : ""}
                />
                {formErrors.subject && <p className="text-sm text-destructive">{formErrors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your request in detail..."
                  rows={6}
                  required
                  maxLength={2000}
                  className={formErrors.message ? "border-destructive" : ""}
                />
                {formErrors.message && <p className="text-sm text-destructive">{formErrors.message}</p>}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Send className="h-4 w-4" />
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Tickets
            </CardTitle>
            <CardDescription>
              View the status of your support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTickets ? (
              <p className="text-center text-muted-foreground py-8">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tickets yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <Badge 
                        className={`${getStatusColor(ticket.status)} text-white`}
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.message}
                    </p>
                    <Separator />
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicSupport;
