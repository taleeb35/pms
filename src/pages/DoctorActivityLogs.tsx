import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { getActionLabel, getActionColor } from "@/lib/activityLogger";
import { Search, Filter, RefreshCw, Activity } from "lucide-react";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { Json } from "@/integrations/supabase/types";

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Json;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  } | null;
}

const DoctorActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get doctor's receptionists
      const { data: receptionists } = await supabase
        .from("doctor_receptionists")
        .select("user_id")
        .eq("doctor_id", user.id)
        .eq("status", "active");

      const receptionistIds = receptionists?.map(r => r.user_id) || [];
      const userIds = [user.id, ...receptionistIds];

      let query = supabase
        .from("activity_logs")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .in("user_id", userIds)
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (page === 1) {
        setLogs(data || []);
      } else {
        setLogs(prev => [...prev, ...(data || [])]);
      }
      
      setHasMore((data?.length || 0) === pageSize);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const details = JSON.stringify(log.details).toLowerCase();
    const userName = log.profiles?.full_name?.toLowerCase() || "";
    return details.includes(search) || userName.includes(search) || log.action.includes(search);
  });

  const actionTypes = [
    "all",
    "patient_created",
    "patient_updated",
    "appointment_created",
    "appointment_updated",
    "appointment_cancelled",
    "fee_updated",
    "procedure_set",
    "refund_applied",
    "visit_record_created",
    "visit_record_updated",
    "waitlist_added",
    "waitlist_removed",
    "walkin_created",
    "procedure_created",
    "procedure_updated",
    "procedure_deleted",
    "receptionist_added",
    "document_uploaded",
  ];

  const handleRefresh = () => {
    setPage(1);
    fetchLogs();
  };

  if (loading && page === 1) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground">Track all actions in your practice</p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={(value) => { setActionFilter(value); setPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map(action => (
                    <SelectItem key={action} value={action}>
                      {action === "all" ? "All Actions" : getActionLabel(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No activity logs found</p>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Badge className={getActionColor(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {log.profiles?.full_name || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.details && typeof log.details === 'object' && (
                          <>
                            {(log.details as Record<string, unknown>).patient_name && (
                              <span>Patient: {String((log.details as Record<string, unknown>).patient_name)}</span>
                            )}
                            {(log.details as Record<string, unknown>).total_fee !== undefined && (
                              <span className="ml-2">• Total: Rs. {String((log.details as Record<string, unknown>).total_fee)}</span>
                            )}
                            {(log.details as Record<string, unknown>).procedure_name && (
                              <span className="ml-2">• Procedure: {String((log.details as Record<string, unknown>).procedure_name)}</span>
                            )}
                            {(log.details as Record<string, unknown>).refund_amount && (
                              <span className="ml-2">• Refund: Rs. {String((log.details as Record<string, unknown>).refund_amount)}</span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "dd MMM yyyy, hh:mm a")}
                    </span>
                  </div>
                ))}
                
                {hasMore && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => p + 1)}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DoctorActivityLogs;
