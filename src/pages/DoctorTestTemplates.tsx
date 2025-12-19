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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, FlaskConical } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Layout from "@/components/Layout";

interface TestTemplate {
  id: string;
  doctor_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const DoctorTestTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TestTemplate | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
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
    fetchTemplates();
  };

  const fetchTemplates = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("doctor_test_templates")
      .select("*")
      .eq("doctor_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch test templates");
      console.error(error);
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (template?: TestTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({ title: template.title, description: template.description });
    } else {
      setEditingTemplate(null);
      setFormData({ title: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ title: "", description: "" });
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (editingTemplate) {
      const { error } = await supabase
        .from("doctor_test_templates")
        .update({
          title: formData.title,
          description: formData.description,
        })
        .eq("id", editingTemplate.id);

      if (error) {
        toast.error("Failed to update template");
        console.error(error);
      } else {
        toast.success("Template updated successfully");
        fetchTemplates();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase
        .from("doctor_test_templates")
        .insert({
          doctor_id: session.user.id,
          title: formData.title,
          description: formData.description,
        });

      if (error) {
        toast.error("Failed to create template");
        console.error(error);
      } else {
        toast.success("Template created successfully");
        fetchTemplates();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
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
      fetchTemplates();
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / pageSize);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Test Templates</h1>
            <p className="text-muted-foreground">Manage your test report templates</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Test Templates ({filteredTemplates.length})
              </CardTitle>
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
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : paginatedTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No templates found matching your search" : "No test templates yet. Create your first one!"}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTemplates.map((template) => (
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
                              onClick={() => handleOpenDialog(template)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
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

                {totalPages > 1 && (
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
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Test Template" : "Add Test Template"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Test Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete Blood Count"
                />
              </div>
              <div>
                <Label htmlFor="description">Description / Instructions</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter test description, instructions, or default values..."
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
    </Layout>
  );
};

export default DoctorTestTemplates;
