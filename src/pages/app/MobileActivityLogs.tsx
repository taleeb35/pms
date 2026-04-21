import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Search } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getActionLabel, getActionColor } from "@/lib/activityLogger";
import { useMobileRole } from "@/hooks/useMobileRole";

interface LogRow {
  id: string;
  action: string;
  entity_type: string;
  details: any;
  created_at: string;
  user_id: string;
}

const PAGE = 50;

const MobileActivityLogs = () => {
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (roleLoading || !userId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId, filter]);

  const load = async () => {
    setLoading(true);
    try {
      let userIds: string[] = [userId];
      if (role === "clinic") {
        const { data: docs } = await supabase
          .from("doctors")
          .select("id")
          .eq("clinic_id", userId);
        userIds = [userId, ...(docs?.map((d) => d.id) ?? [])];
      }

      let q = supabase
        .from("activity_logs")
        .select("id, action, entity_type, details, created_at, user_id")
        .in("user_id", userIds)
        .order("created_at", { ascending: false })
        .limit(PAGE);
      if (filter !== "all") q = q.eq("action", filter);

      const { data } = await q;
      setLogs((data ?? []) as LogRow[]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return logs;
    return logs.filter((l) => {
      const actor = (l.details?.actorName ?? "").toLowerCase();
      return (
        getActionLabel(l.action).toLowerCase().includes(s) ||
        l.entity_type.toLowerCase().includes(s) ||
        actor.includes(s)
      );
    });
  }, [logs, search]);

  const filterOpts = [
    "all",
    "patient_created",
    "patient_updated",
    "appointment_created",
    "appointment_completed",
    "appointment_cancelled",
    "expense_created",
    "doctor_added",
    "receptionist_added",
  ];

  return (
    <MobileScreen
      title="Activity Logs"
      subtitle={`${filtered.length} recent event${filtered.length === 1 ? "" : "s"}`}
      back="/app/more"
    >
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor, action…"
            className="pl-10 h-11"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOpts.map((o) => (
              <SelectItem key={o} value={o}>
                {o === "all" ? "All actions" : getActionLabel(o)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <MobileEmptyState
          icon={Activity}
          title="No activity yet"
          description="Recent actions across your account will appear here."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const color = getActionColor(log.action);
            return (
              <div
                key={log.id}
                className="rounded-xl bg-card border border-border/60 p-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
                  >
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">
                        {getActionLabel(log.action)}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {log.details?.actorName ?? "Unknown"} · {log.entity_type}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(log.created_at), "dd MMM yyyy · HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MobileScreen>
  );
};

export default MobileActivityLogs;
