import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCode } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";
import { useToast } from "@/hooks/use-toast";

const DoctorReceptionistICDCodes = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [icdCodes, setIcdCodes] = useState<{ id: string; code: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) {
      fetchICDCodes();
    }
  }, [doctorId]);

  const fetchICDCodes = async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("doctor_icd_codes")
        .select("id, code, description")
        .eq("doctor_id", doctorId)
        .order("code");

      if (error) throw error;
      setIcdCodes(data || []);
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
        <h1 className="text-2xl font-bold">ICD Codes</h1>
        <p className="text-muted-foreground">View ICD code reference list (read-only)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            ICD Codes ({icdCodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {icdCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No ICD codes configured
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {icdCodes.map((icd) => (
                  <TableRow key={icd.id}>
                    <TableCell className="font-mono">{icd.code}</TableCell>
                    <TableCell>{icd.description}</TableCell>
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

export default DoctorReceptionistICDCodes;
