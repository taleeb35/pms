import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeartPulse } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";
import { useToast } from "@/hooks/use-toast";

const DoctorReceptionistDiseases = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [diseases, setDiseases] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) {
      fetchDiseases();
    }
  }, [doctorId]);

  const fetchDiseases = async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("doctor_diseases")
        .select("id, name")
        .eq("doctor_id", doctorId)
        .order("name");

      if (error) throw error;
      setDiseases(data || []);
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
        <h1 className="text-2xl font-bold">Diseases</h1>
        <p className="text-muted-foreground">View disease reference list (read-only)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Diseases ({diseases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diseases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No diseases configured
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Disease Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diseases.map((disease, index) => (
                  <TableRow key={disease.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{disease.name}</TableCell>
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

export default DoctorReceptionistDiseases;
