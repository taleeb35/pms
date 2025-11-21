import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Calendar, FileText } from "lucide-react";

interface VisitRecord {
  id: string;
  visit_date: string;
  chief_complaint: string | null;
  current_prescription: string | null;
  blood_pressure: string | null;
  temperature: string | null;
  pulse: string | null;
  weight: string | null;
  next_visit_date: string | null;
  next_visit_notes: string | null;
}

interface VisitHistoryProps {
  patientId: string;
}

export const VisitHistory = ({ patientId }: VisitHistoryProps) => {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitHistory();
  }, [patientId]);

  const fetchVisitHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("visit_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("visit_date", { ascending: false });

    if (!error && data) {
      setVisits(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-4">Loading visit history...</div>;
  }

  if (visits.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No previous visits recorded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Visit History ({visits.length} visits)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-4">
            {visits.map((visit, index) => (
              <div
                key={visit.id}
                className="border rounded-lg p-4 bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold">
                      Visit #{visits.length - index}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(visit.visit_date), "PPP")}
                  </span>
                </div>

                {visit.chief_complaint && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Chief Complaint:</p>
                    <p className="text-sm">{visit.chief_complaint}</p>
                  </div>
                )}

                {(visit.blood_pressure || visit.temperature || visit.pulse || visit.weight) && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Vitals:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {visit.blood_pressure && (
                        <span>BP: {visit.blood_pressure}</span>
                      )}
                      {visit.temperature && (
                        <span>Temp: {visit.temperature}</span>
                      )}
                      {visit.pulse && <span>Pulse: {visit.pulse}</span>}
                      {visit.weight && <span>Weight: {visit.weight}</span>}
                    </div>
                  </div>
                )}

                {visit.current_prescription && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Prescription:</p>
                    <p className="text-sm whitespace-pre-line bg-muted/50 p-2 rounded">
                      {visit.current_prescription}
                    </p>
                  </div>
                )}

                {visit.next_visit_date && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium text-primary">
                      Next Visit: {format(new Date(visit.next_visit_date), "PPP")}
                    </p>
                    {visit.next_visit_notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {visit.next_visit_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
