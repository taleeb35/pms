import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock } from "lucide-react";

const DoctorProfile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", user.id)
        .single();

      if (doctorError) throw doctorError;
      setDoctorData(doctorData);
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.get("full_name") as string,
          phone: formData.get("phone") as string,
          city: formData.get("city") as string,
          address: formData.get("address") as string,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      const { error: doctorError } = await supabase
        .from("doctors")
        .update({
          specialization: formData.get("specialization") as string,
          qualification: formData.get("qualification") as string,
          experience_years: parseInt(formData.get("experience_years") as string),
          consultation_fee: parseFloat(formData.get("consultation_fee") as string),
          contact_number: formData.get("contact_number") as string,
          introduction: formData.get("introduction") as string,
        })
        .eq("id", user.id);

      if (doctorError) throw doctorError;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      e.currentTarget.reset();
    } catch (error: any) {
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your profile and account settings</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={profile?.full_name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={profile?.phone}
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      name="contact_number"
                      defaultValue={doctorData?.contact_number}
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={profile?.city}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      defaultValue={doctorData?.specialization}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      name="qualification"
                      defaultValue={doctorData?.qualification}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Experience (Years)</Label>
                    <Input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      defaultValue={doctorData?.experience_years}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation_fee">Consultation Fee</Label>
                    <Input
                      id="consultation_fee"
                      name="consultation_fee"
                      type="number"
                      step="0.01"
                      defaultValue={doctorData?.consultation_fee}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    defaultValue={profile?.address}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="introduction">Introduction</Label>
                  <Textarea
                    id="introduction"
                    name="introduction"
                    defaultValue={doctorData?.introduction}
                    placeholder="Brief introduction about yourself"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    required
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorProfile;
