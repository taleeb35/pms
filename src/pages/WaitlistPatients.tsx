import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CitySelect } from "@/components/CitySelect";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
}

interface WaitListEntry {
  id: string;
  patient_id: string;
  scheduled_date: string;
  notes: string | null;
  status: string;
  patients: {
    id: string;
    patient_id: string;
    full_name: string;
    email: string | null;
    phone: string;
    gender: string;
    date_of_birth: string;
    blood_group: string | null;
    city: string | null;
  };
}

const WaitlistPatients = () => {
  const [waitList, setWaitList] = useState<WaitListEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAge, setFilterAge] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWaitList();
    fetchPatients();
  }, [filterAge, filterGender, filterCity]);

  const fetchWaitList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("wait_list")
        .select(`
          *,
          patients (
            id,
            patient_id,
            full_name,
            email,
            phone,
            gender,
            date_of_birth,
            blood_group,
            city
          )
        `)
        .eq("doctor_id", user.id)
        .eq("status", "active")
        .order("scheduled_date", { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      
      let filteredData = (data || []) as WaitListEntry[];

      // Apply age filter
      if (filterAge && filterAge !== "all") {
        filteredData = filteredData.filter(entry => {
          const today = new Date();
          const birthDate = new Date(entry.patients.date_of_birth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (filterAge === "0-18") return age <= 18;
          if (filterAge === "19-40") return age >= 19 && age <= 40;
          if (filterAge === "41-60") return age >= 41 && age <= 60;
          if (filterAge === "60+") return age > 60;
          return true;
        });
      }

      // Apply gender filter
      if (filterGender && filterGender !== "all") {
        filteredData = filteredData.filter(entry => entry.patients.gender === filterGender);
      }

      // Apply city filter
      if (filterCity && filterCity !== "all") {
        filteredData = filteredData.filter(entry => entry.patients.city === filterCity);
      }

      setWaitList(filteredData);
    } catch (error: any) {
      toast({
        title: "Error fetching wait list",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_id, full_name")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleAddToWaitList = async () => {
    if (!selectedPatient || !scheduledDate) {
      toast({
        title: "Missing fields",
        description: "Please select a patient and scheduled date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("wait_list").insert({
        patient_id: selectedPatient,
        doctor_id: user.id,
        scheduled_date: format(scheduledDate, "yyyy-MM-dd"),
        notes: notes || null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient added to wait list",
      });

      setIsDialogOpen(false);
      setSelectedPatient("");
      setScheduledDate(undefined);
      setNotes("");
      fetchWaitList();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromWaitList = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wait_list")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient removed from wait list",
      });

      fetchWaitList();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(waitList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWaitList = waitList.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Waitlist Patients</h2>
          <p className="text-muted-foreground">
            Patients scheduled for future follow-up
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add to Waitlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Patient to Waitlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Patient
                </label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name} ({patient.patient_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Scheduled Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => {
                        setScheduledDate(date);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Notes
                </label>
                <Textarea
                  placeholder="Add any notes or instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddToWaitList}>
                  Add to Waitlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Waitlist</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select value={filterAge} onValueChange={setFilterAge}>
                  <SelectTrigger className="w-[150px]">
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
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <CitySelect 
                  value={filterCity} 
                  onValueChange={setFilterCity}
                  label=""
                  showAllOption={true}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-20">
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading waitlist...
            </p>
          ) : waitList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No patients in waitlist
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWaitList.map((entry) => (
                    <TableRow 
                      key={entry.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/doctor/patients/${entry.patients.id}`)}
                    >
                      <TableCell className="font-medium">
                        {entry.patients.patient_id}
                      </TableCell>
                      <TableCell>{entry.patients.full_name}</TableCell>
                      <TableCell>{entry.patients.email || "N/A"}</TableCell>
                      <TableCell>{entry.patients.phone}</TableCell>
                      <TableCell className="capitalize">{entry.patients.gender}</TableCell>
                      <TableCell>
                        {differenceInYears(new Date(), new Date(entry.patients.date_of_birth))}
                      </TableCell>
                      <TableCell>{entry.patients.blood_group || "N/A"}</TableCell>
                      <TableCell>
                        {format(new Date(entry.scheduled_date), "PPP")}
                      </TableCell>
                      <TableCell>{entry.notes || "—"}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWaitList(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, waitList.length)} of{" "}
                    {waitList.length} entries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistPatients;