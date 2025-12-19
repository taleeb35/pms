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
import { Plus, Pencil, Trash2, Search, FileText, FlaskConical, ClipboardList } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

interface ReportTemplate {
  id: string;
  doctor_id: string;
  title: string;
  value: string;
  created_at: string;
  updated_at: string;
}

type TemplateType = "disease" | "test" | "report";

const DoctorTemplates = () => {
  const navigate = useNavigate();
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
  const [formData, setFormData] = useState({ 
    name: "", 
    content: "" 
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
      setReportTemplates(reportData || []);
    }

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
        setFormData({ name: t.title, content: t.value });
      }
    } else {
      setEditingTemplate(null);
      setTemplateType(activeTab);
      setFormData({ name: "", content: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ name: "", content: "" });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (templateType === "disease") {
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
    } else {
      // Report template
      if (editingTemplate) {
        const { error } = await supabase
          .from("doctor_report_templates")
          .update({
            title: formData.name,
            value: formData.content,
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
          .insert({
            doctor_id: session.user.id,
            title: formData.name,
            value: formData.content,
          });

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
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDiseasePages = Math.ceil(filteredDiseaseTemplates.length / pageSize);
  const totalTestPages = Math.ceil(filteredTestTemplates.length / pageSize);
  const totalReportPages = Math.ceil(filteredReportTemplates.length / pageSize);

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
        return { name: "Report Title", content: "Value", namePlaceholder: "e.g., Blood Pressure", contentPlaceholder: "Enter the value or default content..." };
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
            <TabsList className="mb-4">
              <TabsTrigger value="disease" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Disease Templates ({filteredDiseaseTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Test Templates ({filteredTestTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Report Templates ({filteredReportTemplates.length})
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
                        <TableHead>Title</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReportTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.title}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{template.value}</div>
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
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Add Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Template Type</Label>
              <Select 
                value={templateType} 
                onValueChange={(v) => setTemplateType(v as TemplateType)}
                disabled={!!editingTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disease">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Disease Template
                    </span>
                  </SelectItem>
                  <SelectItem value="test">
                    <span className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      Test Template
                    </span>
                  </SelectItem>
                  <SelectItem value="report">
                    <span className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Report Template
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">{labels.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={labels.namePlaceholder}
              />
            </div>
            <div>
              <Label htmlFor="content">{labels.content}</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={labels.contentPlaceholder}
                rows={6}
              />
            </div>
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
