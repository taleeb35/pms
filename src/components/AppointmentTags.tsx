import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TAGS, TAG_FILTERS, type TagKey } from "@/lib/appointmentTags";

const BY_KEY = new Map(TAGS.map((t) => [t.key, t]));

export function AppointmentTagBadges({ tags }: { tags: TagKey[] }) {
  if (!tags.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {tags.map((k) => {
        const t = BY_KEY.get(k);
        return t ? (
          <Badge key={k} variant="outline" className={`px-1.5 py-0 text-[10px] font-medium ${t.cls}`}>{t.label}</Badge>
        ) : null;
      })}
    </span>
  );
}

export function TagFilterSelect({ value, onChange, className = "w-[200px]" }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <Select value={value || "all"} onValueChange={onChange}>
      <SelectTrigger className={`${className} bg-background`}>
        <SelectValue placeholder="Filter by tag" />
      </SelectTrigger>
      <SelectContent className="bg-background z-50">
        {TAG_FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
