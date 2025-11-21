import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CitySelect } from "@/components/CitySelect";
import { Building2, Mail, Phone, MapPin, User, Lock, Stethoscope, Briefcase, FileText } from "lucide-react";

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    introduction: "",
    specialization: "",
    qualification: "",
    experience_years: "",
    consultation_fee: "",
    contact_number: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [letterheadUrl, setLetterheadUrl] = useState<string>("");
  const [uploadingLetterhead, setUploadingLetterhead] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/doctor-auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: doctorData } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData && doctorData) {
      setProfile({
        full_name: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        city: doctorData.city || "",
        introduction: doctorData.introduction || "",
        specialization: doctorData.specialization || "",
        qualification: doctorData.qualification || "",
        experience_years: doctorData.experience_years?.toString() || "",
        consultation_fee: doctorData.consultation_fee?.toString() || "",
        contact_number: doctorData.contact_number || "",
      });
      
      // Load letterhead image URL
      const savedUrl = localStorage.getItem(`letterhead_url_${user.id}`);
      if (savedUrl) {
        setLetterheadUrl(savedUrl);
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq("id", user.id);

    if (profileError) {
      toast({ title: "Error updating profile", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error: doctorError } = await supabase
      .from("doctors")
      .update({
        city: profile.city,
        introduction: profile.introduction,
        specialization: profile.specialization,
        qualification: profile.qualification,
        experience_years: profile.experience_years ? parseInt(profile.experience_years) : null,
        consultation_fee: profile.consultation_fee ? parseFloat(profile.consultation_fee) : null,
        contact_number: profile.contact_number,
      })
      .eq("id", user.id);

    if (doctorError) {
      toast({ title: "Error updating doctor info", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Profile updated successfully" });
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword
    });

    if (error) {
      toast({ title: "Error updating password", variant: "destructive" });
      return;
    }

    toast({ title: "Password updated successfully" });
    setPasswordData({ newPassword: "", confirmPassword: "" });
  };

  const handleLetterheadUpload = async () => {
    if (!letterheadFile) {
      toast({ title: "Please select a file first", variant: "destructive" });
      return;
    }

    setUploadingLetterhead(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not authenticated", variant: "destructive" });
        setUploadingLetterhead(false);
        return;
      }

      const fileExt = letterheadFile.name.split(".").pop();
      const fileName = `letterheads/${user.id}-${Date.now()}.${fileExt}`;
      
      console.log("Uploading letterhead:", fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(fileName, letterheadFile, { upsert: true });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "Upload Error",
          description: uploadError.message || "Failed to upload letterhead",
          variant: "destructive",
        });
        setUploadingLetterhead(false);
        return;
      }
      
      console.log("Upload successful:", uploadData);
      
      const { data: urlData } = supabase.storage
        .from("medical-documents")
        .getPublicUrl(fileName);
      
      const uploadedUrl = urlData.publicUrl;
      console.log("Public URL:", uploadedUrl);
      
      setLetterheadUrl(uploadedUrl);
      localStorage.setItem(`letterhead_url_${user.id}`, uploadedUrl);
      
      toast({ title: "Success", description: "Letterhead uploaded successfully" });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      setLetterheadFile(null);
    } catch (error: any) {
      console.error("Exception during upload:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUploadingLetterhead(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Profile</h1>
          <p className="text-muted-foreground">Manage your professional information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input value={profile.email} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  City
                </Label>
                <CitySelect
                  value={profile.city}
                  onValueChange={(value) => setProfile({ ...profile, city: value })}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  Specialization
                </Label>
                <Select
                  value={profile.specialization}
                  onValueChange={(value) => setProfile({ ...profile, specialization: value })}
                >
                  <SelectTrigger className="border-primary/20 focus:border-primary">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                    <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="Neurologist">Neurologist</SelectItem>
                    <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="General Physician">General Physician</SelectItem>
                    <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                    <SelectItem value="ENT Specialist">ENT Specialist</SelectItem>
                    <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Qualification
                </Label>
                <Input
                  value={profile.qualification}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  placeholder="e.g., MBBS, MD"
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience (Years)</Label>
                  <Input
                    type="number"
                    value={profile.experience_years}
                    onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Consultation Fee</Label>
                  <Input
                    type="number"
                    value={profile.consultation_fee}
                    onChange={(e) => setProfile({ ...profile, consultation_fee: e.target.value })}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  value={profile.contact_number}
                  onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Introduction
                </Label>
                <Textarea
                  value={profile.introduction}
                  onChange={(e) => setProfile({ ...profile, introduction: e.target.value })}
                  rows={3}
                  placeholder="Brief introduction about yourself"
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Letterhead Settings Card */}
          <Card className="border-secondary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-secondary" />
                Upload Letterhead
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Letterhead Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLetterheadFile(e.target.files?.[0] || null)}
                    className="border-secondary/20 focus:border-secondary"
                  />
                </div>

                <Button 
                  onClick={handleLetterheadUpload} 
                  disabled={uploadingLetterhead || !letterheadFile}
                  className="w-full"
                  variant="secondary"
                >
                  {uploadingLetterhead ? "Uploading..." : "Upload Letterhead"}
                </Button>

                {letterheadUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Current Letterhead:</p>
                    <img 
                      src={letterheadUrl} 
                      alt="Letterhead" 
                      className="w-full border rounded"
                    />
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  This letterhead will appear on printed visit records
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card className="border-accent/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="border-accent/20 focus:border-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="border-accent/20 focus:border-accent"
                  />
                </div>

                <Button type="submit" variant="secondary" className="w-full">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
