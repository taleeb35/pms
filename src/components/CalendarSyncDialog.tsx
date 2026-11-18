import { useEffect, useState } from "react";
import { CalendarSync, Copy, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// E2: a private calendar link the doctor adds once to Google Calendar, Outlook or Apple Calendar.
// Appointments and leave days then show there and update by themselves (one-way, read-only).
const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");

export default function CalendarSyncDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [names, setNames] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("doctors").select("calendar_token, calendar_show_names").eq("id", user.id).maybeSingle();
      setToken((data as any)?.calendar_token || null);
      setNames(!!(data as any)?.calendar_show_names);
    })();
  }, [open]);

  const link = token ? `${window.location.origin}/functions/v1/calendar-feed?token=${token}` : "";

  const save = async (patch: Record<string, unknown>) => {
    if (!userId) return false;
    setBusy(true);
    const { error } = await supabase.from("doctors").update(patch as any).eq("id", userId);
    setBusy(false);
    if (error) { toast({ title: "Could not save", description: error.message, variant: "destructive" }); return false; }
    return true;
  };

  const create = async () => { const t = newToken(); if (await save({ calendar_token: t })) setToken(t); };
  const replace = async () => {
    if (!confirm("Make a new link? Calendars using the old link will stop updating until you add the new one.")) return;
    await create();
    toast({ title: "New link made", description: "Add it to your calendar again." });
  };
  const toggleNames = async (v: boolean) => { if (await save({ calendar_show_names: v })) setNames(v); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast({ title: "Link copied" }); }
    catch { toast({ title: "Copy the link from the box" }); }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1"><CalendarSync className="h-4 w-4" /> Sync to Google / Outlook</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Show appointments in your own calendar</DialogTitle>
            <DialogDescription>Add this private link once to Google Calendar, Outlook or Apple Calendar. Your appointments and leave days appear there and update by themselves. Changes are made in Zonoir.</DialogDescription>
          </DialogHeader>
          {!token ? (
            <Button onClick={create} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create my calendar link"}</Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="cal-link">Your calendar link (keep it private)</Label>
                <div className="flex gap-2">
                  <Input id="cal-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
                  <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copy link"><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Show patient names</p>
                  <p className="text-xs text-muted-foreground">Off: events say "Patient". Turn on only if your calendar account is private to you.</p>
                </div>
                <Switch checked={names} onCheckedChange={toggleNames} disabled={busy} aria-label="Show patient names" />
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Google Calendar:</span> on a computer, Other calendars → + → From URL → paste the link → Add calendar.</p>
                <p><span className="font-medium">Outlook:</span> Add calendar → Subscribe from web → paste the link → Import.</p>
                <p><span className="font-medium">iPhone:</span> Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar → paste the link.</p>
                <p className="text-xs text-muted-foreground">Google and Outlook refresh subscribed calendars every few hours, so new bookings can take a while to appear there.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={replace} disabled={busy} className="text-muted-foreground"><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Make a new link (stops the old one)</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
