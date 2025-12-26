import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  TrendingUp,
  Copy,
  Eye,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

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
  type: "clinic" | "doctor";
  status: string;
  created_at: string;
}

const AdminReferralPartners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<ReferralPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<ReferralPartner | null>(null);
  const [partnerReferrals, setPartnerReferrals] = useState<Referral[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<ReferralPartner | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("referral_partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Failed to load referral partners");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerReferrals = async (code: string) => {
    try {
      const { data: clinics } = await supabase
        .from("clinics")
        .select("id, clinic_name, status, created_at")
        .eq("referred_by", code);

      const { data: doctors } = await supabase
        .from("doctors")
        .select("id, specialization, approved, created_at")
        .eq("referred_by", code);

      let doctorReferrals: Referral[] = [];
      if (doctors && doctors.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", doctors.map(d => d.id));

        doctorReferrals = doctors.map(doctor => ({
          id: doctor.id,
          name: profiles?.find(p => p.id === doctor.id)?.full_name || doctor.specialization,
          type: "doctor" as const,
          status: doctor.approved ? "approved" : "pending",
          created_at: doctor.created_at,
        }));
      }

      const clinicReferrals: Referral[] = (clinics || []).map(clinic => ({
        id: clinic.id,
        name: clinic.clinic_name,
        type: "clinic" as const,
        status: clinic.status,
        created_at: clinic.created_at,
      }));

      setPartnerReferrals([...clinicReferrals, ...doctorReferrals].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const handleViewDetails = async (partner: ReferralPartner) => {
    setSelectedPartner(partner);
    await fetchPartnerReferrals(partner.referral_code);
    setShowDetailsDialog(true);
  };

  const updatePartnerStatus = async (partnerId: string, newStatus: string) => {
    setActionLoading(partnerId);
    try {
      const partner = partners.find(p => p.id === partnerId);
      if (!partner) return;

      const { error } = await supabase
        .from("referral_partners")
        .update({ status: newStatus })
        .eq("id", partnerId);

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("send-referral-partner-email", {
          body: {
            full_name: partner.full_name,
            email: partner.email,
            referral_code: partner.referral_code,
            type: newStatus === "approved" ? "approved" : "rejected",
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      toast.success(`Partner ${newStatus === "approved" ? "approved" : "rejected"} successfully`);
      fetchPartners();
    } catch (error) {
      console.error("Error updating partner status:", error);
      toast.error("Failed to update partner status");
    } finally {
      setActionLoading(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Referral code copied!");
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    
    setActionLoading(partnerToDelete.id);
    try {
      // Send email notification before deleting
      try {
        await supabase.functions.invoke("send-referral-partner-email", {
          body: {
            full_name: partnerToDelete.full_name,
            email: partnerToDelete.email,
            referral_code: partnerToDelete.referral_code,
            type: "deleted",
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      const { error } = await supabase
        .from("referral_partners")
        .delete()
        .eq("id", partnerToDelete.id);

      if (error) throw error;

      toast.success("Referral partner deleted successfully");
      setPartnerToDelete(null);
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error("Failed to delete referral partner");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.referral_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: partners.length,
    pending: partners.filter(p => p.status === "pending").length,
    approved: partners.filter(p => p.status === "approved").length,
    totalEarnings: partners.reduce((sum, p) => sum + p.total_earnings, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Partners</h1>
        <p className="text-muted-foreground">Manage referral partner applications and track performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Partners</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Active Partners</p>
                <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Total Payouts</p>
                <p className="text-3xl font-bold text-purple-700">Rs. {stats.totalEarnings.toLocaleString()}</p>
              </div>
              <Coins className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Partners</CardTitle>
              <CardDescription>View and manage referral partner applications</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No partners found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No referral partners have signed up yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{partner.full_name}</p>
                          <p className="text-sm text-muted-foreground">{partner.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {partner.referral_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCode(partner.referral_code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          {partner.total_referrals}
                        </div>
                      </TableCell>
                      <TableCell>Rs. {partner.total_earnings.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(partner.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(partner)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {partner.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updatePartnerStatus(partner.id, "approved")}
                                disabled={actionLoading === partner.id}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updatePartnerStatus(partner.id, "rejected")}
                                disabled={actionLoading === partner.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setPartnerToDelete(partner)}
                            disabled={actionLoading === partner.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Partner Details</DialogTitle>
            <DialogDescription>
              View referral partner information and their referrals
            </DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedPartner.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedPartner.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPartner.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedPartner.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referral Code</p>
                  <code className="bg-muted px-2 py-1 rounded font-mono">
                    {selectedPartner.referral_code}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="font-medium">{selectedPartner.commission_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="font-medium">{partnerReferrals.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="font-medium">Rs. {selectedPartner.total_earnings.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Referrals ({partnerReferrals.length})</h4>
                {partnerReferrals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No referrals yet</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partnerReferrals.map((ref) => (
                          <TableRow key={ref.id}>
                            <TableCell>{ref.name}</TableCell>
                            <TableCell className="capitalize">{ref.type}</TableCell>
                            <TableCell>{getStatusBadge(ref.status)}</TableCell>
                            <TableCell>{format(new Date(ref.created_at), "MMM d, yyyy")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!partnerToDelete} onOpenChange={(open) => !open && setPartnerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Referral Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{partnerToDelete?.full_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePartner}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReferralPartners;
