import { describe, it, expect } from "vitest";
import { parseBP, buildTrends } from "@/lib/labs";
import { cleanAnswers, newAllergies, visitDay, whoLabel } from "@/lib/intake";
import { guessMapping, parseDate, parseGender, detectDateOrder, dryRun, personKey, mapRow } from "@/lib/patientImport";
import { buildCalendarDays } from "@/lib/calendarItems";

describe("lab trends", () => {
  it("reads blood pressure written different ways", () => {
    expect(parseBP("120/80")).toEqual([120, 80]);
    expect(parseBP("110\\90")).toEqual([110, 90]);
    expect(parseBP("130 / 85 mmHg")).toEqual([130, 85]);
    expect(parseBP("normal")).toBeNull();
    expect(parseBP("12/8")).toBeNull();
  });

  it("makes a line only for tests with two or more numeric results, oldest first", () => {
    const t = buildTrends(
      [
        { test_name: "HbA1c", status: "done", result_value: 7.2, result_unit: "%", result_date: "2026-09-01", ordered_at: "2026-08-30T10:00:00Z" },
        { test_name: "hba1c ", status: "done", result_value: 6.8, result_unit: null, result_date: "2026-06-01", ordered_at: "2026-05-30T10:00:00Z" },
        { test_name: "CBC", status: "done", result_value: null, result_unit: null, result_date: "2026-06-01", ordered_at: "2026-05-30T10:00:00Z" },
        { test_name: "TSH", status: "ordered", result_value: null, result_unit: null, result_date: null, ordered_at: "2026-05-30T10:00:00Z" },
      ],
      [
        { visit_date: "2026-01-02T09:00:00Z", blood_pressure: "140/90", weight: "80 kg" },
        { visit_date: "2026-03-02T09:00:00Z", blood_pressure: "130/85", weight: "" },
      ],
    );
    expect(t.map((x) => x.key)).toEqual(["bp", "t:hba1c"]);
    expect(t[1].points.map((p) => p.value)).toEqual([6.8, 7.2]);
    expect(t[1].unit).toBe("%");
    expect(t[0].points[0]).toEqual({ date: "2026-01-02", value: 140, value2: 90 });
  });
});

describe("intake form", () => {
  it("keeps only known, non-empty answers", () => {
    expect(cleanAnswers({ reason: "  cough ", allergies: "", hack: "x", notes: 5 })).toEqual({ reason: "cough" });
  });
  it("writes a real date and does not repeat the doctor's name", () => {
    expect(visitDay("2026-11-16")).toBe("Monday 16 November");
    expect(whoLabel("Dr. Sarah Asif", "Dr. Sarah Asif ALGYNA")).toBe("Dr. Sarah Asif ALGYNA");
    expect(whoLabel("Dr. Ali", "City Clinic")).toBe("Dr. Ali, City Clinic");
    expect(whoLabel(null, "City Clinic")).toBe("City Clinic");
  });
  it("finds allergies the record does not already have", () => {
    expect(newAllergies("Penicillin, dust", "penicillin")).toBe("dust");
    expect(newAllergies("None", "")).toBe("");
    expect(newAllergies("nuts; nil", null)).toBe("nuts");
  });
});

describe("import wizard", () => {
  it("matches headers from other systems", () => {
    const m = guessMapping(["First Name", "Last Name", "Mobile Phone", "Date of Birth", "Sex", "Email Address", "Address 1", "City", "Notes"]);
    expect(m).toMatchObject({
      first_name: "First Name", last_name: "Last Name", phone: "Mobile Phone", date_of_birth: "Date of Birth",
      gender: "Sex", email: "Email Address", address: "Address 1", city: "City", medical_history: "Notes",
    });
    expect(m.full_name).toBeUndefined();
  });

  it("reads dates in many formats", () => {
    expect(parseDate("1990-05-15")).toBe("1990-05-15");
    expect(parseDate("15/05/1990", "dmy")).toBe("1990-05-15");
    expect(parseDate("05/15/1990", "mdy")).toBe("1990-05-15");
    expect(parseDate("15-5-90", "dmy")).toBe("1990-05-15");
    expect(parseDate("15 May 1990")).toBe("1990-05-15");
    expect(parseDate("May 15, 1990")).toBe("1990-05-15");
    expect(parseDate(32988)).toBe("1990-04-25");
    expect(parseDate("31/02/1990")).toBeNull();
    expect(parseDate("2999-01-01")).toBeNull();
    expect(detectDateOrder(["01/02/1990", "13/02/1990"])).toBe("dmy");
    expect(detectDateOrder(["02/13/1990"])).toBe("mdy");
  });

  it("reads gender words", () => {
    expect(parseGender("M")).toBe("male");
    expect(parseGender("Female")).toBe("female");
    expect(parseGender("?")).toBeNull();
  });

  it("dry run sorts rows into ready, duplicates and problems", () => {
    const map = { full_name: "Name", phone: "Phone", gender: "Sex", date_of_birth: "DOB", cnic: "ID" };
    const rows = [
      { Name: "Ali Khan", Phone: "0300-1234567", Sex: "m", DOB: "01/02/1980", ID: "" },
      { Name: "Sara Khan", Phone: "03001234567", Sex: "f", DOB: "", ID: "" },        // same phone, other person: fine
      { Name: "ali khan", Phone: "03001234567", Sex: "m", DOB: "", ID: "" },         // repeat of row 2
      { Name: "Old Patient", Phone: "0311 000 0000", Sex: "f", DOB: "", ID: "" },    // already in system
      { Name: "", Phone: "0300", Sex: "m", DOB: "", ID: "" },                        // no name
      { Name: "No Gender", Phone: "03219999999", Sex: "", DOB: "", ID: "" },         // gender missing
      { Name: "Bad Date", Phone: "03218888888", Sex: "f", DOB: "yesterday", ID: "" },
    ];
    const existing = { people: new Set([personKey("03110000000", "Old Patient")]), ids: new Set<string>() };
    const r = dryRun(rows, map, { dateOrder: "dmy", missingGender: "skip" }, existing);
    expect(r.ready.map((x) => x.row)).toEqual([2, 3]);
    expect(r.duplicates.map((x) => x.row)).toEqual([4, 5]);
    expect(r.problems.map((x) => x.problem)).toEqual(["No name", "No gender", "Date of birth not recognised (yesterday)"]);
    expect(r.ready[0].data).toMatchObject({ phone: "03001234567", date_of_birth: "1980-02-01", gender: "male" });

    const r2 = dryRun(rows, map, { dateOrder: "dmy", missingGender: "other" }, existing);
    expect(r2.ready.find((x) => x.row === 7)?.data?.gender).toBe("other");
  });

  it("joins first and last name and turns age into a birth year", () => {
    const r = mapRow({ F: "Ayesha", L: "Malik", P: "0333 1112223", G: "F", A: "40" }, 2,
      { first_name: "F", last_name: "L", phone: "P", gender: "G", age: "A" },
      { dateOrder: "dmy", missingGender: "skip", today: new Date(2026, 10, 16) });
    expect(r.data).toMatchObject({ full_name: "Ayesha Malik", date_of_birth: "1986-01-01" });
  });
});

describe("combined calendar", () => {
  it("merges appointments, leave and tasks per day, in time order, without leads or cancelled", () => {
    const days = buildCalendarDays(
      [
        { id: "a1", appointment_date: "2026-11-16", appointment_time: "10:30:00", status: "scheduled", patients: { full_name: "Ali" } },
        { id: "a2", appointment_date: "2026-11-16", appointment_time: "09:00:00", status: "cancelled" },
        { id: "a3", appointment_date: "2026-11-16", appointment_time: "11:00:00", status: "scheduled", source: "public_profile", lead_status: "active" },
      ],
      [{ id: "l1", leave_date: "2026-11-17", leave_type: "full_day", reason: null }],
      [
        { id: "t1", due_date: "2026-11-16", due_time: null, title: "Call lab", color: "blue", completed: false },
        { id: "t2", due_date: "2026-11-16", due_time: "08:00:00", title: "Rounds", color: "green", completed: false },
      ],
    );
    expect(days.get("2026-11-16")!.items.map((i) => i.id)).toEqual(["t2", "a1", "t1"]);
    expect(days.get("2026-11-17")!.leave?.id).toBe("l1");
    const noTasks = buildCalendarDays([], [], [{ id: "t1", due_date: "2026-11-16", due_time: null, title: "x", color: "blue", completed: false }], { appts: true, leaves: true, tasks: false });
    expect(noTasks.get("2026-11-16")).toBeUndefined();
  });
});
