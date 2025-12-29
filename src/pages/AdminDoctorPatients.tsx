import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, ArrowLeft, Eye, Calendar as CalendarIcon, X, FileSpreadsheet } from "lucide-react";
import PatientImportExport from "@/components/PatientImportExport";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { differenceInYears, format, subMonths, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/TablePagination";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  father_name: string | null;
  email: string | null;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string | null;
  address: string | null;
  city: string | null;
  major_diseases: string | null;
  created_at: string;
}

interface Doctor {
  full_name: string;
  specialization: string;
}

const AdminDoctorPatients = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterAge, setFilterAge] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [cities, setCities] = useState<string[]>([]);
  const [filterAddedDateFrom, setFilterAddedDateFrom] = useState<Date>();
  const [filterAddedDateTo, setFilterAddedDateTo] = useState<Date>();
  const [addedDateFromPopoverOpen, setAddedDateFromPopoverOpen] = useState(false);
  const [addedDateToPopoverOpen, setAddedDateToPopoverOpen] = useState(false);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
      fetchPatients();
    }
  }, [doctorId]);

  useEffect(() => {
    applyFilters();
  }, [patients, searchTerm, filterAge, filterGender, filterCity, currentPage, pageSize]);

  const fetchDoctor = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select(`
        specialization,
        profiles!doctors_id_fkey (
          full_name
        )
      `)
      .eq("id", doctorId)
      .single();

    if (error) {
      console.error("Error fetching doctor:", error);
      toast({
        title: "Error",
        description: "Failed to fetch doctor information",
        variant: "destructive",
      });
      return;
    }

    if (data && data.profiles) {
      setDoctor({
        full_name: (data.profiles as any).full_name,
        specialization: data.specialization,
      });
    }
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("created_by", doctorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
      return;
    }

    setPatients(data || []);
    
    // Extract unique cities
    const uniqueCities = [...new Set(data?.map(p => p.city).filter(Boolean) as string[])];
    setCities(uniqueCities);
  };

  const calculateAge = (dateOfBirth: string): number => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const applyFilters = () => {
    let filtered = [...patients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm)
      );
    }

    // Age filter
    if (filterAge !== "all") {
      filtered = filtered.filter((patient) => {
        const age = calculateAge(patient.date_of_birth);
        if (filterAge === "0-18") return age <= 18;
        if (filterAge === "19-40") return age >= 19 && age <= 40;
        if (filterAge === "41-60") return age >= 41 && age <= 60;
        if (filterAge === "60+") return age > 60;
        return true;
      });
    }

    // Gender filter
    if (filterGender !== "all") {
      filtered = filtered.filter((patient) => patient.gender === filterGender);
    }

    // City filter
    if (filterCity !== "all") {
      filtered = filtered.filter((patient) => patient.city === filterCity);
    }

    // Added date filter
    if (filterAddedDateFrom) {
      filtered = filtered.filter((patient) => {
        const createdAt = new Date(patient.created_at);
        return createdAt >= startOfDay(filterAddedDateFrom);
      });
    }
    if (filterAddedDateTo) {
      filtered = filtered.filter((patient) => {
        const createdAt = new Date(patient.created_at);
        return createdAt <= endOfDay(filterAddedDateTo);
      });
    }

    // Pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredPatients(filtered.slice(startIndex, endIndex));
  };

  const totalPages = Math.ceil(
    patients.filter((p) => {
      let match = true;
      if (searchTerm) {
        match =
          match &&
          (p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone.includes(searchTerm));
      }
      if (filterAge !== "all") {
        const age = calculateAge(p.date_of_birth);
        if (filterAge === "0-18") match = match && age <= 18;
        if (filterAge === "19-40") match = match && age >= 19 && age <= 40;
        if (filterAge === "41-60") match = match && age >= 41 && age <= 60;
        if (filterAge === "60+") match = match && age > 60;
      }
      if (filterGender !== "all") match = match && p.gender === filterGender;
      if (filterCity !== "all") match = match && p.city === filterCity;
      return match;
    }).length / pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h2 className="text-3xl font-bold">
              {doctor ? `Dr. ${doctor.full_name}'s Patients` : "Doctor's Patients"}
            </h2>
            <p className="text-muted-foreground">
              {doctor && `Specialization: ${doctor.specialization}`}
            </p>
          </div>
        </div>
        {doctorId && (
          <PatientImportExport 
            createdBy={doctorId} 
            onImportComplete={fetchPatients} 
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterAge} onValueChange={setFilterAge}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="0-18">0-18 years</SelectItem>
                <SelectItem value="19-40">19-40 years</SelectItem>
                <SelectItem value="41-60">41-60 years</SelectItem>
                <SelectItem value="60+">60+ years</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="75">75 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 items-center">
              <Popover open={addedDateFromPopoverOpen} onOpenChange={setAddedDateFromPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !filterAddedDateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterAddedDateFrom ? format(filterAddedDateFrom, "PP") : "From Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={filterAddedDateFrom}
                    onSelect={(date) => { setFilterAddedDateFrom(date); setAddedDateFromPopoverOpen(false); }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    fromDate={subMonths(new Date(), 12)}
                    toDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
              <Popover open={addedDateToPopoverOpen} onOpenChange={setAddedDateToPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !filterAddedDateTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterAddedDateTo ? format(filterAddedDateTo, "PP") : "To Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={filterAddedDateTo}
                    onSelect={(date) => { setFilterAddedDateTo(date); setAddedDateToPopoverOpen(false); }}
                    disabled={(date) => date > new Date() || (filterAddedDateFrom && date < filterAddedDateFrom)}
                    initialFocus
                    fromDate={subMonths(new Date(), 12)}
                    toDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
              {(filterAddedDateFrom || filterAddedDateTo) && (
                <Button variant="ghost" size="icon" onClick={() => { setFilterAddedDateFrom(undefined); setFilterAddedDateTo(undefined); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Patients List ({patients.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Father Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Added Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.patient_id}</TableCell>
                    <TableCell>{patient.full_name}</TableCell>
                    <TableCell>{patient.father_name || "N/A"}</TableCell>
                    <TableCell>{calculateAge(patient.date_of_birth)} years</TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.gender}</Badge>
                    </TableCell>
                    <TableCell>{patient.city || "N/A"}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.blood_group || "N/A"}</TableCell>
                    <TableCell>{format(new Date(patient.created_at), "PP")}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDoctorPatients;
