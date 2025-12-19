import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface DiseaseTemplate {
  id: string;
  doctor_id: string;
  disease_name: string;
  prescription_template: string;
  created_at: string;
  updated_at: string;
}

const DoctorDiseaseTemplates = () => {
  const [templates, setTemplates] = useState<DiseaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DiseaseTemplate | null>(null);
  
  const [diseaseName, setDiseaseName] = useState("");
  const [prescriptionTemplate, setPrescriptionTemplate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctor_disease_templates")
        .select("*")
        .eq("doctor_id", user.id)
        .order("disease_name", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch disease templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async () => {
    if (!diseaseName.trim() || !prescriptionTemplate.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("doctor_disease_templates")
        .insert({
          doctor_id: user.id,
          disease_name: diseaseName.trim(),
          prescription_template: prescriptionTemplate.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Disease template added successfully",
      });
      
      setAddDialogOpen(false);
      setDiseaseName("");
      setPrescriptionTemplate("");
      fetchTemplates();
    } catch (error) {
      console.error("Error adding template:", error);
      toast({
        title: "Error",
        description: "Failed to add disease template",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTemplate = async () => {
    if (!selectedTemplate || !diseaseName.trim() || !prescriptionTemplate.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("doctor_disease_templates")
        .update({
          disease_name: diseaseName.trim(),
          prescription_template: prescriptionTemplate.trim(),
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Disease template updated successfully",
      });
      
      setEditDialogOpen(false);
      setSelectedTemplate(null);
      setDiseaseName("");
      setPrescriptionTemplate("");
      fetchTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update disease template",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("doctor_disease_templates")
        .delete()
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Disease template deleted successfully",
      });
      
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete disease template",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (template: DiseaseTemplate) => {
    setSelectedTemplate(template);
    setDiseaseName(template.disease_name);
    setPrescriptionTemplate(template.prescription_template);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (template: DiseaseTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const filteredTemplates = templates.filter((template) =>
    template.disease_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.prescription_template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / pageSize);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Disease Templates
          </h1>
          <p className="text-muted-foreground">
            Create prescription templates for quick appointment processing
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Your Templates</CardTitle>
              <CardDescription>
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No templates match your search" : "No disease templates yet"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setAddDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Disease Name</TableHead>
                    <TableHead>Prescription Template</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.disease_name}</TableCell>
                      <TableCell>
                        <p className="line-clamp-2 text-sm text-muted-foreground whitespace-pre-line">
                          {template.prescription_template}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(template)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(template)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredTemplates.length)} of{" "}
                    {filteredTemplates.length} templates
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Disease Template</DialogTitle>
            <DialogDescription>
              Create a prescription template for quick use during appointments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="disease-name">Disease Name</Label>
              <Input
                id="disease-name"
                placeholder="e.g., Common Cold, Hypertension, Diabetes"
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription Template</Label>
              <Textarea
                id="prescription"
                placeholder="Enter the prescription details..."
                value={prescriptionTemplate}
                onChange={(e) => setPrescriptionTemplate(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTemplate} disabled={submitting}>
              {submitting ? "Adding..." : "Add Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Disease Template</DialogTitle>
            <DialogDescription>
              Update the prescription template details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-disease-name">Disease Name</Label>
              <Input
                id="edit-disease-name"
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prescription">Prescription Template</Label>
              <Textarea
                id="edit-prescription"
                value={prescriptionTemplate}
                onChange={(e) => setPrescriptionTemplate(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTemplate} disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Disease Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template for "{selectedTemplate?.disease_name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDiseaseTemplates;
