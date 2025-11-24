import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
  };
}

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Filters
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterAgeRange, setFilterAgeRange] = useState<string>("all");
  const [filterSpecialization, setFilterSpecialization] = useState<string>("all");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [doctors, filterCity, filterAgeRange, filterSpecialization]);

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
      const { error } = await supabase
        .from("doctors")
        .update({ approved: !currentStatus })
        .eq("id", doctorId);

      if (error) throw error;

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);

  const uniqueCities = Array.from(new Set(doctors.map(d => d.city).filter(Boolean)));
  const uniqueSpecializations = Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)));

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueSpecializations.map((spec) => (
                    <SelectItem key={spec} value={spec!}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Items per page</Label>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger>
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
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDoctors.map((doctor) => {
                  const age = calculateAge(doctor.profiles.date_of_birth);
                  return (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">
                        {doctor.profiles.full_name}
                      </TableCell>
                      <TableCell>{doctor.profiles.email}</TableCell>
                      <TableCell>{doctor.profiles.phone || doctor.contact_number || "N/A"}</TableCell>
                      <TableCell>{doctor.city || "N/A"}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>
                        {doctor.profiles.date_of_birth 
                          ? new Date(doctor.profiles.date_of_birth).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{age !== null ? `${age} years` : "N/A"}</TableCell>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/doctor-patients/${doctor.id}`)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            View Patients
                          </Button>
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
                  <h3 className="text-xl font-semibold">{selectedDoctor.profiles.full_name}</h3>
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
                    <p className="text-sm">{selectedDoctor.consultation_fee ? `$${selectedDoctor.consultation_fee}` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">License Number</p>
                    <p className="text-sm">{selectedDoctor.license_number || "N/A"}</p>
                  </div>
                </div>

                {selectedDoctor.introduction && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Introduction</p>
                    <p className="text-sm">{selectedDoctor.introduction}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant={selectedDoctor.approved ? "destructive" : "default"}
                  onClick={() => handleToggleStatus(selectedDoctor.id, selectedDoctor.approved)}
                >
                  {selectedDoctor.approved ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Doctors;