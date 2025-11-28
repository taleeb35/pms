import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Mail, Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Clinic {
  id: string;
  clinic_name: string;
  city: string;
  phone_number: string;
  address: string;
  no_of_doctors: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinics")
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch doctor counts for each clinic
      const clinicsWithCounts = await Promise.all(
        data.map(async (clinic) => {
          const { count } = await supabase
            .from("doctors")
            .select("id", { count: "exact", head: true })
            .eq("clinic_id", clinic.id);
          return { ...clinic, no_of_doctors: count || 0 };
        })
      );
      setClinics(clinicsWithCounts);
    }
    setLoading(false);
  };

  const updateClinicStatus = async (clinicId: string, newStatus: string) => {
    setUpdating(clinicId);
    const { error } = await supabase
      .from("clinics")
      .update({ status: newStatus })
      .eq("id", clinicId);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Clinic status changed to ${newStatus}`,
      });
      fetchClinics();
    }
    setUpdating(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <Ban className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: clinics.length,
    active: clinics.filter(c => c.status === 'active').length,
    draft: clinics.filter(c => c.status === 'draft').length,
    suspended: clinics.filter(c => c.status === 'suspended').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Manage Clinics</h2>
        <p className="text-muted-foreground text-base">
          Review and approve clinic registrations, manage clinic status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clinics</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            <Ban className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Clinics List */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            All Clinics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading clinics...</p>
          ) : clinics.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No clinics registered yet</p>
          ) : (
            <div className="space-y-4">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="p-6 rounded-xl border border-border/40 hover:bg-accent/30 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{clinic.clinic_name}</h3>
                        <p className="text-sm text-muted-foreground">{clinic.profiles.full_name}</p>
                      </div>
                    </div>
                    {getStatusBadge(clinic.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{clinic.profiles.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{clinic.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{clinic.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{clinic.no_of_doctors} doctors</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                    <span className="text-sm text-muted-foreground">Change Status:</span>
                    <Select
                      value={clinic.status}
                      onValueChange={(value) => updateClinicStatus(clinic.id, value)}
                      disabled={updating === clinic.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Registered: {format(new Date(clinic.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClinics;
