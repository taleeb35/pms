import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
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
  };
}

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select(`
          *,
          profiles(full_name, email, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Doctors</h2>
          <p className="text-muted-foreground">Manage doctor profiles</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <p className="text-center text-muted-foreground">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">
                      {doctor.profiles.full_name}
                    </TableCell>
                    <TableCell>{doctor.profiles.email}</TableCell>
                    <TableCell>{doctor.profiles.phone || doctor.contact_number || "N/A"}</TableCell>
                    <TableCell>{doctor.city || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={doctor.approved ? "default" : "secondary"}>
                        {doctor.approved ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(doctor)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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