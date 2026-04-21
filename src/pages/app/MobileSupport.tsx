import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileFAB from "@/components/mobile/MobileFAB";
import MobileFormScreen from "@/components/mobile/MobileFormScreen";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMobileRole } from "@/hooks/useMobileRole";
import { HelpCircle, Plus } from "lucide-react";
import { format } from "date-fns";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const statusBadge = (s: string) => {
  switch (s) {
    case "open":
      return "bg-info/15 text-info border-info/30";
    case "in_progress":
      return "bg-warning/15 text-warning border-warning/30";
    case "resolved":
      return "bg-success/15 text-success border-success/30";
    case "closed":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const MobileSupport = () => {
  const { id: userId, role, name: profileName, loading: roleLoading } = useMobileRole();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entityName, setEntityName] = useState("");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ subject: "", message: "" });

  useEffect(() => {
    if (roleLoading || !userId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId]);

  const load = async () => {
    setLoading(true);
    try {
      const ownerCol = role === "clinic" ? "clinic_id" : "doctor_id";
      const [{ data }, { data: profile }, ent] = await Promise.all([
        supabase
          .from("support_tickets")
          .select("id, subject, message, status, created_at")
          .eq(ownerCol, userId)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("email").eq("id", userId).maybeSingle(),
        role === "clinic"
          ? supabase.from("clinics").select("clinic_name").eq("id", userId).maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);
      setTickets((data ?? []) as Ticket[]);
      if (profile?.email) setEmail(profile.email);
      const en =
        role === "clinic"
          ? (ent as any)?.data?.clinic_name ?? profileName
          : profileName;
      setEntityName(en ?? "");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast({ title: "Subject and message required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const ownerCol = role === "clinic" ? "clinic_id" : "doctor_id";
      const { data: created, error } = await supabase
        .from("support_tickets")
        .insert({
          [ownerCol]: userId,
          name: profileName || entityName || "User",
          email,
          subject: form.subject,
          message: form.message,
          status: "open",
        } as any)
        .select()
        .single();
      if (error) throw error;

      try {
        await supabase.functions.invoke("send-ticket-notification", {
          body: {
            ticketId: created.id,
            name: profileName,
            email,
            subject: form.subject,
            message: form.message,
            entityType: role,
            entityName,
          },
        });
      } catch (e) {
        console.error("notification email failed", e);
      }

      toast({ title: "Ticket submitted", description: "Our team will respond soon." });
      setForm({ subject: "", message: "" });
      setShowForm(false);
      void load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (showForm) {
    return (
      <MobileFormScreen
        title="New support ticket"
        back={() => setShowForm(false)}
        onSubmit={submit}
        onCancel={() => setShowForm(false)}
        loading={saving}
        submitLabel="Submit"
      >
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label>Subject *</Label>
          <Input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Brief summary"
            className="h-12 text-base"
            maxLength={200}
          />
        </div>
        <div className="space-y-2">
          <Label>Message *</Label>
          <Textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Describe your question or issue…"
            rows={8}
            className="text-base"
            maxLength={2000}
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {form.message.length}/2000
          </p>
        </div>
      </MobileFormScreen>
    );
  }

  return (
    <MobileScreen
      title="Support"
      subtitle={`${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`}
      back="/app/more"
      fab={<MobileFAB onClick={() => setShowForm(true)} label="New" icon={<Plus className="h-5 w-5" />} />}
    >
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <MobileEmptyState
          icon={HelpCircle}
          title="No tickets yet"
          description="Tap New to send your first message to our support team."
        />
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-xl bg-card border border-border/60 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold flex-1 line-clamp-1">
                  {t.subject}
                </h3>
                <Badge variant="outline" className={`text-[10px] ${statusBadge(t.status)}`}>
                  {t.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{t.message}</p>
              <p className="text-[10px] text-muted-foreground mt-2">
                {format(new Date(t.created_at), "dd MMM yyyy · HH:mm")}
              </p>
            </div>
          ))}
        </div>
      )}
    </MobileScreen>
  );
};

export default MobileSupport;
