import { useCallback, useEffect, useState } from "react";
import { FlaskConical, Loader2, Plus, Printer, Trash2, Ban, FileText, Upload, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { friendlyDate } from "@/lib/datetime";
import { withDrTitle } from "@/lib/doctorName";
import { COMMON_TESTS, findCommonTest, type LabKind, type LabOrder } from "@/lib/labs";

// Lab and imaging orders. On a visit it shows that visit's orders; on a patient page it shows all of them.
type Props = {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  patientName: string;
  canUseFiles?: boolean; // clinic accounts cannot open patient files
  onChange?: () => void;
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export default function LabOrdersCard({ patientId, doctorId, appointmentId, patientName, canUseFiles = true, onChange }: Props) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<LabKind>("lab");
  const [adding, setAdding] = useState(false);
  const [resultFor, setResultFor] = useState<LabOrder | null>(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    let q = (supabase as any).from("lab_orders").select("*").eq("patient_id", patientId).order("ordered_at", { ascending: false }).limit(300);
    if (appointmentId) q = q.eq("appointment_id", appointmentId);
    const { data } = await q;
    setOrders((data || []) as LabOrder[]);
    setLoading(false);
  }, [patientId, appointmentId]);

  useEffect(() => { void load(); }, [load]);

  const changed = () => { void load(); onChange?.(); };

  const add = async (testName = name) => {
    const t = testName.trim();
    if (!t) return;
    setAdding(true);
    const common = findCommonTest(t);
    const { error } = await (supabase as any).from("lab_orders").insert({
      doctor_id: doctorId, patient_id: patientId, appointment_id: appointmentId || null,
      test_name: common?.name || t, kind: common?.kind || kind, result_unit: common?.unit || null,
    });
    setAdding(false);
    if (error) { toast({ title: "Could not add the test", description: error.message, variant: "destructive" }); return; }
    setName("");
    changed();
  };

  const setStatus = async (o: LabOrder, status: "cancelled" | "ordered") => {
    const { error } = await (supabase as any).from("lab_orders").update({ status, updated_at: new Date().toISOString() }).eq("id", o.id);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    changed();
  };

  const remove = async (o: LabOrder) => {
    if (!confirm(`Remove ${o.test_name}?`)) return;
    const { error } = await (supabase as any).from("lab_orders").delete().eq("id", o.id);
    if (error) { toast({ title: "Could not remove", description: error.message, variant: "destructive" }); return; }
    changed();
  };

  const openFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("medical-documents").createSignedUrl(path, 60);
    if (error || !data) { toast({ title: "Could not open the file", variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  const printSlip = async () => {
    const pending = orders.filter((o) => o.status === "ordered");
    if (!pending.length) { toast({ title: "No tests waiting to print" }); return; }
    const { data: doc } = await supabase.from("doctors").select("specialization, qualification, clinic_id, profiles(full_name)").eq("id", doctorId).maybeSingle();
    let clinic = "";
    if ((doc as any)?.clinic_id) {
      const { data: c } = await supabase.from("clinics").select("clinic_name").eq("id", (doc as any).clinic_id).maybeSingle();
      clinic = (c as any)?.clinic_name || "";
    }
    const drName = withDrTitle((doc as any)?.profiles?.full_name || "");
    const sub = [(doc as any)?.qualification, (doc as any)?.specialization].filter(Boolean).join(" · ");
    const section = (k: LabKind, title: string) => {
      const list = pending.filter((o) => o.kind === k);
      if (!list.length) return "";
      return `<h2>${title}</h2><ol>${list.map((o) => `<li>${esc(o.test_name)}${o.notes ? ` <span class="n">(${esc(o.notes)})</span>` : ""}</li>`).join("")}</ol>`;
    };
    const w = window.open("", "_blank");
    if (!w) { toast({ title: "Allow pop-ups to print", variant: "destructive" }); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Test order - ${esc(patientName)}</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:32px;max-width:720px}
.head{border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:16px}
.doc{font-size:20px;font-weight:bold}.sub{color:#444;font-size:13px}
.pt{display:flex;justify-content:space-between;font-size:14px;margin-bottom:12px}
h2{font-size:15px;margin:18px 0 6px}ol{margin:0;padding-left:22px;line-height:1.8;font-size:15px}.n{color:#555;font-size:13px}
.sign{margin-top:60px;text-align:right;font-size:13px}
@media print{body{margin:16mm}}
</style></head><body>
<div class="head"><div class="doc">${esc(drName)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}${clinic ? `<div class="sub">${esc(clinic)}</div>` : ""}</div>
<div class="pt"><div><b>Patient:</b> ${esc(patientName)}</div><div><b>Date:</b> ${esc(format(new Date(), "d MMM yyyy"))}</div></div>
${section("lab", "Lab tests")}${section("imaging", "Imaging")}
<div class="sign">${esc(drName)}<br>Signature</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
    w.document.close();
  };

  const visible = showAll ? orders : orders.slice(0, appointmentId ? 50 : 8);
  const pendingCount = orders.filter((o) => o.status === "ordered").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" /> Lab and imaging orders</span>
          {pendingCount > 0 && (
            <Button type="button" variant="outline" size="sm" className="h-7" onClick={printSlip}><Printer className="mr-1.5 h-3.5 w-3.5" /> Print</Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Not a <form>: this card sits inside the visit page's form, and nested forms submit the page. */}
        <div className="flex gap-2">
          <Input list="zonoir-common-tests" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a test, e.g. HbA1c" aria-label="Test name" className="min-w-0"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); void add(); } }} />
          <datalist id="zonoir-common-tests">
            {COMMON_TESTS.map((t) => <option key={t.name} value={t.name} />)}
          </datalist>
          {!findCommonTest(name) && name.trim() && (
            <select className={`${selectCls} w-28 shrink-0`} value={kind} onChange={(e) => setKind(e.target.value as LabKind)} aria-label="Type">
              <option value="lab">Lab</option>
              <option value="imaging">Imaging</option>
            </select>
          )}
          <Button type="button" size="icon" disabled={!name.trim() || adding} aria-label="Add test" onClick={() => void add()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tests ordered{appointmentId ? " for this visit" : ""} yet.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {visible.map((o) => (
              <li key={o.id} className="p-2.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`font-medium ${o.status === "cancelled" ? "line-through text-muted-foreground" : ""}`}>{o.test_name}</span>
                      {o.kind === "imaging" && <Badge variant="outline" className="h-5 text-[10px]">Imaging</Badge>}
                      {o.status === "ordered" && <Badge variant="outline" className="h-5 border-amber-300 bg-amber-50 text-[10px] text-amber-700 dark:bg-amber-950 dark:text-amber-300">Waiting for result</Badge>}
                      {o.status === "cancelled" && <Badge variant="outline" className="h-5 text-[10px]">Cancelled</Badge>}
                    </div>
                    {o.status === "done" && (
                      <div className="mt-0.5 text-xs">
                        {o.result_value !== null && <span className="font-semibold tabular-nums">{Number(o.result_value)}{o.result_unit ? ` ${o.result_unit}` : ""}</span>}
                        {o.result_text && <span className="text-muted-foreground">{o.result_value !== null ? " · " : ""}{o.result_text}</span>}
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground">
                      Ordered {friendlyDate(o.ordered_at.slice(0, 10))}{o.result_date ? ` · Result ${friendlyDate(o.result_date)}` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {o.result_file && canUseFiles && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Open result file" onClick={() => openFile(o.result_file!)}><FileText className="h-3.5 w-3.5" /></Button>
                    )}
                    {o.status !== "cancelled" && (
                      <Button type="button" variant={o.status === "ordered" ? "outline" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => setResultFor(o)}>
                        {o.status === "done" ? "Edit" : "Add result"}
                      </Button>
                    )}
                    {o.status === "ordered" && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Cancel this test" onClick={() => setStatus(o, "cancelled")}><Ban className="h-3.5 w-3.5" /></Button>
                    )}
                    {o.status === "cancelled" && (
                      <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setStatus(o, "ordered")}>Undo</Button>
                    )}
                    {o.status !== "done" && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Remove" onClick={() => remove(o)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {orders.length > visible.length && (
          <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setShowAll(true)}>Show all {orders.length}</Button>
        )}
      </CardContent>

      <ResultDialog order={resultFor} patientId={patientId} canUseFiles={canUseFiles} onClose={() => setResultFor(null)} onSaved={() => { setResultFor(null); changed(); }} />
    </Card>
  );
}

function ResultDialog({ order, patientId, canUseFiles, onClose, onSaved }: {
  order: LabOrder | null; patientId: string; canUseFiles: boolean; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!order) return;
    setValue(order.result_value === null ? "" : String(order.result_value));
    setUnit(order.result_unit || findCommonTest(order.test_name)?.unit || "");
    setDate(order.result_date || format(new Date(), "yyyy-MM-dd"));
    setText(order.result_text || "");
    setFile(null);
  }, [order]);

  const numOk = value.trim() === "" || /^-?\d+(\.\d+)?$/.test(value.trim());
  const hasSomething = value.trim() !== "" || text.trim() !== "" || !!file || !!order?.result_file;

  const save = async () => {
    if (!order || !numOk || !hasSomething) return;
    setBusy(true);
    let path = order.result_file;
    if (file) {
      if (file.size > 15 * 1024 * 1024) { setBusy(false); toast({ title: "File is too large", description: "The limit is 15 MB.", variant: "destructive" }); return; }
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      path = `${patientId}/lab-${order.id}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("medical-documents").upload(path, file, { contentType: file.type || undefined });
      if (up.error) { setBusy(false); toast({ title: "Could not upload the file", description: up.error.message, variant: "destructive" }); return; }
    }
    const { error } = await (supabase as any).from("lab_orders").update({
      status: "done", result_value: value.trim() === "" ? null : Number(value), result_unit: unit.trim() || null,
      result_text: text.trim() || null, result_date: date || null, result_file: path, updated_at: new Date().toISOString(),
    }).eq("id", order.id);
    setBusy(false);
    if (error) { toast({ title: "Could not save the result", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Result saved", description: order.test_name });
    onSaved();
  };

  return (
    <Dialog open={!!order} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Result: {order?.test_name}</DialogTitle>
          <DialogDescription>Enter a number to see it on the trend chart. Add findings or a file for anything else.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="lab-val">Value</Label>
              <Input id="lab-val" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 6.8" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lab-unit">Unit</Label>
              <Input id="lab-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="mg/dL" />
            </div>
          </div>
          {!numOk && <p className="text-xs text-destructive">Enter the value as a number, for example 6.8.</p>}
          <div className="space-y-1">
            <Label htmlFor="lab-date">Result date</Label>
            <Input id="lab-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lab-text">Findings</Label>
            <Textarea id="lab-text" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Report findings or remarks" />
          </div>
          {canUseFiles && (
            <div className="space-y-1">
              <Label htmlFor="lab-file">Report file</Label>
              <label htmlFor="lab-file" className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-2.5 text-sm text-muted-foreground hover:bg-muted/50">
                {file ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Upload className="h-4 w-4" />}
                <span className="truncate">{file ? file.name : order?.result_file ? "A file is attached. Choose another to replace it." : "Choose a PDF or photo"}</span>
              </label>
              <input id="lab-file" type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy || !numOk || !hasSomething}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save result"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
