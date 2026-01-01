import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, Copy, Coins, TrendingUp, LogOut, 
  Building2, Stethoscope, Clock, CheckCircle2, XCircle, Calendar, Filter
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths, startOfMonth } from "date-fns";

interface ReferralPartner {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  referral_code: string;
  status: string;
  commission_rate: number;
  total_earnings: number;
  total_referrals: number;
  created_at: string;
}

interface Referral {
  id: string;
  name: string;
  email?: string;
  type: "clinic" | "doctor";
  status: string;
  created_at: string;
}

interface MonthlyCommission {
  id: string;
  month: string;
  amount: number;
  clinic_name: string | null;
  clinic_email: string | null;
  doctor_name: string | null;
  doctor_email: string | null;
  entity_type: string;
}

const ReferralPartnerDashboard = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState<ReferralPartner | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [monthlyCommissions, setMonthlyCommissions] = useState<MonthlyCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Generate last 12 months for filter
  const getMonthOptions = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(startOfMonth(new Date()), i);
      months.push({
        value: format(date, "yyyy-MM-dd"),
        label: format(date, "MMMM yyyy")
      });
    }
    return months;
  };

  useEffect(() => {
    const storedPartner = sessionStorage.getItem("referral_partner");
    if (!storedPartner) {
      navigate("/referral-partner/login");
      return;
    }

    const partnerData = JSON.parse(storedPartner);
    
    const fetchAllData = async () => {
      try {
        // Fetch fresh partner data
        const { data: freshPartner, error: partnerError } = await supabase
          .from("referral_partners")
          .select("*")
          .eq("id", partnerData.id)
          .single();
        
        if (partnerError) {
          console.error("Error fetching partner data:", partnerError);
          setPartner(partnerData);
        } else if (freshPartner) {
          setPartner(freshPartner);
          sessionStorage.setItem("referral_partner", JSON.stringify(freshPartner));
        }

        const referralCode = freshPartner?.referral_code || partnerData.referral_code;
        const partnerId = freshPartner?.id || partnerData.id;

        // Fetch referral commissions
        const { data: commissions, error: commissionsError } = await supabase
          .from("referral_commissions")
          .select("*")
          .eq("referral_partner_id", partnerId)
          .order("month", { ascending: false });

        if (commissionsError) {
          console.error("Error fetching commissions:", commissionsError);
        } else {
          setMonthlyCommissions(commissions || []);
        }

        // Fetch clinics with this referral code
        const { data: clinics, error: clinicsError } = await supabase
          .from("clinics")
          .select("id, clinic_name, status, created_at")
          .eq("referred_by", referralCode);

        if (clinicsError) {
          console.error("Error fetching clinics:", clinicsError);
        }

        // Get clinic emails from profiles
        let clinicReferrals: Referral[] = [];
        if (clinics && clinics.length > 0) {
          const { data: clinicProfiles } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", clinics.map(c => c.id));

          clinicReferrals = clinics.map(clinic => ({
            id: clinic.id,
            name: clinic.clinic_name,
            email: clinicProfiles?.find(p => p.id === clinic.id)?.email,
            type: "clinic" as const,
            status: clinic.status,
            created_at: clinic.created_at,
          }));
        }

        // Fetch doctors with this referral code
        const { data: doctors, error: doctorsError } = await supabase
          .from("doctors")
          .select("id, specialization, approved, created_at")
          .eq("referred_by", referralCode);

        if (doctorsError) {
          console.error("Error fetching doctors:", doctorsError);
        }

        // Get doctor names and emails from profiles
        let doctorReferrals: Referral[] = [];
        if (doctors && doctors.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", doctors.map(d => d.id));

          doctorReferrals = doctors.map(doctor => ({
            id: doctor.id,
            name: profiles?.find(p => p.id === doctor.id)?.full_name || doctor.specialization,
            email: profiles?.find(p => p.id === doctor.id)?.email,
            type: "doctor" as const,
            status: doctor.approved ? "active" : "pending",
            created_at: doctor.created_at,
          }));
        }

        const allReferrals = [...clinicReferrals, ...doctorReferrals].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setReferrals(allReferrals);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [navigate]);

  const copyReferralCode = () => {
    if (partner) {
      navigator.clipboard.writeText(partner.referral_code);
      toast.success("Referral code copied to clipboard!");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("referral_partner");
    navigate("/referral-partner/login");
    toast.success("Logged out successfully");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
      case "subscribed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</Badge>;
      case "pending":
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "inactive":
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter commissions by selected month
  const filteredCommissions = selectedMonth === "all" 
    ? monthlyCommissions 
    : monthlyCommissions.filter(c => c.month === selectedMonth);

  // Calculate filtered earnings
  const filteredEarnings = filteredCommissions.reduce((sum, c) => sum + c.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!partner) return null;

  const approvedReferrals = referrals.filter(r => r.status === "active" || r.status === "approved" || r.status === "subscribed").length;
  const pendingReferrals = referrals.filter(r => r.status === "pending" || r.status === "draft").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome, {partner.full_name}!
            </h1>
            <p className="text-muted-foreground mt-1">Manage your referrals and track earnings</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-fit">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Your Referral Code</p>
                  <p className="text-2xl font-bold mt-1">{partner.referral_code}</p>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={copyReferralCode}
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Referrals</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{referrals.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="text-green-600">{approvedReferrals} active</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-yellow-600">{pendingReferrals} pending</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Commission Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{partner.commission_rate}%</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold mt-1">PKR {partner.total_earnings.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Coins className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table - Who signed up */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Your Referrals
            </CardTitle>
            <CardDescription>
              Clinics and doctors who signed up using your referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No referrals yet</h3>
                <p className="text-muted-foreground mt-1">
                  Share your referral code <span className="font-mono font-bold text-purple-600">{partner.referral_code}</span> to start earning!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.name}</TableCell>
                        <TableCell className="text-muted-foreground">{referral.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {referral.type === "clinic" ? (
                              <><Building2 className="h-3 w-3" /> Clinic</>
                            ) : (
                              <><Stethoscope className="h-3 w-3" /> Doctor</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(referral.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Earnings Table */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Monthly Earnings
                </CardTitle>
                <CardDescription>
                  Your commission earnings breakdown by month
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {getMonthOptions().map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedMonth !== "all" && (
              <div className="mb-4 p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Filtered Earnings: <span className="font-bold text-emerald-600">PKR {filteredEarnings.toLocaleString()}</span>
                </p>
              </div>
            )}
            {filteredCommissions.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No earnings {selectedMonth !== "all" ? "for this month" : "yet"}</h3>
                <p className="text-muted-foreground mt-1">
                  Your commission will appear here when referred clinics or doctors make payments
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">
                          {format(new Date(commission.month), "MMMM yyyy")}
                        </TableCell>
                        <TableCell>
                          {commission.entity_type === "clinic" 
                            ? commission.clinic_name 
                            : commission.doctor_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {commission.entity_type === "clinic" 
                            ? commission.clinic_email 
                            : commission.doctor_email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {commission.entity_type === "clinic" ? (
                              <><Building2 className="h-3 w-3" /> Clinic</>
                            ) : (
                              <><Stethoscope className="h-3 w-3" /> Doctor</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">
                          PKR {commission.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredCommissions.length > 0 && (
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <p className="text-sm font-medium">
                      Total: <span className="text-emerald-600 font-bold">PKR {filteredEarnings.toLocaleString()}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2">How Earnings Work</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You earn {partner.commission_rate}% commission on each successful referral payment</li>
              <li>• Commission is calculated each month when referred clinics or doctors pay their subscription</li>
              <li>• Your referrals appear above as soon as they sign up with your code</li>
              <li>• Earnings are recorded when payments are marked as paid by admin</li>
              <li>• Contact support for any questions about your earnings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralPartnerDashboard;