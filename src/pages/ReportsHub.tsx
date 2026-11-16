import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportsOverview from "@/components/reports/ReportsOverview";
import { useSEO } from "@/hooks/useSEO";

// One place for money and reports. Each tab is a sub-section; the sidebar links straight to tabs.
const DoctorFinance = lazy(() => import("./DoctorFinance"));
const DoctorSummary = lazy(() => import("./DoctorSummary"));
const DoctorReports = lazy(() => import("./DoctorReports"));
const DoctorMedicineReport = lazy(() => import("./DoctorMedicineReport"));
const ClinicFinance = lazy(() => import("./ClinicFinance"));
const ClinicExpenses = lazy(() => import("./ClinicExpenses"));
const ClinicReports = lazy(() => import("./ClinicReports"));

type Tab = { id: string; label: string; hint: string; render: () => JSX.Element };

export default function ReportsHub({ scope }: { scope: "doctor" | "clinic" }) {
  useSEO({ title: "Reports | Zonoir", description: "Money and reports" });
  const [params, setParams] = useSearchParams();

  const tabs: Tab[] = scope === "doctor"
    ? [
        { id: "overview", label: "Overview", hint: "Key numbers compared with the previous period", render: () => <ReportsOverview scope="doctor" /> },
        { id: "money", label: "Finance", hint: "Every completed visit and its fees, with Excel and PDF export", render: () => <DoctorFinance /> },
        { id: "today", label: "Daily summary", hint: "One day's patients and revenue", render: () => <DoctorSummary /> },
        { id: "analytics", label: "Patients & visits", hint: "Patient mix, appointment trends and peak hours", render: () => <DoctorReports /> },
        { id: "medicines", label: "Medicines", hint: "What you prescribe most", render: () => <DoctorMedicineReport /> },
      ]
    : [
        { id: "overview", label: "Overview", hint: "Key numbers compared with the previous period", render: () => <ReportsOverview scope="clinic" /> },
        { id: "money", label: "Finance", hint: "Revenue by visit and doctor, with Excel and PDF export", render: () => <ClinicFinance /> },
        { id: "expenses", label: "Expenses", hint: "Record and review clinic expenses", render: () => <ClinicExpenses /> },
        { id: "analytics", label: "Doctors & patients", hint: "Profit and loss, doctor scorecard, patient mix and peak hours", render: () => <ClinicReports /> },
      ];

  const active = tabs.some((t) => t.id === params.get("tab")) ? params.get("tab")! : "overview";
  const current = tabs.find((t) => t.id === active)!;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><BarChart3 className="h-6 w-6 text-primary" /> Reports</h1>
        <p className="text-sm text-muted-foreground">{current.hint}</p>
      </div>
      <Tabs value={active} onValueChange={(v) => setParams(v === "overview" ? {} : { tab: v }, { replace: true })}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max">
            {tabs.map((t) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
          </TabsList>
        </div>
        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-4">
            {t.id === active && (
              // The embedded pages keep their own filters and exports; their old page titles are hidden here.
              <div className={t.id === "overview" ? "" : "[&_h1]:sr-only"}>
                <Suspense fallback={<div className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>}>
                  {t.render()}
                </Suspense>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
