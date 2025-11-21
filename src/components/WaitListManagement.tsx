import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    patient_id: string;
    full_name: string;
  };
}

export const WaitListManagement = () => {
  const [waitList, setWaitList] = useState<WaitListEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchWaitList();
    fetchPatients();
  }, []);

  const fetchWaitList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wait_list")
        .select(`
          *,
          patients (
            patient_id,
            full_name
          )
        `)
        .eq("doctor_id", user.id)
        .eq("status", "active")
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setWaitList(data || []);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Patients scheduled for future follow-up
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add to Wait List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Patient to Wait List</DialogTitle>
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
                  Add to Wait List
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">
          Loading wait list...
        </p>
      ) : waitList.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No patients in wait list
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waitList.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {entry.patients.patient_id}
                </TableCell>
                <TableCell>{entry.patients.full_name}</TableCell>
                <TableCell>
                  {format(new Date(entry.scheduled_date), "PPP")}
                </TableCell>
                <TableCell>{entry.notes || "—"}</TableCell>
                <TableCell>
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
      )}
    </div>
  );
};