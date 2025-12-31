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
              padding: 0; 
              color: #1a1a2e;
              line-height: 1.6;
              background: #fff;
            }
            .page-wrapper {
              max-width: 800px;
              margin: 0 auto;
              padding: 30px;
            }
            .header { 
              background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
              color: white;
              padding: 25px 30px;
              border-radius: 12px;
              margin-bottom: 25px;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -20%;
              width: 200px;
              height: 200px;
              background: rgba(255,255,255,0.1);
              border-radius: 50%;
            }
            .header h1 { 
              font-size: 26px; 
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 2px;
              font-weight: 700;
              position: relative;
            }
            .header-date { 
              font-size: 14px;
              opacity: 0.9;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .header-date::before {
              content: '📅';
            }
            .patient-card { 
              background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
              border: 2px solid #14b8a6;
              border-radius: 12px;
              padding: 20px 25px;
              margin-bottom: 25px;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .patient-card h3 {
              grid-column: 1 / -1;
              color: #0f766e;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .patient-card h3::before {
              content: '👤';
            }
            .info-item {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .info-label { 
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              font-weight: 600;
            }
            .info-value {
              font-size: 15px;
              color: #1e293b;
              font-weight: 500;
            }
            .report-section {
              background: #fff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            .section-header {
              background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
              color: white;
              padding: 12px 20px;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .section-header::before {
              content: '📋';
            }
            .field-row { 
              display: flex; 
              border-bottom: 1px solid #f1f5f9; 
              padding: 14px 20px;
              transition: background 0.2s;
            }
            .field-row:nth-child(even) {
              background: #f8fafc;
            }
            .field-row:last-child {
              border-bottom: none;
            }
            .field-title { 
              font-weight: 600; 
              width: 180px;
              flex-shrink: 0;
              color: #0f766e;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .field-title::before {
              content: '•';
              color: #14b8a6;
              font-size: 18px;
            }
            .field-value { 
              flex: 1;
              color: #334155;
              font-size: 14px;
            }
            .footer { 
              margin-top: 40px; 
              padding: 25px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .signature-box {
              text-align: center;
              width: 200px;
            }
            .signature-line {
              border-top: 2px solid #0f766e;
              margin-top: 60px;
              padding-top: 8px;
            }
            .signature-label {
              font-size: 12px;
              color: #64748b;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .watermark {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px dashed #e2e8f0;
              color: #94a3b8;
              font-size: 11px;
            }
            @media print {
              body { padding: 0; }
              .page-wrapper { padding: 20px; }
              .header, .patient-card, .report-section, .footer {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-wrapper">
            <div class="header">
              <h1>${selectedTemplate?.template_name || 'Patient Report'}</h1>
              <div class="header-date">Report Date: ${format(new Date(appointment.appointment_date), "PPPP")}</div>
            </div>
            
            <div class="patient-card">
              <h3>Patient Information</h3>
              <div class="info-item">
                <span class="info-label">Patient Name</span>
                <span class="info-value">${appointment.patients.full_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Patient ID</span>
                <span class="info-value">${appointment.patients.patient_id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone Number</span>
                <span class="info-value">${appointment.patients.phone}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">${format(new Date(appointment.patients.date_of_birth), "PPP")}</span>
              </div>
            </div>
            
            <div class="report-section">
              <div class="section-header">Report Details</div>
              ${editableFields.map(field => `
                <div class="field-row">
                  <div class="field-title">${field.title}</div>
                  <div class="field-value">${field.value || '—'}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="footer">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Doctor's Signature</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Date & Stamp</div>
              </div>
            </div>
            
            <div class="watermark">
              This is a computer-generated document. Generated on ${format(new Date(), "PPPp")}
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
