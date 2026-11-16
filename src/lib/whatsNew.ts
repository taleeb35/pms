// Entries for the "What's new" panel in the top bar. Newest first.
// Add an entry when a release changes something people use; the panel shows a dot until it's opened.
// `roles` limits an entry to portal areas (/doctor, /clinic, /receptionist, /doctor-receptionist); leave it out for everyone.
export type WhatsNewEntry = { id: string; date: string; title: string; body: string; link?: string; roles?: string[] };

export const WHATS_NEW: WhatsNewEntry[] = [
  { id: "2026-11-16-certificates", date: "2026-11-16", title: "Certificates with a QR code",
    body: "On a visit, Certificate prints a sick-leave, work-leave or fitness certificate from your templates. The QR code lets anyone check it is real, and you can cancel one later.",
    roles: ["/doctor"] },
  { id: "2026-11-16-merge", date: "2026-11-16", title: "Merge duplicate patients",
    body: "On a patient page, Merge duplicate moves the other record's appointments, visits, prescriptions and documents onto this patient and deletes the duplicate.",
    roles: ["/doctor", "/clinic"] },
  { id: "2026-11-16-queue", date: "2026-11-16", title: "Waiting-room queue screen",
    body: "Walk-In page → Queue screen opens today's queue with token numbers for a TV or tablet. It refreshes by itself and can show token numbers only.",
    link: "/queue" },
  { id: "2026-11-16-data", date: "2026-11-16", title: "Download all your data",
    body: "Profile → Download all my data gives one Excel file with your patients, appointments, visits, prescriptions and lists.",
    roles: ["/doctor", "/clinic"], link: "profile" },
  { id: "2026-11-16-finance-excel", date: "2026-11-16", title: "Finance to Excel",
    body: "Finance → Export Excel downloads the visits and totals for the dates you picked. Clinics also get expenses.",
    roles: ["/doctor", "/clinic", "/receptionist"], link: "finance" },
  { id: "2026-11-16-inline", date: "2026-11-16", title: "Change fee or status from the list",
    body: "In Appointments, click a status badge to change it, or click the fee to edit it, without opening the visit.",
    roles: ["/doctor", "/clinic"], link: "appointments" },
  { id: "2026-11-16-kb", date: "2026-11-16", title: "Help search looks inside articles",
    body: "The Knowledge Base search now finds words inside guides, not only their titles.", link: "knowledge-base" },
  { id: "2026-11-15-2fa", date: "2026-11-15", title: "Two-factor login and signed-in devices",
    body: "Profile → turn on an authenticator app code at sign-in, see signed-in devices, and sign out of the others.",
    roles: ["/doctor", "/clinic"], link: "profile" },
  { id: "2026-11-15-search", date: "2026-11-15", title: "Search from anywhere",
    body: "Press Ctrl+K (or the search button) to find a patient by name, phone or ID and jump to common pages." },
  { id: "2026-11-15-dark", date: "2026-11-15", title: "Dark mode and notification bell",
    body: "Use the moon/sun button in the top bar for dark mode. The bell lists today's next appointments and items that need updating." },
];

// Entries for a portal area, newest first.
export const entriesFor = (base: string | null) =>
  WHATS_NEW.filter((e) => !e.roles || (base !== null && e.roles.includes(base)));
