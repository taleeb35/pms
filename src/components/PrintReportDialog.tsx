import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Printer, FileText } from "lucide-react";
import { format } from "date-fns";
import { printAppointmentReport } from "@/lib/printAppointmentReport";

interface ReportField {
  title: string;
  value: string;
}

type TemplateKind = "report" | "test";

interface CombinedTemplate {
  id: string;
  kind: TemplateKind;
  name: string;
  fields: ReportField[];
  description?: string;
}

interface PrintReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    appointment_date: string;
    appointment_time?: string | null;
    doctor_id?: string;
    patients: {
      full_name: string;
      patient_id: string;
      phone: string;
      date_of_birth: string;
      gender?: string | null;
    };
  } | null;
}

export const PrintReportDialog = ({ open, onOpenChange, appointment }: PrintReportDialogProps) => {
  const [templates, setTemplates] = useState<CombinedTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [editableFields, setEditableFields] = useState<ReportField[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTemplates();
      setSelectedTemplateId("");
      setEditableFields([]);
      setAdditionalNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.doctor_id]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      let doctorId = appointment?.doctor_id;
      if (!doctorId) {
        const { data: { user } } = await supabase.auth.getUser();
        doctorId = user?.id;
      }
      if (!doctorId) return;

      // Resolve clinic of doctor so we also pull clinic-shared templates
      const { data: doc } = await supabase
        .from("doctors")
        .select("clinic_id")
        .eq("id", doctorId)
        .maybeSingle();
      const clinicId = doc?.clinic_id;

      const reportQuery = clinicId
        ? supabase.from("doctor_report_templates").select("*").or(`doctor_id.eq.${doctorId},clinic_id.eq.${clinicId}`)
        : supabase.from("doctor_report_templates").select("*").eq("doctor_id", doctorId);

      const testQuery = clinicId
        ? supabase.from("doctor_test_templates").select("*").or(`doctor_id.eq.${doctorId},clinic_id.eq.${clinicId}`)
        : supabase.from("doctor_test_templates").select("*").eq("doctor_id", doctorId);

      const [{ data: reports, error: rErr }, { data: tests, error: tErr }] = await Promise.all([reportQuery, testQuery]);
      if (rErr) throw rErr;
      if (tErr) throw tErr;

      const combined: CombinedTemplate[] = [
        ...((reports || []) as any[]).map((t) => ({
          id: `report:${t.id}`,
          kind: "report" as const,
          name: t.template_name,
          fields: Array.isArray(t.fields) ? t.fields : [],
        })),
        ...((tests || []) as any[]).map((t) => ({
          id: `test:${t.id}`,
          kind: "test" as const,
          name: t.title,
          fields: [],
          description: t.description || "",
        })),
      ];

      setTemplates(combined);
    } catch (error: any) {
      toast({ title: "Error fetching templates", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    if (template.kind === "report") {
      setEditableFields(template.fields.map(f => ({ ...f })));
      setAdditionalNotes("");
    } else {
      // Test template: seed notes with description, no field grid
      setEditableFields([]);
      setAdditionalNotes(template.description || "");
    }
  };

  const handleFieldChange = (index: number, value: string) => {
    setEditableFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const handlePrint = async () => {
    if (!appointment) return;
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) return;

    await printAppointmentReport({
      appointment: {
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time ?? null,
        doctor_id: appointment.doctor_id || "",
      },
      patient: {
        full_name: appointment.patients.full_name,
        patient_id: appointment.patients.patient_id,
        date_of_birth: appointment.patients.date_of_birth,
        gender: appointment.patients.gender ?? null,
        phone: appointment.patients.phone,
      },
      templateName: selectedTemplate.name,
      fields: editableFields,
      additionalNotes,
    });
    onOpenChange(false);
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const reportTemplates = templates.filter(t => t.kind === "report");
  const testTemplates = templates.filter(t => t.kind === "test");
  const canPrint = !!selectedTemplate && (selectedTemplate.kind === "test" || editableFields.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-visible p-0">
        <div className="max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Test Report
          </DialogTitle>
        </DialogHeader>

        {appointment && (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-medium">{appointment.patients.full_name}</p>
              <p className="text-sm text-muted-foreground">
                Patient ID: {appointment.patients.patient_id} | Date: {format(new Date(appointment.appointment_date), "PPP")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading templates..." : "Select a template"} />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="none" disabled>No templates available</SelectItem>
                  ) : (
                    <>
                      {reportTemplates.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Report Templates</SelectLabel>
                          {reportTemplates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} ({t.fields.length} fields)
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {testTemplates.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Test Templates</SelectLabel>
                          {testTemplates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate?.kind === "report" && editableFields.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Fill Report Details</Label>
                <div className="space-y-3 border rounded-lg p-4">
                  {editableFields.map((field, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-sm font-medium">{field.title}</Label>
                      <Input
                        value={field.value}
                        onChange={(e) => handleFieldChange(index, e.target.value)}
                        placeholder={`Enter ${field.title.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTemplate && (
              <div className="space-y-2">
                <Label>
                  {selectedTemplate.kind === "test" ? "Report Content" : "Additional Notes (optional)"}
                </Label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder={selectedTemplate.kind === "test"
                    ? "Edit the test report content as needed..."
                    : "Add any observations, interpretation, or remarks..."}
                  rows={selectedTemplate.kind === "test" ? 10 : 4}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handlePrint} disabled={!canPrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
