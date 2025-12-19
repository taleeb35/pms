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
import { Plus, Pencil, Trash2, Search, FileText, FlaskConical, ClipboardList, X, HeartPulse, Briefcase } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import type { Json } from "@/integrations/supabase/types";

interface DiseaseTemplate {
  id: string;
  doctor_id: string;
  disease_name: string;
  prescription_template: string;
  created_at: string;
  updated_at: string;
}

interface TestTemplate {
  id: string;
  doctor_id: string;
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
  doctor_id: string;
  template_name: string;
  fields: ReportField[];
  created_at: string;
  updated_at: string;
}

interface LeaveTemplate {
  id: string;
  doctor_id: string;
  template_name: string;
  template_content: string;
  created_at: string;
  updated_at: string;
}

type TemplateType = "disease" | "test" | "report" | "sick_leave" | "work_leave";

const DoctorTemplates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TemplateType>("disease");
  const [diseaseTemplates, setDiseaseTemplates] = useState<DiseaseTemplate[]>([]);
  const [testTemplates, setTestTemplates] = useState<TestTemplate[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [sickLeaveTemplates, setSickLeaveTemplates] = useState<LeaveTemplate[]>([]);
  const [workLeaveTemplates, setWorkLeaveTemplates] = useState<LeaveTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DiseaseTemplate | TestTemplate | ReportTemplate | LeaveTemplate | null>(null);
  const [templateType, setTemplateType] = useState<TemplateType>("disease");
  const [formData, setFormData] = useState({ 
    name: "", 
    content: "" 
  });
  const [reportFormData, setReportFormData] = useState({
    template_name: "",
    fields: [{ title: "", value: "" }] as ReportField[]
  });
  const pageSize = 10;

  useEffect(() => {
    checkAuthAndFetchTemplates();
  }, []);

  const checkAuthAndFetchTemplates = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/doctor/auth");
      return;
    }
    fetchAllTemplates();
  };

  const fetchAllTemplates = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch disease templates
    const { data: diseaseData, error: diseaseError } = await supabase
      .from("doctor_disease_templates")
      .select("*")
      .eq("doctor_id", session.user.id)
      .order("created_at", { ascending: false });

    if (diseaseError) {
      console.error("Error fetching disease templates:", diseaseError);
    } else {
      setDiseaseTemplates(diseaseData || []);
    }

    // Fetch test templates
    const { data: testData, error: testError } = await supabase
      .from("doctor_test_templates")
      .select("*")
      .eq("doctor_id", session.user.id)
      .order("created_at", { ascending: false });

    if (testError) {
      console.error("Error fetching test templates:", testError);
    } else {
      setTestTemplates(testData || []);
    }

    // Fetch report templates
    const { data: reportData, error: reportError } = await supabase
      .from("doctor_report_templates")
      .select("*")
      .eq("doctor_id", session.user.id)
      .order("created_at", { ascending: false });

    if (reportError) {
      console.error("Error fetching report templates:", reportError);
    } else {
      const transformedData = (reportData || []).map(item => ({
        ...item,
        fields: (item.fields as unknown as ReportField[]) || []
      }));
      setReportTemplates(transformedData);
    }

    // Fetch sick leave templates
    const { data: sickLeaveData, error: sickLeaveError } = await supabase
      .from("doctor_sick_leave_templates")
      .select("*")
      .eq("doctor_id", session.user.id)
      .order("created_at", { ascending: false });

    if (sickLeaveError) {
      console.error("Error fetching sick leave templates:", sickLeaveError);
    } else {
      setSickLeaveTemplates(sickLeaveData || []);
    }

    // Fetch work leave templates
    const { data: workLeaveData, error: workLeaveError } = await supabase
      .from("doctor_work_leave_templates")
      .select("*")
      .eq("doctor_id", session.user.id)
      .order("created_at", { ascending: false });

    if (workLeaveError) {
      console.error("Error fetching work leave templates:", workLeaveError);
    } else {
      setWorkLeaveTemplates(workLeaveData || []);
    }

    setLoading(false);
  };

  const handleOpenDialog = (template?: DiseaseTemplate | TestTemplate | ReportTemplate | LeaveTemplate, type?: TemplateType) => {
    if (template && type) {
      setEditingTemplate(template);
      setTemplateType(type);
      if (type === "disease") {
        const t = template as DiseaseTemplate;
        setFormData({ name: t.disease_name, content: t.prescription_template });
      } else if (type === "test") {
        const t = template as TestTemplate;
        setFormData({ name: t.title, content: t.description });
      } else if (type === "sick_leave" || type === "work_leave") {
        const t = template as LeaveTemplate;
        setFormData({ name: t.template_name, content: t.template_content });
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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
          console.error(error);
        } else {
          toast.success("Disease template updated successfully");
          fetchAllTemplates();
          handleCloseDialog();
        }
      } else {
        const { error } = await supabase
          .from("doctor_disease_templates")
          .insert({
            doctor_id: session.user.id,
            disease_name: formData.name,
            prescription_template: formData.content,
          });

        if (error) {
          toast.error("Failed to create template");
          console.error(error);
        } else {
          toast.success("Disease template created successfully");
          fetchAllTemplates();
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
          console.error(error);
        } else {
          toast.success("Test template updated successfully");
          fetchAllTemplates();
          handleCloseDialog();
        }
      } else {
        const { error } = await supabase
          .from("doctor_test_templates")
          .insert({
            doctor_id: session.user.id,
            title: formData.name,
            description: formData.content,
          });

        if (error) {
          toast.error("Failed to create template");
          console.error(error);
        } else {
          toast.success("Test template created successfully");
          fetchAllTemplates();
          handleCloseDialog();
        }
      }
    } else if (templateType === "sick_leave" || templateType === "work_leave") {
      if (!formData.name.trim() || !formData.content.trim()) {
        toast.error("Please fill in all fields");
        return;
      }

      const tableName = templateType === "sick_leave" ? "doctor_sick_leave_templates" : "doctor_work_leave_templates";
      const typeLabel = templateType === "sick_leave" ? "Sick Leave" : "Work Leave";

      if (editingTemplate) {
        const { error } = await supabase
          .from(tableName)
          .update({
            template_name: formData.name,
            template_content: formData.content,
          })
          .eq("id", editingTemplate.id);

        if (error) {
          toast.error("Failed to update template");
          console.error(error);
        } else {
          toast.success(`${typeLabel} template updated successfully`);
          fetchAllTemplates();
          handleCloseDialog();
        }
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert({
            doctor_id: session.user.id,
            template_name: formData.name,
            template_content: formData.content,
          });

        if (error) {
          toast.error("Failed to create template");
          console.error(error);
        } else {
          toast.success(`${typeLabel} template created successfully`);
          fetchAllTemplates();
          handleCloseDialog();
        }
      }
    } else if (templateType === "report") {
      // Report template
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
          console.error(error);
        } else {
          toast.success("Report template updated successfully");
          fetchAllTemplates();
          handleCloseDialog();
        }
      } else {
        const { error } = await supabase
          .from("doctor_report_templates")
          .insert([{
            doctor_id: session.user.id,
            template_name: reportFormData.template_name,
            fields: validFields as unknown as Json,
          }]);

        if (error) {
          toast.error("Failed to create template");
          console.error(error);
        } else {
          toast.success("Report template created successfully");
          fetchAllTemplates();
          handleCloseDialog();
        }
      }
    }
  };

  const handleDeleteDisease = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from("doctor_disease_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } else {
      toast.success("Template deleted successfully");
      fetchAllTemplates();
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from("doctor_test_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } else {
      toast.success("Template deleted successfully");
      fetchAllTemplates();
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from("doctor_report_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } else {
      toast.success("Template deleted successfully");
      fetchAllTemplates();
    }
  };

  const handleDeleteSickLeave = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from("doctor_sick_leave_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } else {
      toast.success("Template deleted successfully");
      fetchAllTemplates();
    }
  };

  const handleDeleteWorkLeave = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from("doctor_work_leave_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } else {
      toast.success("Template deleted successfully");
      fetchAllTemplates();
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

  const filteredSickLeaveTemplates = sickLeaveTemplates.filter(
    (t) =>
      t.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.template_content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkLeaveTemplates = workLeaveTemplates.filter(
    (t) =>
      t.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.template_content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDiseasePages = Math.ceil(filteredDiseaseTemplates.length / pageSize);
  const totalTestPages = Math.ceil(filteredTestTemplates.length / pageSize);
  const totalReportPages = Math.ceil(filteredReportTemplates.length / pageSize);
  const totalSickLeavePages = Math.ceil(filteredSickLeaveTemplates.length / pageSize);
  const totalWorkLeavePages = Math.ceil(filteredWorkLeaveTemplates.length / pageSize);

  const paginatedDiseaseTemplates = filteredDiseaseTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedTestTemplates = filteredTestTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedReportTemplates = filteredReportTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedSickLeaveTemplates = filteredSickLeaveTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedWorkLeaveTemplates = filteredWorkLeaveTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const getFieldLabels = () => {
    switch (templateType) {
      case "disease":
        return { name: "Disease Name", content: "Prescription Template", namePlaceholder: "e.g., Common Cold", contentPlaceholder: "Enter medications, dosage, instructions..." };
      case "test":
        return { name: "Test Title", content: "Description / Instructions", namePlaceholder: "e.g., Complete Blood Count", contentPlaceholder: "Enter test description, instructions, or default values..." };
      case "report":
        return { name: "Template Name", content: "", namePlaceholder: "e.g., Blood Test Report", contentPlaceholder: "" };
      case "sick_leave":
        return { name: "Template Name", content: "Template Content", namePlaceholder: "e.g., General Sick Leave", contentPlaceholder: "Enter the sick leave certificate text. Use placeholders like [Patient Name], [Date], etc." };
      case "work_leave":
        return { name: "Template Name", content: "Template Content", namePlaceholder: "e.g., Work Absence Letter", contentPlaceholder: "Enter the work leave certificate text. Use placeholders like [Patient Name], [Date], etc." };
    }
  };

  const labels = getFieldLabels();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">Manage your prescription, test, and report templates</p>
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
            <TabsList className="mb-4 flex-wrap">
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
              <TabsTrigger value="sick_leave" className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4" />
                Sick Leave ({filteredSickLeaveTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="work_leave" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Work Leave ({filteredWorkLeaveTemplates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="disease">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : paginatedDiseaseTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No templates found matching your search" : "No disease templates yet. Create your first one!"}
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(template, "disease")}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDisease(template.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalDiseasePages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalDiseasePages }, (_, i) => i + 1).map((page) => (
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
                              onClick={() => setCurrentPage((p) => Math.min(totalDiseasePages, p + 1))}
                              className={currentPage === totalDiseasePages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="test">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : paginatedTestTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No templates found matching your search" : "No test templates yet. Create your first one!"}
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(template, "test")}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTest(template.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalTestPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalTestPages }, (_, i) => i + 1).map((page) => (
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
                              onClick={() => setCurrentPage((p) => Math.min(totalTestPages, p + 1))}
                              className={currentPage === totalTestPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="report">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : paginatedReportTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No templates found matching your search" : "No report templates yet. Create your first one!"}
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(template, "report")}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteReport(template.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalReportPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalReportPages }, (_, i) => i + 1).map((page) => (
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
                              onClick={() => setCurrentPage((p) => Math.min(totalReportPages, p + 1))}
                              className={currentPage === totalReportPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="sick_leave">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : paginatedSickLeaveTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No templates found matching your search" : "No sick leave templates yet. Create your first one!"}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Content Preview</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSickLeaveTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.template_name}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{template.template_content}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(template, "sick_leave")}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSickLeave(template.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalSickLeavePages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalSickLeavePages }, (_, i) => i + 1).map((page) => (
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
                              onClick={() => setCurrentPage((p) => Math.min(totalSickLeavePages, p + 1))}
                              className={currentPage === totalSickLeavePages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="work_leave">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : paginatedWorkLeaveTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No templates found matching your search" : "No work leave templates yet. Create your first one!"}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Content Preview</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedWorkLeaveTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.template_name}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{template.template_content}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(template, "work_leave")}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteWorkLeave(template.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalWorkLeavePages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalWorkLeavePages }, (_, i) => i + 1).map((page) => (
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
                              onClick={() => setCurrentPage((p) => Math.min(totalWorkLeavePages, p + 1))}
                              className={currentPage === totalWorkLeavePages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
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
                  <SelectItem value="sick_leave">Sick Leave Template</SelectItem>
                  <SelectItem value="work_leave">Work Leave Template</SelectItem>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddReportField}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {reportFormData.fields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Field Title (e.g., Hemoglobin)"
                            value={field.title}
                            onChange={(e) => handleReportFieldChange(index, "title", e.target.value)}
                          />
                          <Input
                            placeholder="Default Value (e.g., 14 g/dL)"
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

export default DoctorTemplates;
