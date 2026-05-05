import { supabase } from "@/integrations/supabase/client";

export type DuplicatePatient = {
  id: string;
  patient_id: string;
  full_name: string;
  phone: string | null;
  cnic: string | null;
};

const norm = (v?: string | null) => (v || "").replace(/\s|-/g, "").trim();

/**
 * Look up existing patients (within the caller's RLS scope) that share the
 * same Contact Number or CNIC. Returns matches grouped by reason.
 *
 * Returns an empty result when both phone and cnic are empty.
 */
export async function findDuplicatePatients(
  phone?: string | null,
  cnic?: string | null,
): Promise<{
  byPhone: DuplicatePatient[];
  byCnic: DuplicatePatient[];
  all: DuplicatePatient[];
}> {
  const p = norm(phone);
  const c = norm(cnic);
  const empty = { byPhone: [], byCnic: [], all: [] };
  if (!p && !c) return empty;

  const orParts: string[] = [];
  if (p) orParts.push(`phone.eq.${p}`);
  if (c) orParts.push(`cnic.eq.${c}`);

  const { data, error } = await supabase
    .from("patients")
    .select("id, patient_id, full_name, phone, cnic")
    .or(orParts.join(","));

  if (error || !data) return empty;

  const byPhone = p ? data.filter((d) => norm(d.phone) === p) : [];
  const byCnic = c ? data.filter((d) => norm(d.cnic) === c) : [];
  const seen = new Set<string>();
  const all = [...byPhone, ...byCnic].filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });

  return { byPhone, byCnic, all };
}

/**
 * Build a friendly confirmation message for duplicate matches.
 */
export function describeDuplicates(matches: DuplicatePatient[]): string {
  if (!matches.length) return "";
  const lines = matches.slice(0, 5).map(
    (m) =>
      `• ${m.full_name} (${m.patient_id}) — ${m.phone || "no phone"}${
        m.cnic ? `, CNIC ${m.cnic}` : ""
      }`,
  );
  const more = matches.length > 5 ? `\n…and ${matches.length - 5} more` : "";
  return `${lines.join("\n")}${more}`;
}
