import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Plus, ArrowLeft, Mail, Phone, Users, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CitySelect } from "@/components/CitySelect";

interface Doctor {
  id: string;
  specialization: string;
  experience_years: number | null;
  consultation_fee: number | null;
  contact_number: string | null;
  city: string | null;
  introduction: string | null;
  profiles: {
    full_name: string;
    email: string;
    date_of_birth: string | null;
  };
}

const ClinicDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedDoctors, setRequestedDoctors] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    date_of_birth: "",
    contact_number: "",
    specialization: "",
    experience_years: "",
    consultation_fee: "",
    city: "",
    introduction: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch clinic's requested doctor limit
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("requested_doctors")
        .eq("id", user.id)
        .single();

      if (clinicError) throw clinicError;
      setRequestedDoctors(clinicData.requested_doctors || 0);

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          experience_years,
          consultation_fee,
          contact_number,
          city,
          introduction,
          profiles(full_name, email, date_of_birth)
        `)
        .eq("clinic_id", user.id)
        .order("created_at", { ascending: false });

      if (doctorsError) throw doctorsError;
      setDoctors(doctorsData || []);
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

  const canAddMoreDoctors = doctors.length < requestedDoctors;

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditForm({
      full_name: doctor.profiles.full_name,
      email: doctor.profiles.email,
      date_of_birth: doctor.profiles.date_of_birth || "",
      contact_number: doctor.contact_number || "",
      specialization: doctor.specialization,
      experience_years: doctor.experience_years?.toString() || "",
      consultation_fee: doctor.consultation_fee?.toString() || "",
      city: doctor.city || "",
      introduction: doctor.introduction || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      // Update doctor table
      const { error: doctorError } = await supabase
        .from("doctors")
        .update({
          specialization: editForm.specialization,
          experience_years: editForm.experience_years ? parseInt(editForm.experience_years) : null,
          consultation_fee: editForm.consultation_fee ? parseFloat(editForm.consultation_fee) : null,
          contact_number: editForm.contact_number || null,
          city: editForm.city || null,
          introduction: editForm.introduction || null,
        })
        .eq("id", selectedDoctor.id);

      if (doctorError) throw doctorError;

      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          date_of_birth: editForm.date_of_birth || null,
        })
        .eq("id", selectedDoctor.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Doctor details updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchDoctors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/clinic/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Doctor Listing</CardTitle>
              <CardDescription>
                Manage all doctors registered under your clinic ({doctors.length}/{requestedDoctors} used)
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate("/clinic/add-doctor")}
              disabled={!canAddMoreDoctors}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Doctor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No doctors added yet</h3>
              <p className="text-muted-foreground mb-6">Start by adding your first doctor to the clinic</p>
              <Button onClick={() => navigate("/clinic/add-doctor")} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Doctor
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Fee (PKR)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-info" />
                          </div>
                          <div>
                            <div className="font-semibold">{doctor.profiles.full_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {doctor.profiles.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{doctor.specialization}</span>
                      </TableCell>
                      <TableCell>
                        {doctor.contact_number ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {doctor.contact_number}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doctor.experience_years ? (
                          <span>{doctor.experience_years} years</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doctor.consultation_fee ? (
                          <span className="font-semibold">PKR {doctor.consultation_fee.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDoctor(doctor)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/clinic/patients?doctorId=${doctor.id}`)}
                            className="gap-2"
                          >
                            <Users className="h-4 w-4" />
                            View Patients
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

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Number *</Label>
                <Input
                  value={editForm.contact_number}
                  onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <Label>Specialization *</Label>
                <Select
                  value={editForm.specialization}
                  onValueChange={(value) => setEditForm({ ...editForm, specialization: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                    <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="Neurologist">Neurologist</SelectItem>
                    <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                    <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                    <SelectItem value="General Physician">General Physician</SelectItem>
                    <SelectItem value="ENT Specialist">ENT Specialist</SelectItem>
                    <SelectItem value="Ophthalmologist">Ophthalmologist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience (Years) *</Label>
                <Input
                  type="number"
                  value={editForm.experience_years}
                  onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })}
                  placeholder="Years of experience"
                />
              </div>
              <div>
                <Label>Consultation Fee (PKR) *</Label>
                <Input
                  type="number"
                  value={editForm.consultation_fee}
                  onChange={(e) => setEditForm({ ...editForm, consultation_fee: e.target.value })}
                  placeholder="Fee amount"
                />
              </div>
              <div>
                <CitySelect
                  value={editForm.city}
                  onValueChange={(value) => setEditForm({ ...editForm, city: value })}
                  label="City"
                />
              </div>
              <div className="col-span-2">
                <Label>Introduction</Label>
                <Textarea
                  value={editForm.introduction}
                  onChange={(e) => setEditForm({ ...editForm, introduction: e.target.value })}
                  placeholder="Brief introduction about the doctor"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDoctor}>
                Update Doctor
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicDoctors;
