import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, TrendingUp, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PaymentData {
  month: string;
  amount: number;
  status: string;
}

const AdminAnalyticsCharts = () => {
  const [revenueData, setRevenueData] = useState<PaymentData[]>([]);
  const [datePeriod, setDatePeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [datePeriod, customStartDate, customEndDate]);

  const getDateRange = () => {
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date = today;

    if (datePeriod === "custom" && customStartDate && customEndDate) {
      startDate = startOfDay(customStartDate);
      endDate = endOfDay(customEndDate);
    } else if (datePeriod === "1") {
      // Last month
      startDate = startOfMonth(subMonths(today, 1));
      endDate = endOfMonth(subMonths(today, 1));
    } else if (datePeriod === "2") {
      // Last 2 months
      startDate = startOfMonth(subMonths(today, 2));
      endDate = endOfMonth(subMonths(today, 1));
    } else if (datePeriod === "3") {
      // Last 3 months
      startDate = startOfMonth(subMonths(today, 3));
      endDate = endOfMonth(subMonths(today, 1));
    } else if (datePeriod === "6") {
      // Last 6 months
      startDate = startOfMonth(subMonths(today, 6));
      endDate = endOfMonth(subMonths(today, 1));
    }

    return { startDate, endDate };
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      let query = supabase
        .from("clinic_payments")
        .select("month, amount, status")
        .eq("status", "paid")
        .order("month", { ascending: true });

      if (startDate) {
        query = query.gte("month", format(startDate, "yyyy-MM-dd"));
      }
      if (datePeriod !== "all") {
        query = query.lte("month", format(endDate, "yyyy-MM-dd"));
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by month
      const grouped: { [key: string]: number } = {};
      (data || []).forEach(payment => {
        if (payment.month) {
          const monthKey = format(new Date(payment.month), "yyyy-MM");
          grouped[monthKey] = (grouped[monthKey] || 0) + (payment.amount || 0);
        }
      });

      const result = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ 
          month, 
          amount, 
          status: "paid" 
        }));

      setRevenueData(result);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  // Revenue Chart Data
  const getRevenueChartData = () => {
    return {
      labels: revenueData.map(d => format(new Date(d.month + "-01"), "MMM yyyy")),
      datasets: [{
        label: 'Revenue',
        data: revenueData.map(d => d.amount),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }],
    };
  };

  const getBarChartData = () => {
    return {
      labels: revenueData.map(d => format(new Date(d.month + "-01"), "MMM yyyy")),
      datasets: [{
        label: 'Revenue',
        data: revenueData.map(d => d.amount),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return 'PKR ' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.amount, 0);
  const avgRevenue = revenueData.length > 0 ? Math.round(totalRevenue / revenueData.length) : 0;

  if (loading) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue Analytics
          </CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={datePeriod} onValueChange={(value) => {
              setDatePeriod(value);
              if (value !== "custom") {
                setCustomStartDate(undefined);
                setCustomEndDate(undefined);
              }
            }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1">Last Month</SelectItem>
                <SelectItem value="2">Last 2 Months</SelectItem>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            {datePeriod === "custom" && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[130px] justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "dd MMM yyyy") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[130px] justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "dd MMM yyyy") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      disabled={(date) => date > new Date() || (customStartDate && date < customStartDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-primary">PKR {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-success/5 to-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Avg/Month</span>
            </div>
            <p className="text-2xl font-bold text-success">PKR {avgRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts */}
        {revenueData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Banknote className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No revenue data available for the selected period</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border/40 bg-card">
              <h4 className="font-medium mb-4 text-center">Revenue Trend</h4>
              <div className="h-[300px]">
                <Line data={getRevenueChartData()} options={chartOptions} />
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border/40 bg-card">
              <h4 className="font-medium mb-4 text-center">Monthly Revenue</h4>
              <div className="h-[300px]">
                <Bar data={getBarChartData()} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAnalyticsCharts;
