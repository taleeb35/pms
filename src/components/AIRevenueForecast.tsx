import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertTriangle, Lightbulb, Target, RefreshCw, BarChart3, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ForecastData {
  forecast: {
    forecast_next_month: {
      estimated_revenue: number;
      estimated_patients: number;
      confidence: string;
    };
    forecast_next_quarter: {
      estimated_revenue: number;
      estimated_patients: number;
    };
    trends: {
      revenue_direction: string;
      revenue_change_percent: number;
      patient_direction: string;
      patient_change_percent: number;
    };
    insights: string[];
    recommendations: string[];
    risk_alerts: string[];
  };
  monthly_data: { month: string; revenue: number; patients: number; expenses: number }[];
  summary: {
    totalRevenue: number;
    totalPatients: number;
    totalExpenses: number;
    avgMonthlyRevenue: number;
    avgMonthlyPatients: number;
  };
}

interface AIRevenueForecastProps {
  role: "doctor" | "clinic";
}

const formatCurrency = (amount: number) => {
  return `Rs. ${Math.round(amount).toLocaleString()}`;
};

const getMonthLabel = (monthStr: string) => {
  const [year, month] = monthStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(month) - 1]} ${year}`;
};

export const AIRevenueForecast = ({ role }: AIRevenueForecastProps) => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
        return;
      }

      const { data: fnData, error } = await supabase.functions.invoke("ai-revenue-forecast", {
        body: { role },
      });

      if (error) {
        console.error("Forecast error:", error);
        toast({ title: "Error", description: "Failed to generate forecast", variant: "destructive" });
        return;
      }

      if (fnData?.error) {
        toast({ title: "Error", description: fnData.error, variant: "destructive" });
        return;
      }

      setData(fnData);
      setHasLoaded(true);
    } catch (err) {
      console.error("Forecast error:", err);
      toast({ title: "Error", description: "Failed to generate forecast", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const TrendIcon = ({ direction }: { direction: string }) => {
    if (direction === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (direction === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const confidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      high: "bg-green-500/10 text-green-600 border-green-500/20",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      low: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return <Badge className={colors[confidence] || colors.low}>{confidence} confidence</Badge>;
  };

  // Simple bar chart using divs
  const SimpleBarChart = ({ monthlyData }: { monthlyData: ForecastData["monthly_data"] }) => {
    const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
    return (
      <div className="flex items-end gap-2 h-32 mt-4">
        {monthlyData.map((m) => (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-medium">
              {formatCurrency(m.revenue)}
            </span>
            <div
              className="w-full bg-primary/80 rounded-t-sm min-h-[4px] transition-all"
              style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{getMonthLabel(m.month)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!hasLoaded) {
    return (
      <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Revenue Forecasting</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get AI-powered revenue predictions, trend analysis, and actionable recommendations based on your financial history.
            </p>
          </div>
          <Button onClick={fetchForecast} disabled={loading} className="gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Generate Forecast"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { forecast, monthly_data, summary } = data;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Revenue Forecast
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchForecast} disabled={loading} className="gap-1">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Forecast Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Next Month</span>
              {confidenceBadge(forecast.forecast_next_month.confidence)}
            </div>
            <div className="text-2xl font-bold">{formatCurrency(forecast.forecast_next_month.estimated_revenue)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              ~{forecast.forecast_next_month.estimated_patients} patients expected
            </div>
          </div>
          <div className="p-4 rounded-lg bg-accent/50 border">
            <span className="text-sm font-medium text-muted-foreground">Next Quarter</span>
            <div className="text-2xl font-bold mt-2">{formatCurrency(forecast.forecast_next_quarter.estimated_revenue)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              ~{forecast.forecast_next_quarter.estimated_patients} patients expected
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <TrendIcon direction={forecast.trends.revenue_direction} />
            <div>
              <div className="text-sm font-medium">Revenue Trend</div>
              <div className="text-xs text-muted-foreground">
                {forecast.trends.revenue_direction === "up" ? "+" : forecast.trends.revenue_direction === "down" ? "-" : ""}
                {Math.abs(forecast.trends.revenue_change_percent)}% {forecast.trends.revenue_direction}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <TrendIcon direction={forecast.trends.patient_direction} />
            <div>
              <div className="text-sm font-medium">Patient Trend</div>
              <div className="text-xs text-muted-foreground">
                {forecast.trends.patient_direction === "up" ? "+" : forecast.trends.patient_direction === "down" ? "-" : ""}
                {Math.abs(forecast.trends.patient_change_percent)}% {forecast.trends.patient_direction}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue History Chart */}
        {monthly_data.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1">Revenue History (Last 6 Months)</h4>
            <SimpleBarChart monthlyData={monthly_data} />
          </div>
        )}

        {/* Risk Alerts */}
        {forecast.risk_alerts && forecast.risk_alerts.length > 0 && forecast.risk_alerts[0] && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Risk Alerts
            </h4>
            {forecast.risk_alerts.map((alert, i) => (
              <div key={i} className="text-sm p-2.5 rounded-md bg-destructive/5 border border-destructive/10 text-destructive">
                {alert}
              </div>
            ))}
          </div>
        )}

        {/* Insights */}
        {forecast.insights && forecast.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-yellow-500" /> Key Insights
            </h4>
            <ul className="space-y-1.5">
              {forecast.insights.map((insight, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {forecast.recommendations && forecast.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" /> Recommendations
            </h4>
            <ul className="space-y-1.5">
              {forecast.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Footer */}
        <div className="pt-3 border-t text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span>Avg Monthly: {formatCurrency(summary.avgMonthlyRevenue)}</span>
          <span>Avg Patients: {Math.round(summary.avgMonthlyPatients)}/mo</span>
          {summary.totalExpenses > 0 && <span>Total Expenses: {formatCurrency(summary.totalExpenses)}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
