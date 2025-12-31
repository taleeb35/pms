import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, Send, MessageSquare, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { validateText } from "@/lib/validations";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface TicketMessage {
  id: string;
  message: string;
  sender_role: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const DoctorSupport = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchDoctorProfile();
    fetchTickets();
    fetchSupportEmail();
  }, []);

  const fetchSupportEmail = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "support_email")
      .single();

    if (data) {
      setSupportEmail(data.value);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      
      // Set up realtime subscription for messages
      const channel = supabase
        .channel('ticket-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_messages',
            filter: `ticket_id=eq.${selectedTicket.id}`
          },
          () => {
            fetchMessages(selectedTicket.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket]);

  const fetchDoctorProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
  };

  const fetchTickets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("support_tickets")
      .select("id, subject, message, status, created_at")
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tickets:", error);
      return;
    }

    setTickets(data || []);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data, error } = await supabase
      .from("ticket_messages")
      .select(`
        id,
        message,
        sender_role,
        created_at,
        profiles!ticket_messages_sender_id_fkey (
          full_name
        )
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
      return;
    }

    setMessages(data || []);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSendingReply(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        sender_role: "doctor",
        message: replyMessage,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } else {
      setReplyMessage("");
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    }

    setSendingReply(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors: Record<string, string> = {};
    
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a ticket",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("support_tickets").insert({
      doctor_id: user.id,
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your support ticket has been submitted successfully!",
      });
      setFormData(prev => ({
        ...prev,
        subject: "",
        message: "",
      }));
      fetchTickets();
    }

    setLoading(false);
  };

  const handleViewThread = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Support</h2>
        <p className="text-muted-foreground">Submit a support ticket or view your tickets</p>
      </div>

      {supportEmail && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Support Email</p>
                <p className="text-lg font-semibold text-foreground">{supportEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Create Support Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
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
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Please provide detailed information about your issue"
                rows={6}
                required
                maxLength={2000}
                className={formErrors.message ? "border-destructive" : ""}
              />
              {formErrors.message && <p className="text-sm text-destructive">{formErrors.message}</p>}
            </div>

            <Button type="submit" disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tickets found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={ticket.status === "open" ? "default" : ticket.status === "in_progress" ? "secondary" : "outline"}
                        className="text-base capitalize"
                      >
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewThread(ticket)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Thread
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Ticket Thread: {selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Status</p>
                <Badge 
                  variant={selectedTicket.status === "open" ? "default" : selectedTicket.status === "in_progress" ? "secondary" : "outline"}
                  className="text-base capitalize"
                >
                  {selectedTicket.status.replace('_', ' ')}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Initial Message</p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Conversation Thread</p>
                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No replies yet. Wait for admin response.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_role === "doctor" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.sender_role === "doctor"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-xs font-medium mb-1">
                              {msg.profiles?.full_name} ({msg.sender_role})
                            </p>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Send Reply</p>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleSendReply} disabled={sendingReply || !replyMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {sendingReply ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorSupport;
