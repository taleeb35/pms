import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, DollarSign, Trash2, Loader2 } from "lucide-react";

const AdminSettings = () => {
  const [supportEmail, setSupportEmail] = useState("");
  const [doctorMonthlyFee, setDoctorMonthlyFee] = useState("");
  const [singleDoctorMonthlyFee, setSingleDoctorMonthlyFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingFee, setSavingFee] = useState(false);
  const [savingSingleDoctorFee, setSavingSingleDoctorFee] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Fetch support email
    const { data: emailData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "support_email")
      .maybeSingle();

    if (emailData) {
      setSupportEmail(emailData.value);
    }

    // Fetch doctor monthly fee
    const { data: feeData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "doctor_monthly_fee")
      .maybeSingle();

    if (feeData) {
      setDoctorMonthlyFee(feeData.value);
    }

    // Fetch single doctor monthly fee
    const { data: singleFeeData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "single_doctor_monthly_fee")
      .maybeSingle();

    if (singleFeeData) {
      setSingleDoctorMonthlyFee(singleFeeData.value);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("system_settings")
      .upsert({
        key: "support_email",
        value: supportEmail,
        updated_at: new Date().toISOString(),
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update support email",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Support email updated successfully",
    });
  };

  const handleSaveFee = async () => {
    if (!doctorMonthlyFee || isNaN(Number(doctorMonthlyFee))) {
      toast({
        title: "Error",
        description: "Please enter a valid fee amount",
        variant: "destructive",
      });
      return;
    }

    setSavingFee(true);
    const { error } = await supabase
      .from("system_settings")
      .upsert({
        key: "doctor_monthly_fee",
        value: doctorMonthlyFee,
        updated_at: new Date().toISOString(),
      });

    setSavingFee(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update doctor monthly fee",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Doctor monthly fee updated successfully",
    });
  };

  const handleSaveSingleDoctorFee = async () => {
    if (!singleDoctorMonthlyFee || isNaN(Number(singleDoctorMonthlyFee))) {
      toast({
        title: "Error",
        description: "Please enter a valid fee amount",
        variant: "destructive",
      });
      return;
    }

    setSavingSingleDoctorFee(true);
    const { error } = await supabase
      .from("system_settings")
      .upsert({
        key: "single_doctor_monthly_fee",
        value: singleDoctorMonthlyFee,
        updated_at: new Date().toISOString(),
      });

    setSavingSingleDoctorFee(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update single doctor monthly fee",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Single doctor monthly fee updated successfully",
    });
  };

  const handleCleanupOrphanedUsers = async () => {
    setCleaningUp(true);
    try {
      const { data, error } = await supabase.functions.invoke("cleanup-orphaned-users");
      
      if (error) throw error;
      
      toast({
        title: "Cleanup Complete",
        description: `Deleted ${data.deletedCount} orphaned user(s). ${data.failedCount > 0 ? `Failed: ${data.failedCount}` : ''}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cleanup orphaned users",
        variant: "destructive",
      });
    } finally {
      setCleaningUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage system configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Doctor Monthly Fee
          </CardTitle>
          <CardDescription>
            Set the monthly fee per doctor. Clinics will be charged based on their number of doctors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor-fee">Monthly Fee Per Doctor (PKR)</Label>
            <Input
              id="doctor-fee"
              type="number"
              placeholder="10000"
              value={doctorMonthlyFee}
              onChange={(e) => setDoctorMonthlyFee(e.target.value)}
            />
            {doctorMonthlyFee && !isNaN(Number(doctorMonthlyFee)) && (
              <p className="text-sm text-muted-foreground">
                Example: A clinic with 5 doctors will pay PKR {(Number(doctorMonthlyFee) * 5).toLocaleString()} per month
              </p>
            )}
          </div>
          <Button onClick={handleSaveFee} disabled={savingFee}>
            {savingFee ? "Saving..." : "Save Fee"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Single Doctor Monthly Fee
          </CardTitle>
          <CardDescription>
            Set the monthly fee for single doctors (not affiliated with any clinic).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="single-doctor-fee">Monthly Fee Per Single Doctor (PKR)</Label>
            <Input
              id="single-doctor-fee"
              type="number"
              placeholder="6000"
              value={singleDoctorMonthlyFee}
              onChange={(e) => setSingleDoctorMonthlyFee(e.target.value)}
            />
            {singleDoctorMonthlyFee && !isNaN(Number(singleDoctorMonthlyFee)) && (
              <p className="text-sm text-muted-foreground">
                Single doctors will pay PKR {Number(singleDoctorMonthlyFee).toLocaleString()} per month
              </p>
            )}
          </div>
          <Button onClick={handleSaveSingleDoctorFee} disabled={savingSingleDoctorFee}>
            {savingSingleDoctorFee ? "Saving..." : "Save Fee"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Support Email
          </CardTitle>
          <CardDescription>
            Email address where doctor inquiries will be sent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email Address</Label>
            <Input
              id="support-email"
              type="email"
              placeholder="support@example.com"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Cleanup Orphaned Users
          </CardTitle>
          <CardDescription>
            Remove auth users that are not linked to any doctor, clinic, or receptionist. 
            This allows deleted users to sign up again with the same email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleCleanupOrphanedUsers} 
            disabled={cleaningUp}
          >
            {cleaningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cleaningUp ? "Cleaning up..." : "Cleanup Orphaned Users"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
