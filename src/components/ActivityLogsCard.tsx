import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Activity, User, Calendar, Stethoscope, Percent, RefreshCw } from "lucide-react";
import { getActionLabel } from "@/lib/activityLogger";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: unknown;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  } | null;
}

interface ActivityLogsCardProps {
  doctorId?: string;
  clinicId?: string;
}

export const ActivityLogsCard = ({ doctorId, clinicId }: ActivityLogsCardProps) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [doctorId, clinicId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          details,
          created_at,
          user_id,
          profiles:user_id (
            full_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs((data || []) as unknown as ActivityLog[]);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "patient_created":
        return <User className="h-4 w-4" />;
      case "appointment_created":
      case "appointment_updated":
        return <Calendar className="h-4 w-4" />;
      case "procedure_set":
        return <Stethoscope className="h-4 w-4" />;
      case "discount_applied":
        return <Percent className="h-4 w-4" />;
      case "refund_applied":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "patient_created":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "appointment_created":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "appointment_updated":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "procedure_set":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "discount_applied":
        return "bg-orange-500/10 text-orange-600 border-orange-200";
      case "refund_applied":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDetails = (log: ActivityLog): string => {
    const details = log.details as Record<string, unknown> | null;
    if (!details || typeof details !== 'object') return "";

    const parts: string[] = [];
    
    if (details.patient_name) {
      parts.push(`Patient: ${details.patient_name}`);
    }
    if (details.procedure_name) {
      parts.push(`Procedure: ${details.procedure_name}`);
    }
    if (details.procedure_fee !== undefined) {
      parts.push(`Fee: Rs. ${details.procedure_fee}`);
    }
    if (details.discount_amount !== undefined) {
      parts.push(`Discount: Rs. ${details.discount_amount}`);
    }
    if (details.refund_amount !== undefined) {
      parts.push(`Refund: Rs. ${details.refund_amount}`);
    }
    if (details.total_fee !== undefined) {
      parts.push(`Total: Rs. ${details.total_fee}`);
    }

    return parts.join(" • ");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No activity logs yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      <span className="font-medium">
                        {log.profiles?.full_name || "Unknown User"}
                      </span>
                    </p>
                    {formatDetails(log) && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {formatDetails(log)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
