import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Calendar, Stethoscope, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface MedicalRecord {
  id: string;
  visit_date: string;
  diagnosis: string | null;
  symptoms: string | null;
  notes: string | null;
  test_results: string | null;
  doctor_id: string;
  doctors?: {
    profiles?: {
      full_name: string;
    };
  };
}

interface MedicalDocument {
  id: string;
  document_name: string;
  document_type: string;
  document_url: string;
  created_at: string;
}

interface PatientMedicalDocsViewProps {
  patientId: string;
}

export const PatientMedicalDocsView = ({ patientId }: PatientMedicalDocsViewProps) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch medical records and documents in parallel
      const [recordsResult, docsResult] = await Promise.all([
        supabase
          .from("medical_records")
          .select(`
            id,
            visit_date,
            diagnosis,
            symptoms,
            notes,
            test_results,
            doctor_id,
            doctors:doctor_id (
              profiles:id (
                full_name
              )
            )
          `)
          .eq("patient_id", patientId)
          .order("visit_date", { ascending: false }),
        supabase
          .from("medical_documents")
          .select("id, document_name, document_type, document_url, created_at")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
      ]);

      if (recordsResult.error) console.error("Error fetching records:", recordsResult.error);
      if (docsResult.error) console.error("Error fetching documents:", docsResult.error);

      setMedicalRecords(recordsResult.data || []);
      setDocuments(docsResult.data || []);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, "_blank");
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("lab") || type.includes("test")) return "🧪";
    if (type.includes("xray") || type.includes("scan")) return "🩻";
    return "📋";
  };

  if (loading) {
    return (
      <Card className="border rounded-lg">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Medical Records & Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground text-sm">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const hasData = medicalRecords.length > 0 || documents.length > 0;

  if (!hasData) {
    return (
      <Card className="border rounded-lg">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Medical Records & Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground text-sm">
            No medical records or documents found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border rounded-lg">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Medical Records & Documents
          <Badge variant="secondary" className="ml-auto text-xs">
            {medicalRecords.length + documents.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-8 rounded-none border-b">
            <TabsTrigger value="documents" className="text-xs h-7">
              <FileText className="h-3 w-3 mr-1" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="records" className="text-xs h-7">
              <Stethoscope className="h-3 w-3 mr-1" />
              Records ({medicalRecords.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="m-0">
            <ScrollArea className="h-[200px]">
              {documents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No documents uploaded
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg">{getDocumentIcon(doc.document_type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{doc.document_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(doc.created_at), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleViewDocument(doc.document_url)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="records" className="m-0">
            <ScrollArea className="h-[200px]">
              {medicalRecords.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No medical records found
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {medicalRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-2 bg-muted/50 rounded-md space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {format(new Date(record.visit_date), "dd MMM yyyy")}
                          </span>
                        </div>
                        {record.doctors?.profiles?.full_name && (
                          <Badge variant="outline" className="text-xs h-5">
                            Dr. {record.doctors.profiles.full_name.split(' ')[0]}
                          </Badge>
                        )}
                      </div>
                      {record.diagnosis && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Diagnosis: </span>
                          <span className="font-medium">{record.diagnosis}</span>
                        </div>
                      )}
                      {record.symptoms && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Symptoms: </span>
                          <span>{record.symptoms}</span>
                        </div>
                      )}
                      {record.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
