import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// E4: the places a doctor works. One is the main location; weekdays in the schedule can point to any of them.
export type DoctorLocation = { id: string; name: string; address: string | null; phone: string | null; map_url: string | null; is_default: boolean; active: boolean };

export default function DoctorLocationsCard({ doctorId, onChange }: { doctorId: string; onChange?: (l: DoctorLocation[]) => void }) {
  const { toast } = useToast();
  const [list, setList] = useState<DoctorLocation[]>([]);
  const [edit, setEdit] = useState<Partial<DoctorLocation> | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await (supabase as any).from("doctor_locations").select("*").eq("doctor_id", doctorId).order("is_default", { ascending: false }).order("name");
    const l = (data || []) as DoctorLocation[];
    setList(l); onChange?.(l);
  }, [doctorId, onChange]);
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!edit?.name?.trim()) return;
    setBusy(true);
    const first = list.length === 0 && !edit.id;
    const payload = { name: edit.name.trim(), address: edit.address?.trim() || null, phone: edit.phone?.trim() || null, map_url: edit.map_url?.trim() || null, updated_at: new Date().toISOString() };
    const res = edit.id
      ? await (supabase as any).from("doctor_locations").update(payload).eq("id", edit.id)
      : await (supabase as any).from("doctor_locations").insert({ ...payload, doctor_id: doctorId, is_default: first });
    setBusy(false);
    if (res.error) { toast({ title: "Could not save the location", description: res.error.message, variant: "destructive" }); return; }
    setEdit(null); void load();
  };

  const makeMain = async (l: DoctorLocation) => {
    // Only one main location: clear the old one first (unique index).
    await (supabase as any).from("doctor_locations").update({ is_default: false }).eq("doctor_id", doctorId).eq("is_default", true);
    const { error } = await (supabase as any).from("doctor_locations").update({ is_default: true }).eq("id", l.id);
    if (error) toast({ title: "Could not change the main location", description: error.message, variant: "destructive" });
    void load();
  };

  const remove = async (l: DoctorLocation) => {
    if (!confirm(`Remove ${l.name}? Past appointments keep their date and time; they just lose the location.`)) return;
    const { error } = await (supabase as any).from("doctor_locations").delete().eq("id", l.id);
    if (error) { toast({ title: "Could not remove", description: error.message, variant: "destructive" }); return; }
    void load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Locations</CardTitle>
          <CardDescription>Add each place you see patients. Then choose below which location each day is at; new appointments follow it.</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => setEdit({})}><Plus className="mr-1 h-4 w-4" /> Add location</Button>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No locations yet. You only need this if you work at more than one place.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {list.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="font-medium">{l.name} {l.is_default && <Badge variant="secondary" className="ml-1">Main</Badge>}</p>
                  <p className="text-xs text-muted-foreground">{[l.address, l.phone].filter(Boolean).join(" · ") || "No address"}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!l.is_default && <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => makeMain(l)}><Star className="mr-1 h-3.5 w-3.5" /> Make main</Button>}
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEdit(l)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove(l)} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <Dialog open={!!edit} onOpenChange={(o) => { if (!o) setEdit(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit location" : "Add location"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label htmlFor="loc-name">Name</Label><Input id="loc-name" value={edit?.name || ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. City Hospital, Room 12" autoFocus /></div>
            <div className="space-y-1"><Label htmlFor="loc-addr">Address</Label><Input id="loc-addr" value={edit?.address || ""} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="loc-phone">Phone</Label><Input id="loc-phone" value={edit?.phone || ""} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="loc-map">Map link (optional)</Label><Input id="loc-map" type="url" value={edit?.map_url || ""} onChange={(e) => setEdit({ ...edit, map_url: e.target.value })} placeholder="https://maps.app.goo.gl/..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy || !edit?.name?.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
