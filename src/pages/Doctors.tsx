import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Users, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/CitySelect";
import { differenceInYears } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import DeletingOverlay from "@/components/DeletingOverlay";

interface Doctor {
  id: string;
  specialization: string;
  qualification: string;
  experience_years: number | null;
  consultation_fee: number | null;
  city: string | null;
  contact_number: string | null;
  license_number: string | null;
  introduction: string | null;
  approved: boolean;
  clinic_id: string | null;
  trial_end_date: string | null;
  payment_plan: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
  };
}

const getPaymentPlanBadge = (plan: string) => {
  if (plan === "yearly") {
    return <Badge className="bg-green-600 text-white">Yearly</Badge>;
  }
  return <Badge variant="outline">Monthly</Badge>;
};

const getTrialDaysRemaining = (trialEndDate: string | null): number | null => {
  if (!trialEndDate) return null;
  const trialEnd = new Date(trialEndDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = trialEnd.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

interface Specialization {
  id: string;
  name: string;
}

interface Clinic {
  id: string;
  clinic_name: string;
}

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Filters
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterAgeRange, setFilterAgeRange] = useState<string>("all");
  const [filterSpecialization, setFilterSpecialization] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterClinic, setFilterClinic] = useState<string>("all");
  
  // Specializations and Clinics from database
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [specializationOpen, setSpecializationOpen] = useState(false);
  const [clinicOpen, setClinicOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
    fetchClinics();
  }, []);

  const fetchSpecializations = async () => {
    const { data } = await supabase
      .from("specializations")
      .select("id, name")
      .order("name");
    if (data) {
      setSpecializations(data);
    }
  };

  const fetchClinics = async () => {
    const { data } = await supabase
      .from("clinics")
      .select("id, clinic_name")
      .order("clinic_name");
    if (data) {
      setClinics(data);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [doctors, filterCity, filterAgeRange, filterSpecialization, filterCategory, filterClinic]);

  const calculateAge = (dateOfBirth: string | null): number | null => {
    if (!dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const applyFilters = () => {
    let filtered = [...doctors];

    // City filter
    if (filterCity !== "all") {
      filtered = filtered.filter(d => d.city === filterCity);
    }

    // Age filter
    if (filterAgeRange !== "all") {
      filtered = filtered.filter(d => {
        const age = calculateAge(d.profiles.date_of_birth);
        if (!age) return false;
        
        switch (filterAgeRange) {
          case "under30": return age < 30;
          case "30-40": return age >= 30 && age <= 40;
          case "41-50": return age >= 41 && age <= 50;
          case "51-60": return age >= 51 && age <= 60;
          case "above60": return age > 60;
          default: return true;
        }
      });
    }

    // Specialization filter
    if (filterSpecialization !== "all") {
      filtered = filtered.filter(d => d.specialization === filterSpecialization);
    }

    // Category filter (Single Dr / Clinic Dr)
    if (filterCategory === "single") {
      filtered = filtered.filter(d => !d.clinic_id);
    } else if (filterCategory === "clinic") {
      filtered = filtered.filter(d => !!d.clinic_id);
    }

    // Clinic filter
    if (filterClinic !== "all") {
      filtered = filtered.filter(d => d.clinic_id === filterClinic);
    }

    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select(`
          *,
          profiles(full_name, email, phone, date_of_birth)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
      setFilteredDoctors(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching doctors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (doctorId: string, currentStatus: boolean) => {
    try {
      const doctor = doctors.find(d => d.id === doctorId);
      
      const { error } = await supabase
        .from("doctors")
        .update({ approved: !currentStatus })
        .eq("id", doctorId);

      if (error) throw error;

      // Send status change email to doctor
      if (doctor) {
        try {
          await supabase.functions.invoke("send-doctor-approval-email", {
            body: {
              doctorName: doctor.profiles?.full_name || "Doctor",
              email: doctor.profiles?.email,
              specialization: doctor.specialization || "General",
              status: !currentStatus ? 'approved' : 'pending'
            },
          });
        } catch (emailError) {
          console.error("Failed to send status email:", emailError);
        }
      }

      toast({
        title: "Success",
        description: `Doctor ${!currentStatus ? "activated" : "deactivated"} successfully`,
      });

      fetchDoctors();
      if (selectedDoctor?.id === doctorId) {
        setSelectedDoctor({ ...selectedDoctor, approved: !currentStatus });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteDoctor = async () => {
    if (!doctorToDelete) return;
    
    setDeleting(true);
    
    // Get count of patients that will be deleted
    const { count: patientCount } = await supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("created_by", doctorToDelete.id);

    // Delete the doctor (cascade will handle patients and appointments)
    const { error } = await supabase
      .from("doctors")
      .delete()
      .eq("id", doctorToDelete.id);

    if (error) {
      console.error("Doctor deletion error:", error);
      toast({
        title: "Error deleting doctor",
        description: error.message,
        variant: "destructive",
      });
      setDeleting(false);
      setDoctorToDelete(null);
      return;
    }

    // Delete the doctor user from auth.users via edge function
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.functions.invoke("delete-user", {
          body: { userId: doctorToDelete.id },
        });
      }
    } catch (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      // Continue anyway as the doctor record is already deleted
    }

    // Immediately update local state
    setDoctors(prevDoctors => prevDoctors.filter(d => d.id !== doctorToDelete.id));
    setFilteredDoctors(prevDoctors => prevDoctors.filter(d => d.id !== doctorToDelete.id));
    
    toast({
      title: "Doctor deleted successfully",
      description: `Deleted 1 doctor and ${patientCount || 0} associated patients`,
    });
    
    setDialogOpen(false);
    setSelectedDoctor(null);
    setDeleting(false);
    setDoctorToDelete(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);

  const uniqueCities = Array.from(new Set(doctors.map(d => d.city).filter(Boolean)));
  const uniqueSpecializations = Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)));

  return (
    <>
      <DeletingOverlay isVisible={deleting} message="Deleting Doctor..." />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Doctors</h2>
          <p className="text-muted-foreground">Manage doctor profiles</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Filter by City</Label>
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city!}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Age</Label>
              <Select value={filterAgeRange} onValueChange={setFilterAgeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="under30">Under 30</SelectItem>
                  <SelectItem value="30-40">30-40</SelectItem>
                  <SelectItem value="41-50">41-50</SelectItem>
                  <SelectItem value="51-60">51-60</SelectItem>
                  <SelectItem value="above60">Above 60</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Type</Label>
              <Popover open={specializationOpen} onOpenChange={setSpecializationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={specializationOpen}
                    className="w-full justify-between"
                  >
                    {filterSpecialization === "all"
                      ? "All Types"
                      : filterSpecialization}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search specialization..." />
                    <CommandList>
                      <CommandEmpty>No specialization found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setFilterSpecialization("all");
                            setSpecializationOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filterSpecialization === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Types
                        </CommandItem>
                        {specializations.map((spec) => (
                          <CommandItem
                            key={spec.id}
                            value={spec.name}
                            onSelect={() => {
                              setFilterSpecialization(spec.name);
                              setSpecializationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filterSpecialization === spec.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {spec.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="single">Single Doctors</SelectItem>
                  <SelectItem value="clinic">Clinic Doctors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Clinic</Label>
              <Popover open={clinicOpen} onOpenChange={setClinicOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clinicOpen}
                    className="w-full justify-between"
                  >
                    {filterClinic === "all"
                      ? "All Clinics"
                      : clinics.find(c => c.id === filterClinic)?.clinic_name || "All Clinics"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search clinic..." />
                    <CommandList>
                      <CommandEmpty>No clinic found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setFilterClinic("all");
                            setClinicOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filterClinic === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Clinics
                        </CommandItem>
                        {clinics.map((clinic) => (
                          <CommandItem
                            key={clinic.id}
                            value={clinic.clinic_name}
                            onSelect={() => {
                              setFilterClinic(clinic.id);
                              setClinicOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filterClinic === clinic.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {clinic.clinic_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="75">75</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <p className="text-center text-muted-foreground">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-6">
              <p className="text-center text-muted-foreground">No doctors found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Trial Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDoctors.map((doctor) => {
                  const age = calculateAge(doctor.profiles.date_of_birth);
                  const trialDays = !doctor.clinic_id ? getTrialDaysRemaining(doctor.trial_end_date) : null;
                  return (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">
                        {doctor.profiles?.full_name || "Unknown Doctor"}
                      </TableCell>
                      <TableCell>{doctor.profiles?.email || "N/A"}</TableCell>
                      <TableCell>{doctor.city || "N/A"}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>
                        {doctor.clinic_id ? (
                          <span className="text-muted-foreground text-xs">Via Clinic</span>
                        ) : (
                          getPaymentPlanBadge(doctor.payment_plan)
                        )}
                      </TableCell>
                      <TableCell>
                        {doctor.clinic_id ? (
                          <span className="text-muted-foreground text-xs">Clinic Dr</span>
                        ) : doctor.trial_end_date === null ? (
                          <Badge className="bg-green-500">Subscribed</Badge>
                        ) : trialDays !== null ? (
                          trialDays <= 0 ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="outline">{trialDays} days left</Badge>
                          )
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={doctor.approved ? "default" : "secondary"}>
                          {doctor.approved ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(doctor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doctor.approved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/doctor-patients/${doctor.id}`)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View Patients
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredDoctors.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredDoctors.length)} of {filteredDoctors.length} doctors
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Doctor Details</DialogTitle>
            <DialogDescription>
              View and manage doctor information
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedDoctor.profiles?.full_name || "Unknown Doctor"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialization}</p>
                </div>
                <Badge variant={selectedDoctor.approved ? "default" : "secondary"}>
                  {selectedDoctor.approved ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedDoctor.profiles.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-sm">{selectedDoctor.profiles.phone || selectedDoctor.contact_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p className="text-sm">{selectedDoctor.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-sm">
                      {selectedDoctor.profiles.date_of_birth 
                        ? new Date(selectedDoctor.profiles.date_of_birth).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p className="text-sm">
                      {calculateAge(selectedDoctor.profiles.date_of_birth) !== null 
                        ? `${calculateAge(selectedDoctor.profiles.date_of_birth)} years`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                    <p className="text-sm">{selectedDoctor.qualification}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                    <p className="text-sm">{selectedDoctor.experience_years ? `${selectedDoctor.experience_years} years` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Consultation Fee</p>
                    <p className="text-sm">{selectedDoctor.consultation_fee ? `PKR ${selectedDoctor.consultation_fee.toLocaleString()}` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">License Number</p>
                    <p className="text-sm">{selectedDoctor.license_number || "N/A"}</p>
                  </div>
                  {!selectedDoctor.clinic_id && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Payment Plan</p>
                        <div className="mt-1">
                          <Select 
                            value={selectedDoctor.payment_plan} 
                            onValueChange={async (value) => {
                              const { error } = await supabase.from("doctors").update({ payment_plan: value }).eq("id", selectedDoctor.id);
                              if (error) {
                                toast({ title: "Error", description: "Failed to update payment plan", variant: "destructive" });
                                return;
                              }
                              toast({ title: "Success", description: "Payment plan updated" });
                              setSelectedDoctor({ ...selectedDoctor, payment_plan: value });
                              fetchDoctors();
                            }}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly (PKR 5,999)</SelectItem>
                              <SelectItem value="yearly">Yearly (PKR 4,979 - 17% off)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Trial Status</p>
                        {selectedDoctor.trial_end_date === null ? (
                          <Badge className="bg-green-500 mt-1">Subscribed</Badge>
                        ) : (
                          <p className={`text-sm ${getTrialDaysRemaining(selectedDoctor.trial_end_date) !== null && getTrialDaysRemaining(selectedDoctor.trial_end_date)! <= 0 ? "text-destructive font-semibold" : ""}`}>
                            {getTrialDaysRemaining(selectedDoctor.trial_end_date) !== null 
                              ? (getTrialDaysRemaining(selectedDoctor.trial_end_date)! <= 0 ? "Expired" : `${getTrialDaysRemaining(selectedDoctor.trial_end_date)} days left`)
                              : "N/A"}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Trial End Date</p>
                        <p className="text-sm">{selectedDoctor.trial_end_date === null ? "N/A (Subscribed)" : (selectedDoctor.trial_end_date ? new Date(selectedDoctor.trial_end_date).toLocaleDateString() : "N/A")}</p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Extend Trial Section for Single Doctors - only show if not subscribed */}
                {!selectedDoctor.clinic_id && selectedDoctor.trial_end_date !== null && (
                  <div className="bg-muted/50 border rounded-lg p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Extend Trial (Days)</p>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        min={1} 
                        placeholder="Enter days" 
                        id="extendDoctorTrialDays" 
                        className="w-32 h-9 px-3 rounded-md border border-input bg-background text-sm" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => { 
                          const input = document.getElementById("extendDoctorTrialDays") as HTMLInputElement; 
                          const days = parseInt(input?.value) || 0; 
                          if (days <= 0) { 
                            toast({ title: "Error", description: "Please enter a valid number of days", variant: "destructive" }); 
                            return; 
                          } 
                          const currentEndDate = selectedDoctor.trial_end_date ? new Date(selectedDoctor.trial_end_date) : new Date(); 
                          const newEndDate = new Date(currentEndDate); 
                          newEndDate.setDate(newEndDate.getDate() + days); 
                          const { error } = await supabase.from("doctors").update({ trial_end_date: newEndDate.toISOString().split("T")[0] }).eq("id", selectedDoctor.id); 
                          if (error) { 
                            toast({ title: "Error", description: "Failed to extend trial", variant: "destructive" }); 
                            return; 
                          } 
                          toast({ title: "Success", description: `Trial extended by ${days} days` }); 
                          setSelectedDoctor({ ...selectedDoctor, trial_end_date: newEndDate.toISOString().split("T")[0] }); 
                          fetchDoctors(); 
                          if (input) input.value = ""; 
                        }}
                      >
                        Extend Trial
                      </Button>
                    </div>
                  </div>
                )}

                {/* End Trial & Activate Subscription for single doctors with active trial */}
                {!selectedDoctor.clinic_id && 
                 selectedDoctor.trial_end_date !== null && 
                 getTrialDaysRemaining(selectedDoctor.trial_end_date) !== null && 
                 getTrialDaysRemaining(selectedDoctor.trial_end_date)! > 0 && 
                 selectedDoctor.approved && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-medium mb-3">💳 First Payment Received? End trial to convert to subscription.</p>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm" 
                      onClick={async () => {
                        const { error } = await supabase.from("doctors").update({ 
                          trial_end_date: null,
                          approved: true 
                        }).eq("id", selectedDoctor.id);
                        if (error) {
                          toast({ title: "Error", description: "Failed to end trial", variant: "destructive" });
                          return;
                        }
                        toast({ title: "Success", description: "Trial ended - doctor is now subscribed" });
                        setSelectedDoctor({ ...selectedDoctor, trial_end_date: null, approved: true });
                        fetchDoctors();
                      }}
                    >
                      ✓ End Trial & Activate Subscription
                    </Button>
                  </div>
                )}

                {selectedDoctor.introduction && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Introduction</p>
                    <p className="text-sm">{selectedDoctor.introduction}</p>
                  </div>
                )}
              </div>

              {/* End Trial Button for expired single doctors - set to inactive */}
              {!selectedDoctor.clinic_id && 
               selectedDoctor.trial_end_date !== null &&
               getTrialDaysRemaining(selectedDoctor.trial_end_date) !== null && 
               getTrialDaysRemaining(selectedDoctor.trial_end_date)! <= 0 && 
               selectedDoctor.approved && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium mb-2">⚠️ Trial has expired. Status will change to Inactive.</p>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleToggleStatus(selectedDoctor.id, true)}
                  >
                    Set to Inactive
                  </Button>
                </div>
              )}

              {/* Activate Account Button for inactive single doctors */}
              {!selectedDoctor.clinic_id && !selectedDoctor.approved && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-sm text-green-700 font-medium mb-3">💳 Payment Received? Activate account.</p>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm" 
                    onClick={async () => {
                      const newEndDate = new Date();
                      newEndDate.setDate(newEndDate.getDate() + 30);
                      const { error } = await supabase.from("doctors").update({ 
                        trial_end_date: newEndDate.toISOString().split("T")[0],
                        approved: true 
                      }).eq("id", selectedDoctor.id);
                      if (error) {
                        toast({ title: "Error", description: "Failed to activate account", variant: "destructive" });
                        return;
                      }
                      toast({ title: "Success", description: "Account activated" });
                      setSelectedDoctor({ ...selectedDoctor, trial_end_date: newEndDate.toISOString().split("T")[0], approved: true });
                      fetchDoctors();
                    }}
                  >
                    ✓ Activate Account
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-4 pt-4 border-t border-border/40">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant={selectedDoctor.approved ? "destructive" : "default"}
                    onClick={() => handleToggleStatus(selectedDoctor.id, selectedDoctor.approved)}
                  >
                    {selectedDoctor.approved ? "Deactivate" : "Activate"}
                  </Button>
                </div>

                {/* Delete Doctor Button */}
                <div className="pt-4 border-t border-border/40">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDoctorToDelete(selectedDoctor);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Doctor Permanently
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    ⚠️ This will delete all patients created by this doctor
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!doctorToDelete} onOpenChange={() => setDoctorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Doctor - Permanent Action
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <p className="font-semibold text-foreground">
                Are you absolutely sure you want to delete "{doctorToDelete?.profiles?.full_name || "this doctor"}"?
              </p>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-destructive flex items-center gap-2">
                  ⚠️ Warning: Cascade Deletion
                </p>
                <p className="text-sm">This action will permanently delete:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>The doctor's account and profile</li>
                  <li>All patients created by this doctor</li>
                  <li>All appointments for those patients</li>
                  <li>All medical records, visit records, and prescriptions</li>
                  <li>All medical documents uploaded for those patients</li>
                </ul>
              </div>

              <p className="text-sm font-semibold">
                This action cannot be undone. All data will be permanently lost.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDoctor}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Yes, Delete Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
};

export default Doctors;