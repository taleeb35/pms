import { useEffect, useMemo, useState } from "react";
import MobileScreen from "./MobileScreen";
import MobileFAB from "./MobileFAB";
import MobileEmptyState from "./MobileEmptyState";
import MobileListItem from "./MobileListItem";
import MobileFormScreen from "./MobileFormScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Trash2, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CatalogField {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "number";
}

interface MobileCatalogScreenProps {
  title: string;
  back?: string;
  table: string;
  ownerColumn: string;
  ownerId: string | null;
  loadingOwner: boolean;
  fields: CatalogField[];
  /** Field used as the row title */
  titleField: string;
  /** Optional subtitle field */
  subtitleField?: string;
  /** Search across these field keys */
  searchFields?: string[];
  /** Trailing display (e.g. price) */
  trailingField?: string;
  trailingFormat?: (v: any) => string;
  icon: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Order results by this column */
  orderBy?: string;
}

/**
 * Generic single-table CRUD screen for clinical catalogs
 * (ICD codes, diseases, allergies, procedures, specializations).
 */
const MobileCatalogScreen = ({
  title,
  back = "/app/more",
  table,
  ownerColumn,
  ownerId,
  loadingOwner,
  fields,
  titleField,
  subtitleField,
  searchFields,
  trailingField,
  trailingFormat,
  icon: Icon,
  emptyTitle,
  emptyDescription,
  orderBy,
}: MobileCatalogScreenProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const selectCols = useMemo(
    () => ["id", ...fields.map((f) => f.key)].join(", "),
    [fields]
  );

  useEffect(() => {
    if (loadingOwner) return;
    if (!ownerId) {
      setLoading(false);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingOwner, ownerId, table]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select(selectCols)
        .eq(ownerColumn, ownerId)
        .order(orderBy ?? titleField, { ascending: true })
        .limit(500);
      if (error) throw error;
      setItems((data ?? []) as any[]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    const blank: Record<string, string> = {};
    fields.forEach((f) => (blank[f.key] = ""));
    setForm(blank);
    setShowForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    const init: Record<string, string> = {};
    fields.forEach((f) => (init[f.key] = row[f.key] != null ? String(row[f.key]) : ""));
    setForm(init);
    setShowForm(true);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    for (const f of fields) {
      if (f.required && !form[f.key]?.trim()) {
        toast({ title: `${f.label} is required`, variant: "destructive" });
        return;
      }
    }
    setSaving(true);
    try {
      const payload: any = { [ownerColumn]: ownerId };
      fields.forEach((f) => {
        const v = form[f.key]?.trim();
        if (v === "" || v === undefined) {
          payload[f.key] = null;
        } else {
          payload[f.key] = f.type === "number" ? Number(v) : v;
        }
      });

      if (editing) {
        const { error } = await supabase.from(table as any).update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table as any).insert(payload);
        if (error) throw error;
      }
      toast({ title: editing ? "Updated" : "Added" });
      setShowForm(false);
      void load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Deleted" });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    const cols = searchFields ?? [titleField];
    return items.filter((i) =>
      cols.some((c) => String(i[c] ?? "").toLowerCase().includes(q))
    );
  }, [items, search, searchFields, titleField]);

  if (showForm) {
    return (
      <MobileFormScreen
        title={editing ? `Edit ${title.replace(/s$/, "")}` : `New ${title.replace(/s$/, "")}`}
        back={() => setShowForm(false)}
        onSubmit={submit}
        onCancel={() => setShowForm(false)}
        loading={saving}
      >
        {fields.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label>
              {f.label}
              {f.required && " *"}
            </Label>
            <Input
              type={f.type === "number" ? "number" : "text"}
              inputMode={f.type === "number" ? "numeric" : undefined}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="h-12 text-base"
            />
          </div>
        ))}
      </MobileFormScreen>
    );
  }

  return (
    <MobileScreen
      title={title}
      subtitle={`${items.length} item${items.length === 1 ? "" : "s"}`}
      back={back}
      fab={ownerId ? <MobileFAB onClick={openCreate} label="Add" /> : undefined}
    >
      {ownerId && items.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-10 h-11"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : !ownerId ? (
        <MobileEmptyState
          icon={Icon}
          title="Not available"
          description="This module isn't available for your account type."
        />
      ) : filtered.length === 0 ? (
        <MobileEmptyState
          icon={Icon}
          title={items.length === 0 ? (emptyTitle ?? `No ${title.toLowerCase()} yet`) : "No matches"}
          description={
            items.length === 0
              ? (emptyDescription ?? "Tap Add to create your first entry.")
              : "Try a different search term."
          }
        />
      ) : (
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
          {filtered.map((row) => (
            <MobileListItem
              key={row.id}
              showChevron={false}
              onClick={() => openEdit(row)}
              title={row[titleField] ?? "—"}
              subtitle={subtitleField ? row[subtitleField] : undefined}
              trailing={
                <div className="flex items-center gap-2">
                  {trailingField && row[trailingField] != null && (
                    <span className="text-sm font-semibold text-primary">
                      {trailingFormat ? trailingFormat(row[trailingField]) : row[trailingField]}
                    </span>
                  )}
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      void remove(row.id);
                    }}
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
    </MobileScreen>
  );
};

export default MobileCatalogScreen;
