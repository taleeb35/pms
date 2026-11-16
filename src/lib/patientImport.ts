// Patient import wizard: match spreadsheet columns to patient fields, clean values, find problems.
// Pure functions only, so they can be tested without a browser or database.

export type FieldKey =
  | "full_name" | "first_name" | "last_name" | "phone" | "email" | "date_of_birth" | "age" | "gender" | "cnic"
  | "father_name" | "blood_group" | "address" | "city" | "allergies" | "major_diseases" | "marital_status"
  | "medical_history" | "emergency_contact_name" | "emergency_contact_phone";

export type FieldDef = { key: FieldKey; label: string; synonyms: string[] };

// Header names seen in exports from other clinic systems and in hand-made sheets.
export const FIELDS: FieldDef[] = [
  { key: "full_name", label: "Full name", synonyms: ["name", "fullname", "patientname", "patient", "patientfullname", "clientname"] },
  { key: "first_name", label: "First name", synonyms: ["firstname", "givenname", "forename", "first", "givennames"] },
  { key: "last_name", label: "Last name", synonyms: ["lastname", "surname", "familyname", "last"] },
  { key: "phone", label: "Phone", synonyms: ["phone", "mobile", "mobilephone", "mobileno", "mobilenumber", "cell", "cellphone", "contact", "contactno", "contactnumber", "phonenumber", "phoneno", "telephone", "homephone", "whatsapp", "primaryphone", "phone1"] },
  { key: "email", label: "Email", synonyms: ["email", "emailaddress", "mail"] },
  { key: "date_of_birth", label: "Date of birth", synonyms: ["dob", "dateofbirth", "birthdate", "birthday", "birth", "dateofbirthddmmyyyy", "dateofbirthyyyymmdd"] },
  { key: "age", label: "Age (years)", synonyms: ["age", "ageyears"] },
  { key: "gender", label: "Gender", synonyms: ["gender", "sex"] },
  { key: "cnic", label: "National ID", synonyms: ["cnic", "nationalid", "nationalidnumber", "nic", "idnumber", "emiratesid", "idcard", "nationalidentitycard"] },
  { key: "father_name", label: "Father / husband name", synonyms: ["fathername", "husbandname", "fatherhusbandname", "fatherorhusbandname", "guardian", "guardianname", "so", "wo"] },
  { key: "blood_group", label: "Blood group", synonyms: ["bloodgroup", "bloodtype", "blood"] },
  { key: "address", label: "Address", synonyms: ["address", "address1", "addressline1", "street", "streetaddress", "homeaddress"] },
  { key: "city", label: "City", synonyms: ["city", "town", "suburb", "citytown"] },
  { key: "allergies", label: "Allergies", synonyms: ["allergies", "allergy", "knownallergies"] },
  { key: "major_diseases", label: "Conditions", synonyms: ["conditions", "majordiseases", "chronicconditions", "diseases", "medicalconditions", "medicalalerts"] },
  { key: "marital_status", label: "Marital status", synonyms: ["maritalstatus", "marital"] },
  { key: "medical_history", label: "Medical history / notes", synonyms: ["medicalhistory", "history", "notes", "note", "comments", "remarks"] },
  { key: "emergency_contact_name", label: "Emergency contact name", synonyms: ["emergencycontact", "emergencycontactname", "nextofkin", "nokname"] },
  { key: "emergency_contact_phone", label: "Emergency contact phone", synonyms: ["emergencycontactphone", "emergencyphone", "emergencycontactnumber", "nokphone"] },
];

export const normHeader = (h: string) => String(h ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export type Mapping = Partial<Record<FieldKey, string>>; // field -> column header

// Guess which column holds which field. Exact synonym matches first, then "contains" matches.
export function guessMapping(headers: string[]): Mapping {
  const map: Mapping = {};
  const used = new Set<string>();
  const take = (k: FieldKey, h: string) => { map[k] = h; used.add(h); };
  for (const f of FIELDS) {
    const h = headers.find((x) => !used.has(x) && f.synonyms.includes(normHeader(x)));
    if (h) take(f.key, h);
  }
  for (const f of FIELDS) {
    if (map[f.key]) continue;
    const h = headers.find((x) => !used.has(x) && normHeader(x).length > 2 && f.synonyms.some((s) => s.length > 3 && normHeader(x).includes(s)));
    if (h) take(f.key, h);
  }
  // A full name column wins over first/last only when there is no first-name column.
  if (map.full_name && map.first_name) delete map.full_name;
  return map;
}

export type DateOrder = "dmy" | "mdy";
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const ymd = (y: number, m: number, d: number): string | null => {
  if (y < 100) y += y > (new Date().getFullYear() % 100) ? 1900 : 2000;
  if (y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  if (dt.getTime() > Date.now()) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

// Look at slash dates in a column to tell day-first from month-first. Defaults to day-first.
export function detectDateOrder(values: unknown[]): DateOrder {
  for (const v of values) {
    const m = String(v ?? "").trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
    if (!m) continue;
    if (Number(m[1]) > 12) return "dmy";
    if (Number(m[2]) > 12) return "mdy";
  }
  return "dmy";
}

// Accepts Excel serial numbers, Date objects, 1990-05-15, 15/05/1990, 15-5-90, 15 May 1990, May 15, 1990.
export function parseDate(v: unknown, order: DateOrder = "dmy"): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date && !isNaN(v.getTime())) return ymd(v.getFullYear(), v.getMonth() + 1, v.getDate());
  if (typeof v === "number") {
    if (v < 1 || v > 80000) return null;
    const dt = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000);
    return ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})/);
  if (m) return ymd(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/) || s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})[ T]/);
  if (m) return order === "dmy" ? ymd(+m[3], +m[2], +m[1]) : ymd(+m[3], +m[1], +m[2]);
  m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s-]+([a-z]{3,})\.?,?[\s-]+(\d{2,4})$/i);
  if (m) { const mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase()); return mi < 0 ? null : ymd(+m[3], mi + 1, +m[1]); }
  m = s.match(/^([a-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{2,4})$/i);
  if (m) { const mi = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()); return mi < 0 ? null : ymd(+m[3], mi + 1, +m[2]); }
  if (/^\d{5}(\.\d+)?$/.test(s)) return parseDate(Number(s), order);
  return null;
}

export type Gender = "male" | "female" | "other";
export function parseGender(v: unknown): Gender | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (!s) return null;
  if (["m", "male", "man", "boy", "mr"].includes(s)) return "male";
  if (["f", "female", "woman", "girl", "ms", "mrs", "miss"].includes(s)) return "female";
  if (["o", "other", "x", "nonbinary", "non-binary", "unspecified", "prefer not to say"].includes(s)) return "other";
  return null;
}

export const cleanPhone = (v: unknown) => String(v ?? "").replace(/\D/g, "");
export const keyOf = (v: unknown) => String(v ?? "").replace(/[\s-]/g, "").toLowerCase();

export type ImportOptions = { dateOrder: DateOrder; missingGender: "skip" | Gender; today?: Date };

export type PatientRow = {
  full_name: string; phone: string; gender: Gender; date_of_birth: string | null;
  email: string | null; cnic: string | null; father_name: string | null; blood_group: string | null;
  address: string | null; city: string | null; allergies: string | null; major_diseases: string | null;
  marital_status: string | null; medical_history: string | null;
  emergency_contact_name: string | null; emergency_contact_phone: string | null;
};
export type RowResult = { row: number; data?: PatientRow; problem?: string; source: Record<string, unknown> };

const txt = (v: unknown, max = 500) => { const s = String(v ?? "").trim(); return s ? s.slice(0, max) : null; };

// Turn one spreadsheet row into a patient, or say what is wrong with it. `row` is the sheet row number.
export function mapRow(src: Record<string, unknown>, row: number, map: Mapping, opt: ImportOptions): RowResult {
  const get = (k: FieldKey) => (map[k] ? src[map[k]!] : undefined);
  const name = txt(get("full_name"), 200) || [txt(get("first_name"), 100), txt(get("last_name"), 100)].filter(Boolean).join(" ").trim();
  if (!name) return { row, source: src, problem: "No name" };
  const phone = cleanPhone(get("phone"));
  if (!phone) return { row, source: src, problem: "No phone number" };
  if (phone.length < 6 || phone.length > 15) return { row, source: src, problem: `Phone number looks wrong (${String(get("phone"))})` };

  let gender = parseGender(get("gender"));
  if (!gender) {
    if (String(get("gender") ?? "").trim()) return { row, source: src, problem: `Gender not recognised (${String(get("gender"))})` };
    if (opt.missingGender === "skip") return { row, source: src, problem: "No gender" };
    gender = opt.missingGender;
  }

  let dob: string | null = null;
  const rawDob = get("date_of_birth");
  if (rawDob !== undefined && String(rawDob).trim() !== "") {
    dob = parseDate(rawDob, opt.dateOrder);
    if (!dob) return { row, source: src, problem: `Date of birth not recognised (${String(rawDob)})` };
  } else {
    const age = Number(String(get("age") ?? "").replace(/[^\d.]/g, ""));
    if (age > 0 && age < 125) {
      const t = opt.today || new Date();
      dob = `${t.getFullYear() - Math.floor(age)}-01-01`;
    }
  }

  const email = txt(get("email"), 200);
  return {
    row, source: src,
    data: {
      full_name: name, phone, gender, date_of_birth: dob,
      email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
      cnic: txt(get("cnic"), 40), father_name: txt(get("father_name"), 200), blood_group: txt(get("blood_group"), 10),
      address: txt(get("address")), city: txt(get("city"), 100), allergies: txt(get("allergies"), 1000),
      major_diseases: txt(get("major_diseases"), 1000), marital_status: txt(get("marital_status"), 40),
      medical_history: txt(get("medical_history"), 4000),
      emergency_contact_name: txt(get("emergency_contact_name"), 200),
      emergency_contact_phone: cleanPhone(get("emergency_contact_phone")) || null,
    },
  };
}

export type DryRun = { ready: RowResult[]; duplicates: RowResult[]; problems: RowResult[] };

// Same phone AND same name = the same person. Families often share one phone, so phone alone is not enough.
export const personKey = (phone: unknown, name: unknown) => `${keyOf(phone)}|${String(name ?? "").trim().toLowerCase().replace(/\s+/g, " ")}`;

// Check every row: problems, people already in the system (same phone and name, or same ID), and repeats inside the file.
export function dryRun(rows: Record<string, unknown>[], map: Mapping, opt: ImportOptions, existing: { people: Set<string>; ids: Set<string> }, firstRow = 2): DryRun {
  const out: DryRun = { ready: [], duplicates: [], problems: [] };
  const seenPhone = new Map<string, number>(), seenId = new Map<string, number>();
  rows.forEach((src, i) => {
    const r = mapRow(src, i + firstRow, map, opt);
    if (!r.data) { out.problems.push(r); return; }
    const p = personKey(r.data.phone, r.data.full_name), c = keyOf(r.data.cnic);
    if (existing.people.has(p)) { out.duplicates.push({ ...r, problem: "Already a patient with this name and phone number" }); return; }
    if (c && existing.ids.has(c)) { out.duplicates.push({ ...r, problem: "Already a patient with this ID number" }); return; }
    if (seenPhone.has(p)) { out.duplicates.push({ ...r, problem: `Same name and phone as row ${seenPhone.get(p)}` }); return; }
    if (c && seenId.has(c)) { out.duplicates.push({ ...r, problem: `Same ID number as row ${seenId.get(c)}` }); return; }
    seenPhone.set(p, r.row); if (c) seenId.set(c, r.row);
    out.ready.push(r);
  });
  return out;
}
