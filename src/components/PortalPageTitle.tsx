import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Sets "<Page> | Zonoir" as the browser title on portal (signed-in) pages.
// Public/SEO pages set their own titles via useSEO and are left alone.
const PORTAL_PREFIXES = [
  "/doctor/", "/clinic/", "/receptionist/", "/doctor-receptionist/", "/admin/", "/content-writer/", "/app",
  "/dashboard", "/patients", "/appointments", "/doctors", "/pending-doctors", "/support-tickets",
  "/login", "/auth", "/doctor-auth", "/receptionist-auth", "/admin-login", "/forgot-password", "/reset-password",
  "/referral-partner/",
];

const LABELS: Record<string, string> = {
  dashboard: "Dashboard", patients: "Patients", appointments: "Appointments", waitlist: "Waitlist", leads: "Leads",
  procedures: "Procedures", allergies: "Allergies", medicines: "Medicines", diseases: "Diseases", templates: "Templates",
  "icd-codes": "ICD Codes", finance: "Finance", reports: "Reports", summary: "Summary", "medicine-report": "Medicine Report",
  "walk-in": "Walk-in", profile: "Profile", support: "Support", schedule: "Schedule", schedules: "Schedules",
  "doctor-schedules": "Doctor Schedules", calendar: "Calendar", subscription: "Subscription", receptionists: "Receptionists",
  "activity-logs": "Activity Logs", doctors: "Doctors", "add-doctor": "Add Doctor", expenses: "Expenses",
  specializations: "Specializations", inventory: "Inventory", suppliers: "Suppliers", products: "Products",
  "purchase-orders": "Purchase Orders", invoices: "Invoices", stock: "Stock", adjustments: "Adjustments", ledger: "Ledger",
  memberships: "Memberships", settings: "Settings", clinics: "Clinics", "chatbot-leads": "Chatbot Leads",
  "referral-partners": "Referral Partners", "content-writers": "Content Writers", blogs: "Blogs",
  "registered-doctors": "Registered Doctors", "pending-doctors": "Pending Doctors", "support-tickets": "Support Tickets",
  "doctor-patients": "Doctor Patients", "knowledge-base": "Knowledge Base", more: "More",
  login: "Log in", auth: "Clinic Sign up", "doctor-auth": "Doctor Sign up", "receptionist-auth": "Receptionist Log in",
  "admin-login": "Admin Log in", "forgot-password": "Forgot Password", "reset-password": "Reset Password",
};

const isId = (s: string) => /^[0-9a-f-]{16,}$/i.test(s) || /^\d+$/.test(s);
const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function portalTitle(pathname: string): string | null {
  if (!PORTAL_PREFIXES.some((p) => pathname === p.replace(/\/$/, "") || pathname.startsWith(p))) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const last = parts[parts.length - 1];
  if (isId(last) && parts.length >= 2) {
    const parent = LABELS[parts[parts.length - 2]] ?? titleCase(parts[parts.length - 2]);
    const singular = parent.replace(/ies$/, "y").replace(/s$/, "");
    return `${singular} details | Zonoir`;
  }
  const label = LABELS[last] ?? (["doctor", "clinic", "receptionist", "admin", "app"].includes(last) ? "Dashboard" : titleCase(last));
  return `${label} | Zonoir`;
}

const PortalPageTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const t = portalTitle(pathname);
    if (t) document.title = t;
  }, [pathname]);
  return null;
};

export default PortalPageTitle;
