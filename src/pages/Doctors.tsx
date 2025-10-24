import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  specialization: string;
  qualification: string;
  experience_years: number | null;
  consultation_fee: number | null;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Doctors</h2>
          <p className="text-muted-foreground">Manage doctor profiles</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
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
            <Card key={doctor.id}>
              <CardHeader>
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
                </div>
              </CardHeader>
              <CardContent>
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
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span>{doctor.profiles.email}</span>
                  </div>
                  {doctor.profiles.phone && (
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      <span>{doctor.profiles.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Doctors;
