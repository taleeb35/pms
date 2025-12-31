import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";
import { useToast } from "@/hooks/use-toast";

const DoctorReceptionistAllergies = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [allergies, setAllergies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) {
      fetchAllergies();
    }
  }, [doctorId]);

  const fetchAllergies = async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("doctor_allergies")
        .select("id, name")
        .eq("doctor_id", doctorId)
        .order("name");

      if (error) throw error;
      setAllergies(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (doctorLoading || loading) {
    return <TableSkeleton columns={2} rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Allergies</h1>
        <p className="text-muted-foreground">View allergy reference list (read-only)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Allergies ({allergies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No allergies configured
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Allergy Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergies.map((allergy, index) => (
                  <TableRow key={allergy.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{allergy.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorReceptionistAllergies;
