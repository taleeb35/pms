import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, FileText, FlaskConical, ClipboardList, X } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import type { Json } from "@/integrations/supabase/types";
import TableSkeleton from "@/components/TableSkeleton";

interface DiseaseTemplate {
  id: string;
  clinic_id: string;
  disease_name: string;
  prescription_template: string;
  created_at: string;
  updated_at: string;
}

interface TestTemplate {
  id: string;
  clinic_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ReportField {
  title: string;
  value: string;
}

interface ReportTemplate {
  id: string;
  clinic_id: string;
  template_name: string;
  fields: ReportField[];
  created_at: string;
  updated_at: string;
}

type TemplateType = "disease" | "test" | "report";

interface ClinicTemplatesProps {
  userType: "clinic" | "receptionist";
}

const ClinicTemplates = ({ userType }: ClinicTemplatesProps) => {
  const navigate = useNavigate();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TemplateType>("disease");
  const [diseaseTemplates, setDiseaseTemplates] = useState<DiseaseTemplate[]>([]);
  const [testTemplates, setTestTemplates] = useState<TestTemplate[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DiseaseTemplate | TestTemplate | ReportTemplate | null>(null);
  const [templateType, setTemplateType] = useState<TemplateType>("disease");
  const [formData, setFormData] = useState({ name: "", content: "" });
  const [reportFormData, setReportFormData] = useState({
    template_name: "",
    fields: [{ title: "", value: "" }] as ReportField[]
  });
  const pageSize = 10;

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate(userType === "clinic" ? "/auth" : "/receptionist-auth");
      return;
    }

    // Get clinic_id based on user type
    if (userType === "clinic") {
      setClinicId(session.user.id);
      fetchAllTemplates(session.user.id);
    } else {
      // Receptionist - get clinic_id from clinic_receptionists table
      const { data: receptionistData } = await supabase
        .from("clinic_receptionists")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (receptionistData?.clinic_id) {
        setClinicId(receptionistData.clinic_id);
        fetchAllTemplates(receptionistData.clinic_id);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchAllTemplates = async (clinic: string) => {
    setLoading(true);

    // Fetch disease templates
    const { data: diseaseData } = await supabase
      .from("doctor_disease_templates")
      .select("*")
      .eq("clinic_id", clinic)
      .order("created_at", { ascending: false });
    setDiseaseTemplates(diseaseData || []);

    // Fetch test templates
    const { data: testData } = await supabase
      .from("doctor_test_templates")
      .select("*")
      .eq("clinic_id", clinic)
      .order("created_at", { ascending: false });
    setTestTemplates(testData || []);

    // Fetch report templates
    const { data: reportData } = await supabase
      .from("doctor_report_templates")
      .select("*")
      .eq("clinic_id", clinic)
      .order("created_at", { ascending: false });
    
    const transformedData = (reportData || []).map(item => ({
      ...item,
      fields: (item.fields as unknown as ReportField[]) || []
    }));
    setReportTemplates(transformedData);

    setLoading(false);
  };

  const handleOpenDialog = (template?: DiseaseTemplate | TestTemplate | ReportTemplate, type?: TemplateType) => {
    if (template && type) {
      setEditingTemplate(template);
      setTemplateType(type);
      if (type === "disease") {
        const t = template as DiseaseTemplate;
        setFormData({ name: t.disease_name, content: t.prescription_template });
      } else if (type === "test") {
        const t = template as TestTemplate;
        setFormData({ name: t.title, content: t.description });
      } else {
        const t = template as ReportTemplate;
        setReportFormData({
          template_name: t.template_name,
          fields: t.fields.length > 0 ? t.fields : [{ title: "", value: "" }]
        });
      }
    } else {
      setEditingTemplate(null);
      setTemplateType(activeTab);
      setFormData({ name: "", content: "" });
      setReportFormData({ template_name: "", fields: [{ title: "", value: "" }] });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ name: "", content: "" });
    setReportFormData({ template_name: "", fields: [{ title: "", value: "" }] });
  };

  const handleAddReportField = () => {
    setReportFormData(prev => ({
      ...prev,
      fields: [...prev.fields, { title: "", value: "" }]
    }));
  };

  const handleRemoveReportField = (index: number) => {
    if (reportFormData.fields.length > 1) {
      setReportFormData(prev => ({
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index)
      }));
    }
  };

  const handleReportFieldChange = (index: number, field: "title" | "value", value: string) => {
    setReportFormData(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, [field]: value } : f)
    }));
  };

  const handleSave = async () => {
    if (!clinicId) return;

    if (templateType === "disease") {
      if (!formData.name.trim() || !formData.content.trim()) {
        toast.error("Please fill in all fields");
        return;
      }

      if (editingTemplate) {
        const { error } = await supabase
          .from("doctor_disease_templates")
          .update({
            disease_name: formData.name,
            prescription_template: formData.content,
          })
          .eq("id", editingTemplate.id);

        if (error) {
          toast.error("Failed to update template");
        } else {
          toast.success("Disease template updated");
          fetchAllTemplates(clinicId);
          handleCloseDialog();
        }
      } else {
        const { error } = await supabase
          .from("doctor_disease_templates")
          .insert({
            clinic_id: clinicId,
            doctor_id: clinicId, // Using clinic_id as doctor_id for clinic-created templates
            disease_name: formData.name,
            prescription_template: formData.content,
          });

        if (error) {
          toast.error("Failed to create template");
        } else {
          toast.success("Disease template created");
          fetchAllTemplates(clinicId);
          handleCloseDialog();
        }
      }
    } else if (templateType === "test") {
      if (!formData.name.trim() || !formData.content.trim()) {
        toast.error("Please fill in all fields");
        return;
      }

      if (editingTemplate) {
        const { error } = await supabase
          .from("doctor_test_templates")
          .update({
            title: formData.name,
            description: formData.content,
          })
          .eq("id", editingTemplate.id);

        if (error) {
          toast.error("Failed to update template");
        } else {
          toast.success("Test template updated");
          fetchAllTemplates(clinicId);
          handleCloseDialog();
        }
      } else {
        const { error } = await supabase
          .from("doctor_test_templates")
          .insert({
            clinic_id: clinicId,
            doctor_id: clinicId,
            title: formData.name,
            description: formData.content,
          });

        if (error) {
          toast.error("Failed to create template");
        } else {
          toast.success("Test template created");
          fetchAllTemplates(clinicId);
          handleCloseDialog();
        }
      }
    } else {
      if (!reportFormData.template_name.trim()) {
        toast.error("Please enter a template name");
        return;
      }

      const validFields = reportFormData.fields.filter(f => f.title.trim() || f.value.trim());
      if (validFields.length === 0) {
        toast.error("Please add at least one field");
        return;
      }

      if (editingTemplate) {
        const { error } = await supabase
          .from("doctor_report_templates")
          .update({
            template_name: reportFormData.template_name,
            fields: validFields as unknown as Json,
          })
          .eq("id", editingTemplate.id);

        if (error) {
          toast.error("Failed to update template");
        } else {
          toast.success("Report template updated");
          fetchAllTemplates(clinicId);
          handleCloseDialog();
        }
      } else {
        const { error } = await supabase
          .from("doctor_report_templates")
          .insert([{
            clinic_id: clinicId,
            doctor_id: clinicId,
            template_name: reportFormData.template_name,
            fields: validFields as unknown as Json,
          }]);

        if (error) {
          toast.error("Failed to create template");
        } else {
          toast.success("Report template created");
          fetchAllTemplates(clinicId);
          handleCloseDialog();
        }
      }
    }
  };

  const handleDelete = async (id: string, type: TemplateType) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    if (!clinicId) return;

    const tableName = type === "disease" 
      ? "doctor_disease_templates" 
      : type === "test" 
      ? "doctor_test_templates" 
      : "doctor_report_templates";

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete template");
    } else {
      toast.success("Template deleted");
      fetchAllTemplates(clinicId);
    }
  };

  const filteredDiseaseTemplates = diseaseTemplates.filter(
    (t) =>
      t.disease_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.prescription_template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTestTemplates = testTemplates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReportTemplates = reportTemplates.filter(
    (t) =>
      t.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fields.some(f => 
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const totalDiseasePages = Math.ceil(filteredDiseaseTemplates.length / pageSize);
  const totalTestPages = Math.ceil(filteredTestTemplates.length / pageSize);
  const totalReportPages = Math.ceil(filteredReportTemplates.length / pageSize);

  const paginatedDiseaseTemplates = filteredDiseaseTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedTestTemplates = filteredTestTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedReportTemplates = filteredReportTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const getFieldLabels = () => {
    switch (templateType) {
      case "disease":
        return { name: "Disease Name", content: "Prescription Template", namePlaceholder: "e.g., Common Cold", contentPlaceholder: "Enter medications, dosage, instructions..." };
      case "test":
        return { name: "Test Title", content: "Description / Instructions", namePlaceholder: "e.g., Complete Blood Count", contentPlaceholder: "Enter test description, instructions..." };
      case "report":
        return { name: "Template Name", content: "", namePlaceholder: "e.g., Blood Test Report", contentPlaceholder: "" };
    }
  };

  const labels = getFieldLabels();

  const renderPagination = (totalPages: number) => (
    totalPages > 1 && (
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">Manage clinic prescription, test, and report templates</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Templates</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TemplateType)}>
            <TabsList className="mb-4">
              <TabsTrigger value="disease" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Disease ({filteredDiseaseTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Test ({filteredTestTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Report ({filteredReportTemplates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="disease">
              {loading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Disease Name</TableHead>
                      <TableHead>Prescription Template</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableSkeleton columns={3} rows={5} />
                  </TableBody>
                </Table>
              ) : paginatedDiseaseTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No templates found" : "No disease templates yet"}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Disease Name</TableHead>
                        <TableHead>Prescription Template</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDiseaseTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.disease_name}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{template.prescription_template}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(template, "disease")}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(template.id, "disease")} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {renderPagination(totalDiseasePages)}
                </>
              )}
            </TabsContent>

            <TabsContent value="test">
              {loading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableSkeleton columns={3} rows={5} />
                  </TableBody>
                </Table>
              ) : paginatedTestTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No templates found" : "No test templates yet"}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTestTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.title}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{template.description}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(template, "test")}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(template.id, "test")} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {renderPagination(totalTestPages)}
                </>
              )}
            </TabsContent>

            <TabsContent value="report">
              {loading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableSkeleton columns={3} rows={5} />
                  </TableBody>
                </Table>
              ) : paginatedReportTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No templates found" : "No report templates yet"}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Fields</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReportTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.template_name}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="text-sm text-muted-foreground">
                              {template.fields.length} field(s): {template.fields.slice(0, 3).map(f => f.title).join(", ")}
                              {template.fields.length > 3 && "..."}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(template, "report")}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(template.id, "report")} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {renderPagination(totalReportPages)}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Add New Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select
                value={templateType}
                onValueChange={(v) => setTemplateType(v as TemplateType)}
                disabled={!!editingTemplate}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disease">Disease Template</SelectItem>
                  <SelectItem value="test">Test Template</SelectItem>
                  <SelectItem value="report">Report Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {templateType !== "report" ? (
              <>
                <div className="space-y-2">
                  <Label>{labels.name}</Label>
                  <Input
                    placeholder={labels.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{labels.content}</Label>
                  <Textarea
                    placeholder={labels.contentPlaceholder}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Blood Test Report"
                    value={reportFormData.template_name}
                    onChange={(e) => setReportFormData({ ...reportFormData, template_name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Fields</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddReportField}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {reportFormData.fields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Field Title"
                            value={field.title}
                            onChange={(e) => handleReportFieldChange(index, "title", e.target.value)}
                          />
                          <Input
                            placeholder="Default Value"
                            value={field.value}
                            onChange={(e) => handleReportFieldChange(index, "value", e.target.value)}
                          />
                        </div>
                        {reportFormData.fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReportField(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicTemplates;
