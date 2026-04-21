import { useEffect, useState } from "react";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileFAB from "@/components/mobile/MobileFAB";
import MobileFormScreen from "@/components/mobile/MobileFormScreen";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import MobileListItem from "@/components/mobile/MobileListItem";
import { useMobileRole } from "@/hooks/useMobileRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Trash2, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string | null;
  amount: number;
}

const CATEGORIES = [
  "Rent", "Utilities", "Salaries", "Equipment",
  "Supplies", "Maintenance", "Insurance", "Marketing", "Miscellaneous",
];

const MobileExpenses = () => {
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    expense_date: format(new Date(), "yyyy-MM-dd"),
    category: "",
    description: "",
    amount: "",
  });

  useEffect(() => {
    if (roleLoading || !userId || role !== "clinic") {
      if (!roleLoading) setLoading(false);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId, role]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clinic_expenses")
      .select("id, expense_date, category, description, amount")
      .eq("clinic_id", userId)
      .order("expense_date", { ascending: false })
      .limit(100);
    setExpenses((data ?? []) as Expense[]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      expense_date: format(new Date(), "yyyy-MM-dd"),
      category: "",
      description: "",
      amount: "",
    });
    setShowForm(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({
      expense_date: e.expense_date,
      category: e.category,
      description: e.description ?? "",
      amount: String(e.amount),
    });
    setShowForm(true);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.category || !form.amount) {
      toast({ title: "Missing fields", description: "Category and amount are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        clinic_id: userId,
        expense_date: form.expense_date,
        category: form.category,
        description: form.description || null,
        amount: Number(form.amount),
      };
      if (editing) {
        const { error } = await supabase.from("clinic_expenses").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clinic_expenses").insert(payload);
        if (error) throw error;
      }
      toast({ title: editing ? "Expense updated" : "Expense added" });
      setShowForm(false);
      void load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    const { error } = await supabase.from("clinic_expenses").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Deleted" });
  };

  // Form view
  if (showForm) {
    return (
      <MobileFormScreen
        title={editing ? "Edit Expense" : "New Expense"}
        back={() => setShowForm(false)}
        onSubmit={submit}
        onCancel={() => setShowForm(false)}
        loading={saving}
        submitLabel={editing ? "Update" : "Add Expense"}
      >
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="h-12" />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="h-12"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Amount (PKR)</Label>
          <Input type="number" inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-12 text-base" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Notes…" />
        </div>
      </MobileFormScreen>
    );
  }

  if (role !== "clinic" && !roleLoading) {
    return (
      <MobileScreen title="Expenses" back="/app/more">
        <MobileEmptyState
          icon={Receipt}
          title="Clinic owners only"
          description="Expense tracking is available to clinic accounts."
        />
      </MobileScreen>
    );
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <MobileScreen
      title="Expenses"
      back="/app/more"
      fab={<MobileFAB onClick={openCreate} label="Add" />}
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white p-4 mb-4 shadow-md shadow-rose-500/20">
            <p className="text-xs opacity-80 uppercase tracking-wider font-medium">Total Expenses ({expenses.length})</p>
            <p className="text-2xl font-bold mt-1">Rs {Math.round(total).toLocaleString("en-PK")}</p>
          </div>

          {expenses.length === 0 ? (
            <MobileEmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Tap Add to log your first expense."
            />
          ) : (
            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
              {expenses.map((e) => (
                <MobileListItem
                  key={e.id}
                  showChevron={false}
                  onClick={() => openEdit(e)}
                  leading={
                    <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-rose-600" />
                    </div>
                  }
                  title={
                    <div className="flex items-center justify-between gap-2">
                      <span>{e.category}</span>
                      <span className="text-sm font-bold text-rose-600 shrink-0">
                        Rs {Math.round(e.amount).toLocaleString("en-PK")}
                      </span>
                    </div>
                  }
                  subtitle={
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{e.description ?? format(new Date(e.expense_date), "MMM d, yyyy")}</span>
                      <button
                        onClick={(ev) => { ev.stopPropagation(); void remove(e.id); }}
                        className="text-muted-foreground hover:text-rose-600 p-1"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </MobileScreen>
  );
};

export default MobileExpenses;
