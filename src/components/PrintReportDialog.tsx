import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Printer, FileText } from "lucide-react";
import { format } from "date-fns";

interface ReportField {
  title: string;
  value: string;
}

interface ReportTemplate {
  id: string;
  template_name: string;
  fields: ReportField[];
}

interface PrintReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    appointment_date: string;
    patients: {
      full_name: string;
      patient_id: string;
      phone: string;
      date_of_birth: string;
    };
  } | null;
}

export const PrintReportDialog = ({ open, onOpenChange, appointment }: PrintReportDialogProps) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [editableFields, setEditableFields] = useState<ReportField[]>([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTemplates();
      setSelectedTemplateId("");
      setEditableFields([]);
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctor_report_templates")
        .select("*")
        .eq("doctor_id", user.id)
        .order("template_name");

      if (error) throw error;

      const formattedTemplates: ReportTemplate[] = (data || []).map((t: any) => ({
        id: t.id,
        template_name: t.template_name,
        fields: Array.isArray(t.fields) ? t.fields : [],
      }));

      setTemplates(formattedTemplates);
    } catch (error: any) {
      toast({ title: "Error fetching templates", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditableFields(template.fields.map(f => ({ ...f })));
    }
  };

  const handleFieldChange = (index: number, value: string) => {
    setEditableFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const handlePrint = () => {
    if (!printRef.current || !appointment) return;

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Report - ${appointment.patients.full_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .header h1 { 
              font-size: 24px; 
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p { 
              color: #666; 
              font-size: 14px;
            }
            .patient-info { 
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              background: #f9f9f9; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
            }
            .patient-info p { 
              margin: 5px 0;
              font-size: 14px;
            }
            .patient-info strong { 
              color: #333;
            }
            .report-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
            .field-row { 
              display: flex; 
              border-bottom: 1px solid #eee; 
              padding: 12px 0;
            }
            .field-row:last-child {
              border-bottom: none;
            }
            .field-title { 
              font-weight: 600; 
              width: 200px;
              flex-shrink: 0;
              color: #555;
            }
            .field-value { 
              flex: 1;
              color: #333;
            }
            .footer { 
              margin-top: 50px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd;
              display: flex;
              justify-content: space-between;
            }
            .signature-line {
              width: 200px;
              text-align: center;
            }
            .signature-line .line {
              border-top: 1px solid #333;
              margin-top: 50px;
              padding-top: 5px;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedTemplate?.template_name || 'Patient Report'}</h1>
            <p>Date: ${format(new Date(appointment.appointment_date), "PPP")}</p>
          </div>
          
          <div class="patient-info">
            <p><strong>Patient Name:</strong> ${appointment.patients.full_name}</p>
            <p><strong>Patient ID:</strong> ${appointment.patients.patient_id}</p>
            <p><strong>Phone:</strong> ${appointment.patients.phone}</p>
            <p><strong>Date of Birth:</strong> ${format(new Date(appointment.patients.date_of_birth), "PPP")}</p>
          </div>
          
          <div class="report-content">
            ${editableFields.map(field => `
              <div class="field-row">
                <div class="field-title">${field.title}:</div>
                <div class="field-value">${field.value || '-'}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <div class="signature-line">
              <div class="line">Doctor's Signature</div>
            </div>
            <div class="signature-line">
              <div class="line">Date</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Print Report
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
              <Label>Select Report Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading templates..." : "Select a template"} />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="none" disabled>No templates available</SelectItem>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.template_name} ({template.fields.length} fields)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && editableFields.length > 0 && (
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

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePrint} 
                disabled={!selectedTemplateId || editableFields.length === 0}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
            </div>
          </div>
        )}

        <div ref={printRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
