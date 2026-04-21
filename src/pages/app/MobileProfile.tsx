import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileSection from "@/components/mobile/MobileSection";
import { useMobileRole } from "@/hooks/useMobileRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mail, Phone, MapPin, LogOut, Save,
  Building2, Stethoscope, Loader2, KeyRound,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const MobileProfile = () => {
  const navigate = useNavigate();
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", address: "", city: "",
  });
  const [extra, setExtra] = useState<{ clinic_name?: string; specialization?: string }>({});

  useEffect(() => {
    if (roleLoading || !userId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId, role]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone, address, city")
        .eq("id", userId)
        .maybeSingle();
      if (profile) {
        setForm({
          full_name: profile.full_name ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
          address: profile.address ?? "",
          city: profile.city ?? "",
        });
      }
      if (role === "clinic") {
        const { data: c } = await supabase.from("clinics").select("clinic_name").eq("id", userId).maybeSingle();
        if (c) setExtra({ clinic_name: c.clinic_name });
      } else if (role === "doctor") {
        const { data: d } = await supabase.from("doctors").select("specialization").eq("id", userId).maybeSingle();
        if (d) setExtra({ specialization: d.specialization });
      }
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          phone: form.phone || null,
          address: form.address || null,
          city: form.city || null,
        })
        .eq("id", userId);
      if (error) throw error;
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    if (!confirm("Sign out?")) return;
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <MobileScreen title="Profile" back="/app/more">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 mb-5 shadow-lg shadow-primary/20">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-foreground/15 flex items-center justify-center text-2xl font-bold">
                {(form.full_name || form.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-lg truncate">{form.full_name || "—"}</p>
                <p className="text-xs opacity-80 truncate">{form.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
                  {role === "clinic" ? (
                    <><Building2 className="h-3 w-3" /><span className="truncate">{extra.clinic_name ?? "Clinic"}</span></>
                  ) : (
                    <><Stethoscope className="h-3 w-3" /><span className="truncate">{extra.specialization ?? "Doctor"}</span></>
                  )}
                </div>
              </div>
            </div>
          </div>

          <MobileSection title="Personal Info">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs"><User className="h-3.5 w-3.5" /> Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs"><Mail className="h-3.5 w-3.5" /> Email</Label>
                <Input value={form.email} disabled className="h-11 bg-muted/40" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                <Input type="tel" inputMode="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11" placeholder="03xx xxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs"><MapPin className="h-3.5 w-3.5" /> City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-11" placeholder="Lahore" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-11" placeholder="Street, area" />
              </div>
              <Button onClick={save} disabled={saving} className="w-full h-11">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </MobileSection>

          <MobileSection title="Account">
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-muted/60 transition-colors border-b border-border"
            >
              <KeyRound className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm flex-1 text-left">Change Password</span>
            </button>
            <button
              onClick={signOut}
              className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-muted/60 transition-colors text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-sm flex-1 text-left">Sign Out</span>
            </button>
          </MobileSection>
        </>
      )}
    </MobileScreen>
  );
};

export default MobileProfile;
