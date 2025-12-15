import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay, differenceInDays } from "date-fns";

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
  created_by: string;
  created_at: string;
}

interface Doctor {
  id: string;
  profiles: {
    full_name: string;
  };
}

interface RevenueData {
  date: string;
  total: number;
}

interface ClinicAnalyticsChartsProps {
  clinicId?: string; // Optional: for receptionists who need to pass the clinic ID
}

const ClinicAnalyticsCharts = ({ clinicId: propClinicId }: ClinicAnalyticsChartsProps = {}) => {
  const [activeChart, setActiveChart] = useState("gender");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [datePeriod, setDatePeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(propClinicId || null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctors.length > 0) {
      fetchPatients();
    }
  }, [doctors, selectedDoctor]);

  useEffect(() => {
    filterPatientsByDate();
  }, [patients, datePeriod, customStartDate, customEndDate]);

  useEffect(() => {
    if (activeChart === "revenue" && doctors.length > 0) {
      fetchRevenueData();
    }
  }, [activeChart, datePeriod, customStartDate, customEndDate, selectedDoctor, doctors]);

  const fetchDoctors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use prop clinicId if provided (for receptionists), otherwise use user.id (for clinic owners)
      const targetClinicId = propClinicId || user.id;
      setClinicId(targetClinicId);

      const { data, error } = await supabase
        .from("doctors")
        .select(`
          id,
          profiles(full_name)
        `)
        .eq("clinic_id", targetClinicId);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const doctorIds = selectedDoctor === "all" 
        ? doctors.map(d => d.id) 
        : [selectedDoctor];

      if (doctorIds.length === 0) {
        setPatients([]);
        return;
      }

      const { data, error } = await supabase
        .from("patients")
        .select("id, gender, date_of_birth, city, created_by, created_at")
        .in("created_by", doctorIds);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date = today;

    if (datePeriod === "custom" && customStartDate && customEndDate) {
      startDate = startOfDay(customStartDate);
      endDate = endOfDay(customEndDate);
    } else if (datePeriod !== "all") {
      const days = parseInt(datePeriod);
      startDate = subDays(today, days - 1);
    }

    return { startDate, endDate };
  };

  const filterPatientsByDate = () => {
    if (datePeriod === "all") {
      setFilteredPatients(patients);
      return;
    }

    const { startDate, endDate } = getDateRange();
    if (!startDate) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(p => {
      const createdAt = new Date(p.created_at);
      return !isBefore(createdAt, startOfDay(startDate)) && !isAfter(createdAt, endOfDay(endDate));
    });

    setFilteredPatients(filtered);
  };

  const fetchRevenueData = async () => {
    try {
      const doctorIds = selectedDoctor === "all" 
        ? doctors.map(d => d.id) 
        : [selectedDoctor];

      if (doctorIds.length === 0) {
        setRevenueData([]);
        return;
      }

      const { startDate, endDate } = getDateRange();

      let query = supabase
        .from("appointments")
        .select("appointment_date, total_fee")
        .in("doctor_id", doctorIds)
        .eq("status", "completed")
        .order("appointment_date", { ascending: true });

      if (startDate) {
        query = query.gte("appointment_date", format(startDate, "yyyy-MM-dd"));
      }
      query = query.lte("appointment_date", format(endDate, "yyyy-MM-dd"));

      const { data, error } = await query;

      if (error) throw error;

      // Calculate days for grouping
      let days: number;
      if (datePeriod === "custom" && customStartDate && customEndDate) {
        days = differenceInDays(customEndDate, customStartDate) + 1;
      } else if (datePeriod === "all") {
        // For "all", just use the data as is without padding
        const grouped: { [key: string]: number } = {};
        (data || []).forEach(apt => {
          if (apt.appointment_date) {
            grouped[apt.appointment_date] = (grouped[apt.appointment_date] || 0) + (apt.total_fee || 0);
          }
        });
        const result = Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, total]) => ({ date, total }));
        setRevenueData(result);
        return;
      } else {
        days = parseInt(datePeriod);
      }

      // Group by date and sum
      const grouped: { [key: string]: number } = {};
      
      // Initialize all days with 0
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(datePeriod === "custom" && customEndDate ? customEndDate : new Date(), i), "yyyy-MM-dd");
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
    const maleCount = filteredPatients.filter(p => p.gender === "male").length;
    const femaleCount = filteredPatients.filter(p => p.gender === "female").length;
    const otherCount = filteredPatients.filter(p => p.gender === "other").length;

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

    filteredPatients.forEach(p => {
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

    filteredPatients.forEach(p => {
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

  if (loading && doctors.length === 0) {
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
          <CardTitle className="text-xl font-semibold">Analytics</CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.profiles?.full_name || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
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
                      className="pointer-events-auto"
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
                      disabled={(date) => date > new Date() || (customStartDate ? date < customStartDate : false)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
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
                  <p className="text-2xl font-bold text-blue-500">{filteredPatients.filter(p => p.gender === "male").length}</p>
                  <p className="text-sm text-muted-foreground">Male</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-pink-500">{filteredPatients.filter(p => p.gender === "female").length}</p>
                  <p className="text-sm text-muted-foreground">Female</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-500">{filteredPatients.filter(p => p.gender === "other").length}</p>
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

export default ClinicAnalyticsCharts;
