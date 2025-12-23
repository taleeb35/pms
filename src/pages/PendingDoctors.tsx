import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PendingDoctor {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  specialization: string;
  created_at: string;
}

const PendingDoctors = () => {
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const { data: doctors, error } = await supabase
        .from("doctors")
        .select(`
          id,
          created_at,
          city,
          contact_number,
          specialization,
          profiles!inner(full_name, email, phone)
        `)
        .eq("approved", false);

      if (error) throw error;

      const formattedDoctors = doctors?.map((doctor: any) => ({
        id: doctor.id,
        full_name: doctor.profiles?.full_name || "Unknown Doctor",
        email: doctor.profiles?.email || "N/A",
        phone: doctor.contact_number || doctor.profiles?.phone || "N/A",
        city: doctor.city,
        specialization: doctor.specialization || "General",
        created_at: doctor.created_at,
      })) || [];

      setPendingDoctors(formattedDoctors);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId: string) => {
    setActionLoading(doctorId);
    try {
      const doctor = pendingDoctors.find(d => d.id === doctorId);
      
      const { error } = await supabase
        .from("doctors")
        .update({ approved: true })
        .eq("id", doctorId);

      if (error) throw error;

      // Send approval email to doctor
      if (doctor) {
        try {
          await supabase.functions.invoke("send-doctor-approval-email", {
            body: {
              doctorName: doctor.full_name,
              email: doctor.email,
              specialization: doctor.specialization,
              status: 'approved'
            },
          });
        } catch (emailError) {
          console.error("Failed to send approval email:", emailError);
        }
      }

      toast({
        title: "Doctor approved",
        description: "The doctor can now login to the system.",
      });

      fetchPendingDoctors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId: string) => {
    setActionLoading(doctorId);
    try {
      // Delete the doctor record and the user
      const { error: doctorError } = await supabase
        .from("doctors")
        .delete()
        .eq("id", doctorId);

      if (doctorError) throw doctorError;

      toast({
        title: "Doctor rejected",
        description: "The doctor's signup request has been rejected.",
      });

      fetchPendingDoctors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Pending Doctor Approvals</h2>
        <p className="text-muted-foreground">
          Review and approve doctor signup requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({pendingDoctors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDoctors.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending doctor approvals
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">
                      {doctor.full_name}
                    </TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.phone || "N/A"}</TableCell>
                    <TableCell>{doctor.city || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(doctor.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(doctor.id)}
                          disabled={actionLoading === doctor.id}
                        >
                          {actionLoading === doctor.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(doctor.id)}
                          disabled={actionLoading === doctor.id}
                        >
                          {actionLoading === doctor.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
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

export default PendingDoctors;
