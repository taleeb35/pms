import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <Card className="col-span-full">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading doctors...</p>
            </CardContent>
          </Card>
        ) : doctors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No doctors found</p>
            </CardContent>
          </Card>
        ) : (
          doctors.map((doctor) => (
            <Card key={doctor.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader onClick={() => handleViewDetails(doctor)}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Dr. {doctor.profiles.full_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialization}
                    </p>
                  </div>
                  <Badge variant={doctor.approved ? "default" : "secondary"}>
                    {doctor.approved ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent onClick={() => handleViewDetails(doctor)}>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Qualification: </span>
                    <span>{doctor.qualification}</span>
                  </div>
                  {doctor.experience_years && (
                    <div>
                      <span className="text-muted-foreground">Experience: </span>
                      <span>{doctor.experience_years} years</span>
                    </div>
                  )}
                  {doctor.consultation_fee && (
                    <div>
                      <span className="text-muted-foreground">Fee: </span>
                      <span>${doctor.consultation_fee}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Doctor Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Doctor Details</span>
              <Badge variant={selectedDoctor?.approved ? "default" : "secondary"}>
                {selectedDoctor?.approved ? "Active" : "Inactive"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              View and manage doctor information
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Dr. {selectedDoctor.profiles.full_name}
                  </h3>
                  <p className="text-muted-foreground">{selectedDoctor.specialization}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span>{selectedDoctor.profiles.email}</span>
                    </div>
                    {selectedDoctor.contact_number && (
                      <div>
                        <span className="text-muted-foreground">Phone: </span>
                        <span>{selectedDoctor.contact_number}</span>
                      </div>
                    )}
                    {selectedDoctor.city && (
                      <div>
                        <span className="text-muted-foreground">City: </span>
                        <span>{selectedDoctor.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Professional Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Qualification: </span>
                      <span>{selectedDoctor.qualification}</span>
                    </div>
                    {selectedDoctor.license_number && (
                      <div>
                        <span className="text-muted-foreground">License: </span>
                        <span>{selectedDoctor.license_number}</span>
                      </div>
                    )}
                    {selectedDoctor.experience_years && (
                      <div>
                        <span className="text-muted-foreground">Experience: </span>
                        <span>{selectedDoctor.experience_years} years</span>
                      </div>
                    )}
                    {selectedDoctor.consultation_fee && (
                      <div>
                        <span className="text-muted-foreground">Consultation Fee: </span>
                        <span>${selectedDoctor.consultation_fee}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedDoctor.introduction && (
                <div>
                  <h4 className="font-semibold mb-2">Introduction</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedDoctor.introduction}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant={selectedDoctor.approved ? "destructive" : "default"}
                  onClick={() => handleToggleStatus(selectedDoctor.id, selectedDoctor.approved)}
                  className="flex-1"
                >
                  {selectedDoctor.approved ? "Deactivate Account" : "Activate Account"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
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
