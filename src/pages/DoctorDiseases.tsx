import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Disease {
  id: string;
  name: string;
  created_at: string;
}

const DoctorDiseases = () => {
  const { toast } = useToast();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
  const [deletingDisease, setDeletingDisease] = useState<Disease | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [isSingleDoctor, setIsSingleDoctor] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    fetchDoctorInfo();
  }, []);

  useEffect(() => {
    if (clinicId || isSingleDoctor) {
      fetchDiseases();
    }
  }, [clinicId, isSingleDoctor]);

  const fetchDoctorInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("doctors")
      .select("id, clinic_id")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setDoctorId(data.id);
      if (data.clinic_id) {
        setClinicId(data.clinic_id);
      } else {
        setIsSingleDoctor(true);
      }
    } else {
      setLoading(false);
    }
  };

  const fetchDiseases = async () => {
    try {
      let data, error;
      
      if (isSingleDoctor && doctorId) {
        const result = await supabase
          .from("doctor_diseases")
          .select("id, name, created_at")
          .eq("doctor_id", doctorId)
          .order("name");
        data = result.data;
        error = result.error;
      } else if (clinicId) {
        const result = await supabase
          .from("clinic_diseases")
          .select("id, name, created_at")
          .eq("clinic_id", clinicId)
          .order("name");
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      setDiseases(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDisease = async () => {
    if (!newDiseaseName.trim()) return;
    setSubmitting(true);

    try {
      let error;
      
      if (isSingleDoctor && doctorId) {
        const result = await supabase.from("doctor_diseases").insert({
          doctor_id: doctorId,
          name: newDiseaseName.trim(),
        });
        error = result.error;
      } else if (clinicId) {
        const result = await supabase.from("clinic_diseases").insert({
          clinic_id: clinicId,
          name: newDiseaseName.trim(),
        });
        error = result.error;
      }

      if (error) throw error;

      toast({ title: "Disease added successfully" });
      setNewDiseaseName("");
      setIsAddDialogOpen(false);
      fetchDiseases();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDisease = async () => {
    if (!editingDisease || !editingDisease.name.trim()) return;
    setSubmitting(true);

    try {
      const tableName = isSingleDoctor ? "doctor_diseases" : "clinic_diseases";
      const { error } = await supabase
        .from(tableName)
        .update({ name: editingDisease.name.trim() })
        .eq("id", editingDisease.id);

      if (error) throw error;

      toast({ title: "Disease updated successfully" });
      setIsEditDialogOpen(false);
      setEditingDisease(null);
      fetchDiseases();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDisease = async () => {
    if (!deletingDisease) return;
    setSubmitting(true);

    try {
      const tableName = isSingleDoctor ? "doctor_diseases" : "clinic_diseases";
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", deletingDisease.id);

      if (error) throw error;

      toast({ title: "Disease deleted successfully" });
      setIsDeleteDialogOpen(false);
      setDeletingDisease(null);
      fetchDiseases();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDiseases = diseases.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDiseases.length / pageSize);
  const paginatedDiseases = filteredDiseases.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Major Diseases</CardTitle>
              <CardDescription>
                Manage disease options for patient forms ({diseases.length} total)
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Disease
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search diseases..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={2} rows={5} columnWidths={["w-[200px]"]} />
                ) : paginatedDiseases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "No diseases match your search" : "No diseases found. Add your first disease."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDiseases.map((disease) => (
                    <TableRow key={disease.id}>
                      <TableCell>{disease.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingDisease(disease);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingDisease(disease);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="75">75</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Disease</DialogTitle>
            <DialogDescription>Add a new disease option for patient forms.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Disease name"
            value={newDiseaseName}
            onChange={(e) => setNewDiseaseName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDisease} disabled={submitting || !newDiseaseName.trim()}>
              {submitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Disease</DialogTitle>
            <DialogDescription>Update the disease name.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Disease name"
            value={editingDisease?.name || ""}
            onChange={(e) =>
              setEditingDisease((prev) => (prev ? { ...prev, name: e.target.value } : null))
            }
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDisease} disabled={submitting || !editingDisease?.name.trim()}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Disease</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingDisease?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDisease} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDiseases;