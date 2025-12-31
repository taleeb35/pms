import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stethoscope } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";
import { useToast } from "@/hooks/use-toast";

const DoctorReceptionistProcedures = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [procedures, setProcedures] = useState<{ id: string; name: string; price: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) {
      fetchProcedures();
    }
  }, [doctorId]);

  const fetchProcedures = async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("procedures")
        .select("id, name, price")
        .eq("doctor_id", doctorId)
        .order("name");

      if (error) throw error;
      setProcedures(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (doctorLoading || loading) {
    return <TableSkeleton columns={3} rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Procedures</h1>
        <p className="text-muted-foreground">View procedure list (read-only)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Procedures ({procedures.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {procedures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No procedures configured
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Procedure Name</TableHead>
                  <TableHead className="text-right">Price (Rs.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures.map((proc, index) => (
                  <TableRow key={proc.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{proc.name}</TableCell>
                    <TableCell className="text-right">{proc.price.toLocaleString()}</TableCell>
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

export default DoctorReceptionistProcedures;
