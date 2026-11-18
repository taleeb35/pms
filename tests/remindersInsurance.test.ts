import { describe, it, expect } from "vitest";
import { dueFollowUps, needsReminder, reminderText, followUpText } from "@/lib/reminders";
import { claimTotals } from "@/lib/insurance";

describe("reminders", () => {
  it("reminds booked appointments only, not unconverted leads or finished visits", () => {
    const base = { id: "a", appointment_date: "2026-11-19", appointment_time: "10:00:00", doctor_id: "d", reminder_sent_at: null };
    expect(needsReminder({ ...base, status: "scheduled" })).toBe(true);
    expect(needsReminder({ ...base, status: "completed" })).toBe(false);
    expect(needsReminder({ ...base, status: "scheduled", source: "public_profile", lead_status: "active" })).toBe(false);
    expect(needsReminder({ ...base, status: "scheduled", source: "public_profile", lead_status: "converted" })).toBe(true);
  });

  it("drops follow-ups the patient has already booked", () => {
    const v = (id: string, patient: string) => ({ id, patient_id: patient, doctor_id: "d", appointment_id: `ap-${id}`, visit_date: "2026-11-01T10:00:00Z", next_visit_date: "2026-11-15", next_visit_notes: null, recall_sent_at: null });
    const later = [
      { id: "x1", patient_id: "p1", doctor_id: "d", appointment_date: "2026-11-16", status: "scheduled" },
      { id: "x2", patient_id: "p2", doctor_id: "d", appointment_date: "2026-11-16", status: "cancelled" },
      { id: "ap-v3", patient_id: "p3", doctor_id: "d", appointment_date: "2026-11-02", status: "completed" },
    ];
    expect(dueFollowUps([v("v1", "p1"), v("v2", "p2"), v("v3", "p3")], later).map((x) => x.id)).toEqual(["v2", "v3"]);
  });

  it("writes the messages with the first name", () => {
    expect(reminderText({ patient: "Sana Khan", doctor: "Dr. Ali", day: "Thursday 19 November", time: "10:00 AM" }))
      .toBe("Hello Sana, this is a reminder of your appointment with Dr. Ali on Thursday 19 November at 10:00 AM. Please reply if you need to change it.");
    expect(followUpText({ patient: "Sana Khan", doctor: null, day: "Monday 23 November" })).toContain("your doctor asked to see you again around Monday 23 November");
  });
});

describe("insurance claims", () => {
  it("adds up money by stage", () => {
    const t = claimTotals([
      { status: "submitted", amount_claimed: 1000, amount_approved: null },
      { status: "approved", amount_claimed: 2000, amount_approved: null },
      { status: "partly_approved", amount_claimed: 2000, amount_approved: 1500 },
      { status: "paid", amount_claimed: 500, amount_approved: 400 },
      { status: "rejected", amount_claimed: 300, amount_approved: null },
      { status: "draft", amount_claimed: 700, amount_approved: null },
    ]);
    expect(t).toEqual({ count: 6, claimed: 6500, waiting: 1000, expected: 3500, paid: 400, rejected: 300 });
  });
});
