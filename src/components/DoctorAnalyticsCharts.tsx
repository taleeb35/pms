import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfDay, endOfDay } from "date-fns";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Patient {
  id: string;
  gender: string;
  date_of_birth: string;
  city: string | null;
}

interface RevenueData {
  date: string;
  total: number;
}

const DoctorAnalyticsCharts = () => {
  const [activeChart, setActiveChart] = useState("gender");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenuePeriod, setRevenuePeriod] = useState("7");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeChart === "revenue") {
      fetchRevenueData();
    }
  }, [activeChart, revenuePeriod]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("patients")
        .select("id, gender, date_of_birth, city")
        .eq("created_by", user.id);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const days = parseInt(revenuePeriod);
      const startDate = format(subDays(new Date(), days - 1), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date, total_fee")
        .eq("doctor_id", user.id)
        .eq("status", "completed")
        .gte("appointment_date", startDate)
        .order("appointment_date", { ascending: true });

      if (error) throw error;

      // Group by date and sum
      const grouped: { [key: string]: number } = {};
      
      // Initialize all days with 0
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        grouped[date] = 0;
      }

      // Sum revenue by date
      (data || []).forEach(apt => {
        if (apt.appointment_date && grouped[apt.appointment_date] !== undefined) {
          grouped[apt.appointment_date] += apt.total_fee || 0;
        }
      });

      const result = Object.entries(grouped).map(([date, total]) => ({
        date,
        total,
      }));

      setRevenueData(result);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Gender Chart Data
  const getGenderData = () => {
    const maleCount = patients.filter(p => p.gender === "male").length;
    const femaleCount = patients.filter(p => p.gender === "female").length;
    const otherCount = patients.filter(p => p.gender === "other").length;

    return {
      labels: ['Male', 'Female', 'Other'],
      datasets: [{
        data: [maleCount, femaleCount, otherCount],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
      }],
    };
  };

  // Age Distribution Chart Data
  const getAgeData = () => {
    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-45': 0,
      '46-60': 0,
      '60+': 0,
    };

    patients.forEach(p => {
      const age = calculateAge(p.date_of_birth);
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 30) ageGroups['19-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['60+']++;
    });

    return {
      labels: Object.keys(ageGroups),
      datasets: [{
        label: 'Patients',
        data: Object.values(ageGroups),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }],
    };
  };

  // City Distribution Chart Data
  const getCityData = () => {
    const cityGroups: { [key: string]: number } = {};

    patients.forEach(p => {
      const city = p.city || 'Unknown';
      cityGroups[city] = (cityGroups[city] || 0) + 1;
    });

    // Sort by count and take top 10
    const sorted = Object.entries(cityGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: sorted.map(([city]) => city),
      datasets: [{
        label: 'Patients',
        data: sorted.map(([, count]) => count),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }],
    };
  };

  // Revenue Chart Data
  const getRevenueData = () => {
    return {
      labels: revenueData.map(d => format(new Date(d.date), "dd MMM")),
      datasets: [{
        label: 'Revenue',
        data: revenueData.map(d => d.total),
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
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.total, 0);
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Analytics</CardTitle>
          {activeChart === "revenue" && (
            <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="gender">Gender</TabsTrigger>
            <TabsTrigger value="age">Age</TabsTrigger>
            <TabsTrigger value="city">City</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="gender" className="mt-0">
            <div className="flex flex-col items-center">
              <div className="h-[300px] w-full max-w-[400px]">
                <Doughnut data={getGenderData()} options={chartOptions} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-500">{patients.filter(p => p.gender === "male").length}</p>
                  <p className="text-sm text-muted-foreground">Male</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-pink-500">{patients.filter(p => p.gender === "female").length}</p>
                  <p className="text-sm text-muted-foreground">Female</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-500">{patients.filter(p => p.gender === "other").length}</p>
                  <p className="text-sm text-muted-foreground">Other</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="age" className="mt-0">
            <div className="h-[300px]">
              <Bar data={getAgeData()} options={barOptions} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Patient distribution by age groups
            </p>
          </TabsContent>

          <TabsContent value="city" className="mt-0">
            <div className="h-[300px]">
              <Bar data={getCityData()} options={barOptions} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Top 10 cities by patient count
            </p>
          </TabsContent>

          <TabsContent value="revenue" className="mt-0">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-accent/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-accent/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">{avgRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-[280px]">
              <Line data={getRevenueData()} options={lineOptions} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Revenue trend over the selected period
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DoctorAnalyticsCharts;