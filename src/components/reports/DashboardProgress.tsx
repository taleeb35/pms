import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportsOverview from "./ReportsOverview";

// Dashboard: progress for a chosen time span (today, 7 / 30 / 90 days, this or last month, this year),
// compared with the period before. Full detail lives in Reports.
export default function DashboardProgress({ scope }: { scope: "doctor" | "clinic" }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" /> Your progress</CardTitle>
        <Link to={`/${scope}/reports`} className="flex items-center gap-1 text-sm text-primary hover:underline">Full reports <ArrowRight className="h-4 w-4" /></Link>
      </CardHeader>
      <CardContent>
        <ReportsOverview scope={scope} compact />
      </CardContent>
    </Card>
  );
}
