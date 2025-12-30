import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Plus, ArrowLeft, Mail, Phone, Users, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TableSkeleton from "@/components/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CitySelect } from "@/components/CitySelect";
import { validateName, validatePhone, validateEmail, handleNameInput, handlePhoneInput, handleNumberInput } from "@/lib/validations";
import { useClinicId } from "@/hooks/useClinicId";
import DeletingOverlay from "@/components/DeletingOverlay";

interface Doctor {
  id: string;
  specialization: string;
  experience_years: number | null;
  consultation_fee: number | null;
  clinic_percentage: number | null;
  contact_number: string | null;
  city: string | null;
  introduction: string | null;
  pmdc_number: string | null;
  profiles: {
    full_name: string;
    email: string;
    date_of_birth: string | null;
  };
}

const ClinicDoctors = () => {
  const navigate = useNavigate();
  const { clinicId, isReceptionist, loading: clinicLoading } = useClinicId();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedDoctors, setRequestedDoctors] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    date_of_birth: "",
    contact_number: "",
    specialization: "",
    experience_years: "",
    consultation_fee: "",
    clinic_percentage: "",
    city: "",
    introduction: "",
    pmdc_number: "",
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (clinicId) {
      fetchDoctors();
    }
  }, [clinicId]);

  const fetchDoctors = async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      // Fetch clinic's requested doctor limit
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("requested_doctors")
        .eq("id", clinicId)
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
          clinic_percentage,
          contact_number,
          city,
          introduction,
          pmdc_number,
          profiles(full_name, email, date_of_birth)
        `)
        .eq("clinic_id", clinicId)
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
      full_name: doctor.profiles?.full_name || "",
      email: doctor.profiles?.email || "",
      date_of_birth: doctor.profiles?.date_of_birth || "",
      contact_number: doctor.contact_number || "",
      specialization: doctor.specialization,
      experience_years: doctor.experience_years?.toString() || "",
      consultation_fee: doctor.consultation_fee?.toString() || "",
      clinic_percentage: doctor.clinic_percentage?.toString() || "0",
      city: doctor.city || "",
      introduction: doctor.introduction || "",
      pmdc_number: doctor.pmdc_number || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDoctor = async () => {
    if (!selectedDoctor) return;

    // Comprehensive validation
    const errors: string[] = [];
    
    const nameValidation = validateName(editForm.full_name);
    if (!nameValidation.isValid) errors.push(`Name: ${nameValidation.message}`);
    
    const emailValidation = validateEmail(editForm.email);
    if (!emailValidation.isValid) errors.push(`Email: ${emailValidation.message}`);
    
    if (editForm.contact_number) {
      const phoneValidation = validatePhone(editForm.contact_number);
      if (!phoneValidation.isValid) errors.push(`Contact Number: ${phoneValidation.message}`);
    }
    
    if (!editForm.specialization) errors.push("Specialization is required");
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    try {
      // Update doctor table
      const { error: doctorError } = await supabase
        .from("doctors")
        .update({
          specialization: editForm.specialization,
          experience_years: editForm.experience_years ? parseInt(editForm.experience_years) : null,
          consultation_fee: editForm.consultation_fee ? parseFloat(editForm.consultation_fee) : null,
          clinic_percentage: editForm.clinic_percentage ? parseFloat(editForm.clinic_percentage) : 0,
          contact_number: editForm.contact_number || null,
          city: editForm.city || null,
          introduction: editForm.introduction || null,
          pmdc_number: editForm.pmdc_number || null,
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

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;
    
    setIsDeleteDialogOpen(false);
    setIsDeleting(true);
    
    try {
      // Delete medical documents first (depends on patients)
      await supabase.from("medical_documents").delete().eq("uploaded_by", selectedDoctor.id);
      
      // Delete prescriptions (depends on medical records)
      await supabase.from("prescriptions").delete().eq("doctor_id", selectedDoctor.id);
      
      // Delete medical records
      await supabase.from("medical_records").delete().eq("doctor_id", selectedDoctor.id);
      
      // Delete all appointments for this doctor
      await supabase.from("appointments").delete().eq("doctor_id", selectedDoctor.id);

      // Delete all visit records for this doctor
      await supabase.from("visit_records").delete().eq("doctor_id", selectedDoctor.id);

      // Delete all patients created by this doctor
      await supabase.from("patients").delete().eq("created_by", selectedDoctor.id);

      // Delete doctor schedules
      await supabase.from("doctor_schedules").delete().eq("doctor_id", selectedDoctor.id);

      // Delete doctor leaves
      await supabase.from("doctor_leaves").delete().eq("doctor_id", selectedDoctor.id);

      // Delete doctor templates
      await supabase.from("doctor_disease_templates").delete().eq("doctor_id", selectedDoctor.id);
      await supabase.from("doctor_test_templates").delete().eq("doctor_id", selectedDoctor.id);
      await supabase.from("doctor_report_templates").delete().eq("doctor_id", selectedDoctor.id);
      await supabase.from("doctor_sick_leave_templates").delete().eq("doctor_id", selectedDoctor.id);
      await supabase.from("doctor_work_leave_templates").delete().eq("doctor_id", selectedDoctor.id);

      // Delete procedures
      await supabase.from("procedures").delete().eq("doctor_id", selectedDoctor.id);

      // Delete wait list entries
      await supabase.from("wait_list").delete().eq("doctor_id", selectedDoctor.id);

      // Delete doctor payments
      await supabase.from("doctor_payments").delete().eq("doctor_id", selectedDoctor.id);

      // Delete user role
      await supabase.from("user_roles").delete().eq("user_id", selectedDoctor.id);

      // Delete the doctor record
      const { error: doctorError } = await supabase
        .from("doctors")
        .delete()
        .eq("id", selectedDoctor.id);
      
      if (doctorError) throw doctorError;

      toast({
        title: "Doctor Deleted",
        description: "Doctor and all associated data have been deleted successfully",
      });

      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DeletingOverlay isVisible={isDeleting} message="Deleting Doctor..." />
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Fee (PKR)</TableHead>
                    <TableHead>Clinic Share</TableHead>
                    <TableHead>Dr Share</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableSkeleton columns={8} rows={5} />
                </TableBody>
              </Table>
            </div>
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
                    <TableHead>Clinic Share</TableHead>
                    <TableHead>Dr Share</TableHead>
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
                            <div className="font-semibold">{doctor.profiles?.full_name || "Unknown Doctor"}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {doctor.profiles?.email || "N/A"}
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
                        <span className="font-semibold text-primary">{doctor.clinic_percentage || 0}%</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-success">{100 - (doctor.clinic_percentage || 0)}%</span>
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
                          {!isReceptionist && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          )}
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
                  onChange={(e) => {
                    const value = handleNameInput(e);
                    setEditForm({ ...editForm, full_name: value });
                    const validation = validateName(value);
                    setEditFormErrors(prev => ({ ...prev, full_name: validation.isValid ? "" : validation.message }));
                  }}
                  placeholder="Enter full name"
                  className={editFormErrors.full_name ? "border-destructive" : ""}
                />
                {editFormErrors.full_name && <p className="text-sm text-destructive">{editFormErrors.full_name}</p>}
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm({ ...editForm, email: e.target.value });
                    const validation = validateEmail(e.target.value);
                    setEditFormErrors(prev => ({ ...prev, email: validation.isValid ? "" : validation.message }));
                  }}
                  placeholder="Enter email"
                  className={editFormErrors.email ? "border-destructive" : ""}
                />
                {editFormErrors.email && <p className="text-sm text-destructive">{editFormErrors.email}</p>}
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={editForm.date_of_birth}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Number *</Label>
                <Input
                  value={editForm.contact_number}
                  onChange={(e) => {
                    const value = handlePhoneInput(e);
                    setEditForm({ ...editForm, contact_number: value });
                    if (value) {
                      const validation = validatePhone(value);
                      setEditFormErrors(prev => ({ ...prev, contact_number: validation.isValid ? "" : validation.message }));
                    } else {
                      setEditFormErrors(prev => ({ ...prev, contact_number: "" }));
                    }
                  }}
                  placeholder="Enter contact number"
                  className={editFormErrors.contact_number ? "border-destructive" : ""}
                />
                {editFormErrors.contact_number && <p className="text-sm text-destructive">{editFormErrors.contact_number}</p>}
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
                <Label>Clinic Share (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.clinic_percentage}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                    setEditForm({ ...editForm, clinic_percentage: val.toString() });
                  }}
                  placeholder="e.g., 30"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  % of earnings for clinic
                </p>
              </div>
              <div>
                <CitySelect
                  value={editForm.city}
                  onValueChange={(value) => setEditForm({ ...editForm, city: value })}
                  label="City"
                />
              </div>
              <div>
                <Label>PMDC Number</Label>
                <Input
                  value={editForm.pmdc_number}
                  onChange={(e) => setEditForm({ ...editForm, pmdc_number: e.target.value })}
                  placeholder="e.g., 12345-P"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pakistan Medical & Dental Council registration
                </p>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Are you sure you want to delete <strong>{selectedDoctor?.profiles?.full_name}</strong>?</p>
                <p className="text-destructive font-medium">
                  This will permanently delete:
                </p>
                <ul className="list-disc list-inside text-destructive text-sm">
                  <li>All patients created by this doctor</li>
                  <li>All appointments</li>
                  <li>All visit records</li>
                  <li>All templates and schedules</li>
                </ul>
                <p className="font-medium">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDoctor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Doctor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
};

export default ClinicDoctors;
