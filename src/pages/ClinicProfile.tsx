import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const ClinicProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    created_at: "",
  });

  const [clinic, setClinic] = useState({
    clinic_name: "",
    phone_number: "",
    address: "",
    city: "",
    status: "",
    no_of_doctors: 0,
    requested_doctors: 0,
  });

  const [doctorMonthlyFee, setDoctorMonthlyFee] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setProfile({
        full_name: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        city: profileData.city || "",
        created_at: profileData.created_at || "",
      });

      // Fetch clinic
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", user.id)
        .single();

      if (clinicError) throw clinicError;

      setClinic({
        clinic_name: clinicData.clinic_name || "",
        phone_number: clinicData.phone_number || "",
        address: clinicData.address || "",
        city: clinicData.city || "",
        status: clinicData.status || "",
        no_of_doctors: clinicData.no_of_doctors || 0,
        requested_doctors: clinicData.requested_doctors || 0,
      });

      // Fetch doctor monthly fee from system settings
      const { data: feeData, error: feeError } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "doctor_monthly_fee")
        .single();

      if (feeError) {
        console.error("Error fetching doctor fee:", feeError);
      }

      if (feeData) {
        setDoctorMonthlyFee(parseFloat(feeData.value) || 0);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update clinic
      const { error: clinicError } = await supabase
        .from("clinics")
        .update({
          clinic_name: clinic.clinic_name,
          phone_number: clinic.phone_number,
          address: clinic.address,
          city: clinic.city,
        })
        .eq("id", user.id);

      if (clinicError) throw clinicError;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-4xl font-bold tracking-tight">Clinic Profile</h2>
            <Badge variant={clinic.status === "active" ? "default" : "secondary"}>
              {clinic.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-base">
            Manage your clinic information and account settings
          </p>
        </div>
      </div>

      {/* Clinic Information */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            Clinic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic_name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Clinic Name
              </Label>
              <Input
                id="clinic_name"
                value={clinic.clinic_name}
                onChange={(e) => setClinic({ ...clinic, clinic_name: e.target.value })}
                placeholder="Enter clinic name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Clinic Phone
              </Label>
              <Input
                id="clinic_phone"
                value={clinic.phone_number}
                onChange={(e) => setClinic({ ...clinic, phone_number: e.target.value })}
                placeholder="Enter clinic phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic_city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                City
              </Label>
              <Input
                id="clinic_city"
                value={clinic.city}
                onChange={(e) => setClinic({ ...clinic, city: e.target.value })}
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Total Doctors
              </Label>
              <Input
                value={clinic.no_of_doctors}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinic_address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Clinic Address
            </Label>
            <Input
              id="clinic_address"
              value={clinic.address}
              onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
              placeholder="Enter full address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email (Read-only)
              </Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Personal Phone
              </Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="border-border/40 bg-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <p className="font-semibold">
                  {format(new Date(profile.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Fee</p>
                <p className="font-semibold text-2xl text-success">
                  PKR {(doctorMonthlyFee * clinic.requested_doctors).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {doctorMonthlyFee.toLocaleString()} × {clinic.requested_doctors} doctors
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleUpdate} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ClinicProfile;
