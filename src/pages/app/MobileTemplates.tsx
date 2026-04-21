import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileSection from "@/components/mobile/MobileSection";
import MobileListItem from "@/components/mobile/MobileListItem";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import MobileFAB from "@/components/mobile/MobileFAB";
import MobileFormScreen from "@/components/mobile/MobileFormScreen";
import { useMobileRole } from "@/hooks/useMobileRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Stethoscope,
  FlaskConical,
  FileText,
  HeartPulse,
  Briefcase,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DiseaseTpl {
  id: string;
  disease_name: string;
  prescription_template: string;
}

const MobileTemplates = () => {
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const { toast } = useToast();

  const [counts, setCounts] = useState({ disease: 0, test: 0, report: 0, sick: 0, work: 0 });
  const [diseases, setDiseases] = useState<DiseaseTpl[]>([]);
  const [loading, setLoading] = useState(true);

  // Disease template editor (most-used: native CRUD)
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DiseaseTpl | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ disease_name: "", prescription_template: "" });

  const webPath = role === "clinic" ? "/clinic/templates" : "/doctor/templates";

  useEffect(() => {
    if (roleLoading || !userId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId, role]);

  const filterCol = role === "clinic" ? "clinic_id" : "doctor_id";

  const load = async () => {
    setLoading(true);
    try {
      const [d, t, r, sk, wk] = await Promise.all([
        supabase.from("doctor_disease_templates").select("id, disease_name, prescription_template").eq(filterCol, userId).order("disease_name"),
        supabase.from("doctor_test_templates").select("id", { count: "exact", head: true }).eq(filterCol, userId),
        supabase.from("doctor_report_templates").select("id", { count: "exact", head: true }).eq(filterCol, userId),
        role === "doctor"
          ? supabase.from("doctor_sick_leave_templates").select("id", { count: "exact", head: true }).eq("doctor_id", userId)
          : Promise.resolve({ count: 0 } as any),
        role === "doctor"
          ? supabase.from("doctor_work_leave_templates").select("id", { count: "exact", head: true }).eq("doctor_id", userId)
          : Promise.resolve({ count: 0 } as any),
      ]);
      setDiseases((d.data ?? []) as DiseaseTpl[]);
      setCounts({
        disease: d.data?.length ?? 0,
        test: t.count ?? 0,
        report: r.count ?? 0,
        sick: sk.count ?? 0,
        work: wk.count ?? 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ disease_name: "", prescription_template: "" });
    setShowForm(true);
  };

  const openEdit = (t: DiseaseTpl) => {
    setEditing(t);
    setForm({ disease_name: t.disease_name, prescription_template: t.prescription_template });
    setShowForm(true);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.disease_name || !form.prescription_template) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        disease_name: form.disease_name.trim(),
        prescription_template: form.prescription_template.trim(),
        [filterCol]: userId,
      };
      if (editing) {
        const { error } = await supabase.from("doctor_disease_templates").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("doctor_disease_templates").insert(payload);
        if (error) throw error;
      }
      toast({ title: editing ? "Template updated" : "Template created" });
      setShowForm(false);
      void load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    const { error } = await supabase.from("doctor_disease_templates").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setDiseases((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Deleted" });
  };

  if (showForm) {
    return (
      <MobileFormScreen
        title={editing ? "Edit Template" : "New Disease Template"}
        back={() => setShowForm(false) as any}
        onSubmit={submit}
        onCancel={() => setShowForm(false)}
        loading={saving}
      >
        <div className="space-y-2">
          <Label>Disease Name *</Label>
          <Input
            value={form.disease_name}
            onChange={(e) => setForm({ ...form, disease_name: e.target.value })}
            placeholder="e.g. Hypertension"
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label>Prescription Template *</Label>
          <Textarea
            value={form.prescription_template}
            onChange={(e) => setForm({ ...form, prescription_template: e.target.value })}
            rows={10}
            placeholder="Standard prescription text…"
            className="text-base"
          />
        </div>
      </MobileFormScreen>
    );
  }

  return (
    <MobileScreen
      title="Templates"
      back="/app/more"
      fab={<MobileFAB onClick={openCreate} label="New" />}
    >
      <MobileSection title="Categories">
        <MobileListItem
          leading={<Stethoscope className="h-5 w-5 text-primary" />}
          title="Disease / Prescription"
          subtitle={`${counts.disease} template${counts.disease === 1 ? "" : "s"}`}
          showChevron={false}
          trailing={<span className="text-xs text-muted-foreground">Native ↓</span>}
        />
        <MobileListItem
          leading={<FlaskConical className="h-5 w-5 text-primary" />}
          title="Test / Investigation"
          subtitle={`${counts.test} template${counts.test === 1 ? "" : "s"}`}
          onClick={() => (window.location.href = webPath)}
          trailing={<ExternalLink className="h-4 w-4 text-muted-foreground" />}
        />
        <MobileListItem
          leading={<FileText className="h-5 w-5 text-primary" />}
          title="Report Templates"
          subtitle={`${counts.report} template${counts.report === 1 ? "" : "s"}`}
          onClick={() => (window.location.href = webPath)}
          trailing={<ExternalLink className="h-4 w-4 text-muted-foreground" />}
        />
        {role === "doctor" && (
          <>
            <MobileListItem
              leading={<HeartPulse className="h-5 w-5 text-primary" />}
              title="Sick Leave"
              subtitle={`${counts.sick} template${counts.sick === 1 ? "" : "s"}`}
              onClick={() => (window.location.href = webPath)}
              trailing={<ExternalLink className="h-4 w-4 text-muted-foreground" />}
            />
            <MobileListItem
              leading={<Briefcase className="h-5 w-5 text-primary" />}
              title="Work Leave"
              subtitle={`${counts.work} template${counts.work === 1 ? "" : "s"}`}
              onClick={() => (window.location.href = webPath)}
              trailing={<ExternalLink className="h-4 w-4 text-muted-foreground" />}
            />
          </>
        )}
      </MobileSection>

      <MobileSection title={`Disease Templates (${diseases.length})`}>
        {loading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : diseases.length === 0 ? (
          <MobileEmptyState
            title="No templates yet"
            description="Tap New to create your first disease prescription template."
          />
        ) : (
          diseases.map((t) => (
            <MobileListItem
              key={t.id}
              title={t.disease_name}
              subtitle={t.prescription_template.slice(0, 80) + (t.prescription_template.length > 80 ? "…" : "")}
              showChevron={false}
              onClick={() => openEdit(t)}
              trailing={
                <button
                  onClick={(ev) => { ev.stopPropagation(); void remove(t.id); }}
                  className="text-muted-foreground hover:text-rose-600 p-1"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              }
            />
          ))
        )}
      </MobileSection>

      <p className="text-center text-xs text-muted-foreground mt-4">
        <Link to={webPath} className="underline">Open full templates editor →</Link>
      </p>
    </MobileScreen>
  );
};

export default MobileTemplates;
