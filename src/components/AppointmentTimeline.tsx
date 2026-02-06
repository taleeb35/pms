import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isYesterday } from "date-fns";
import { MessageCircle, FileText, Calendar, DollarSign, UserPlus, Clock, CheckCircle, XCircle, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLogger";

interface TimelineEvent {
  id: string;
  type: "comment" | "status_change" | "visit_record" | "fee_update" | "created" | "next_visit";
  message: string;
  created_at: string;
  actor_name?: string;
  actor_initials?: string;
  details?: Record<string, unknown>;
}

interface AppointmentTimelineProps {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
}

export const AppointmentTimeline = ({ 
  appointmentId, 
  patientId,
  patientName,
  doctorId 
}: AppointmentTimelineProps) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; initials: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchTimelineEvents();
  }, [appointmentId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      
      const name = profile?.full_name || user.email || "User";
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      setCurrentUser({ id: user.id, name, initials });
    }
  };

  const fetchTimelineEvents = async () => {
    setLoading(true);
    try {
      // Fetch activity logs for this appointment
      const { data: activityLogs, error: logsError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("entity_id", appointmentId)
        .order("created_at", { ascending: false });

      if (logsError) throw logsError;

      // Fetch visit records for this appointment
      const { data: visitRecords, error: visitError } = await supabase
        .from("visit_records")
        .select("id, created_at, updated_at, chief_complaint, next_visit_date")
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: false });

      if (visitError) throw visitError;

      // Fetch appointment creation info
      const { data: appointment, error: aptError } = await supabase
        .from("appointments")
        .select("created_at, status, consultation_fee, procedure_fee, other_fee")
        .eq("id", appointmentId)
        .single();

      if (aptError) throw aptError;

      // Build timeline events
      const timelineEvents: TimelineEvent[] = [];

      // Add appointment creation event
      timelineEvents.push({
        id: `created-${appointmentId}`,
        type: "created",
        message: `Appointment created for ${patientName}`,
        created_at: appointment.created_at,
        actor_name: "System",
        actor_initials: "SY",
      });

      // Add activity log events
      if (activityLogs) {
        activityLogs.forEach((log) => {
          const details = log.details as Record<string, unknown> | null;
          const actorName = details?.actorName as string || "Unknown";
          const initials = actorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

          let eventType: TimelineEvent["type"] = "comment";
          let message = getActionMessage(log.action, details);

          if (log.action.includes("status")) {
            eventType = "status_change";
          } else if (log.action.includes("fee") || log.action.includes("discount") || log.action.includes("refund")) {
            eventType = "fee_update";
          } else if (log.action.includes("visit_record")) {
            eventType = "visit_record";
          }

          timelineEvents.push({
            id: log.id,
            type: eventType,
            message,
            created_at: log.created_at,
            actor_name: actorName,
            actor_initials: initials,
            details: details || undefined,
          });
        });
      }

      // Add visit record events
      if (visitRecords) {
        visitRecords.forEach((record) => {
          if (record.chief_complaint) {
            timelineEvents.push({
              id: `visit-${record.id}`,
              type: "visit_record",
              message: `Visit recorded: ${record.chief_complaint.slice(0, 100)}${record.chief_complaint.length > 100 ? "..." : ""}`,
              created_at: record.created_at,
              actor_name: "Doctor",
              actor_initials: "DR",
            });
          }

          if (record.next_visit_date) {
            timelineEvents.push({
              id: `next-visit-${record.id}`,
              type: "next_visit",
              message: `Follow-up scheduled for ${format(new Date(record.next_visit_date), "MMMM d, yyyy")}`,
              created_at: record.updated_at || record.created_at,
              actor_name: "Doctor",
              actor_initials: "DR",
            });
          }
        });
      }

      // Sort by date descending
      timelineEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setEvents(timelineEvents);
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionMessage = (action: string, details: Record<string, unknown> | null): string => {
    const patientName = details?.patient_name as string || "patient";
    const newStatus = details?.new_status as string || "";
    const oldStatus = details?.old_status as string || "";

    switch (action) {
      case "appointment_created":
        return `Appointment created for ${patientName}`;
      case "appointment_status_changed":
        return `Status changed from ${oldStatus || "unknown"} to ${newStatus}`;
      case "appointment_completed":
        return `Appointment marked as completed`;
      case "appointment_cancelled":
        return `Appointment was cancelled`;
      case "fee_updated":
        return `Consultation fee was updated`;
      case "procedure_set":
        return `Procedure was assigned to appointment`;
      case "discount_applied":
        return `Discount was applied`;
      case "refund_applied":
        return `Refund was processed`;
      case "visit_record_created":
        return `Visit record was created`;
      case "visit_record_updated":
        return `Visit record was updated`;
      default:
        return action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    setPosting(true);
    try {
      await logActivity({
        action: "appointment_comment_added",
        entityType: "appointment",
        entityId: appointmentId,
        details: {
          comment: newComment.trim(),
          patient_name: patientName,
        },
      });

      toast({ title: "Comment posted" });
      setNewComment("");
      fetchTimelineEvents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="h-4 w-4" />;
      case "status_change":
        return <CheckCircle className="h-4 w-4" />;
      case "visit_record":
        return <Stethoscope className="h-4 w-4" />;
      case "fee_update":
        return <DollarSign className="h-4 w-4" />;
      case "created":
        return <UserPlus className="h-4 w-4" />;
      case "next_visit":
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, "MMMM d, yyyy");
  };

  const formatEventTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = formatEventDate(event.created_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          {currentUser && (
            <Avatar className="h-9 w-9 bg-primary text-primary-foreground">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              className="resize-none bg-background"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Only you and other staff can see comments
              </span>
              <Button 
                size="sm" 
                onClick={handlePostComment}
                disabled={!newComment.trim() || posting}
              >
                {posting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Events */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading timeline...</div>
            ) : Object.keys(groupedEvents).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No activity yet</div>
            ) : (
              Object.entries(groupedEvents).map(([dateLabel, dateEvents]) => (
                <div key={dateLabel} className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">{dateLabel}</div>
                  <div className="space-y-3">
                    {dateEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3">
                        <div className="relative">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2" />
                          <div className="absolute top-4 left-[3px] w-[2px] h-full bg-border -z-10" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm leading-relaxed">
                              {event.message}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatEventTime(event.created_at)}
                            </span>
                          </div>
                          {event.details?.comment && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                              {event.details.comment as string}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
