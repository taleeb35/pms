import { useEffect, useState } from "react";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileFAB from "@/components/mobile/MobileFAB";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import MobileListItem from "@/components/mobile/MobileListItem";
import { useMobileRole } from "@/hooks/useMobileRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCog, Mail, Phone, Trash2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";

interface Receptionist {
  id: string;
  user_id: string;
  status: string;
  profile: { full_name: string; email: string; phone: string | null } | null;
}

const MobileReceptionists = () => {
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Receptionist[]>([]);

  const isClinic = role === "clinic";
  const table = isClinic ? "clinic_receptionists" : "doctor_receptionists";
  const ownerCol = isClinic ? "clinic_id" : "doctor_id";
  const webPath = isClinic ? "/clinic/receptionists" : "/doctor/receptionists";

  useEffect(() => {
    if (roleLoading || !userId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId, role]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: recs } = await supabase
        .from(table as any)
        .select("id, user_id, status")
        .eq(ownerCol, userId)
        .order("created_at", { ascending: false });
      const enriched = await Promise.all(
        (recs ?? []).map(async (r: any) => {
          const { data: p } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", r.user_id)
            .maybeSingle();
          return { ...r, profile: p } as Receptionist;
        })
      );
      setList(enriched);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (r: Receptionist) => {
    const newStatus = r.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from(table as any)
      .update({ status: newStatus })
      .eq("id", r.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setList((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: newStatus } : x)));
    toast({ title: `Marked ${newStatus}` });
  };

  const remove = async (r: Receptionist) => {
    if (!confirm(`Remove ${r.profile?.full_name ?? "this user"}?`)) return;
    const { error } = await supabase.from(table as any).delete().eq("id", r.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setList((prev) => prev.filter((x) => x.id !== r.id));
    toast({ title: "Removed" });
  };

  return (
    <MobileScreen
      title="Receptionists"
      subtitle={`${list.length} member${list.length === 1 ? "" : "s"}`}
      back="/app/more"
      fab={
        <MobileFAB
          onClick={() => (window.location.href = webPath)}
          label="Add"
          ariaLabel="Add receptionist on web"
        />
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <MobileEmptyState
          icon={UserCog}
          title="No receptionists yet"
          description="Add receptionists from the web to delegate front-desk work."
        />
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                    {(r.profile?.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.profile?.full_name ?? "Unknown"}</p>
                    <Badge variant={r.status === "active" ? "default" : "secondary"} className="text-[10px] mt-0.5 h-4">
                      {r.status}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => void remove(r)}
                  className="text-muted-foreground hover:text-rose-600 p-1.5"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {r.profile?.email && (
                  <a href={`mailto:${r.profile.email}`} className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.profile.email}</span>
                  </a>
                )}
                {r.profile?.phone && (
                  <a href={`tel:${r.profile.phone}`} className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{r.profile.phone}</span>
                  </a>
                )}
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs font-medium">Active</span>
                <Switch checked={r.status === "active"} onCheckedChange={() => void toggleStatus(r)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-5">
        <Link to={webPath} className="inline-flex items-center gap-1 underline">
          Open full management <ExternalLink className="h-3 w-3" />
        </Link>
      </p>
    </MobileScreen>
  );
};

export default MobileReceptionists;
