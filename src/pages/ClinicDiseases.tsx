import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useClinicId } from "@/hooks/useClinicId";

interface Disease {
  id: string;
  name: string;
  created_at: string;
}

const ClinicDiseases = () => {
  const { toast } = useToast();
  const { clinicId, isReceptionist, loading: clinicLoading } = useClinicId();
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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (clinicId) {
      fetchDiseases();
    }
  }, [clinicId]);

  const fetchDiseases = async () => {
    if (!clinicId) return;
    try {
      const { data, error } = await supabase
        .from("clinic_diseases")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("name");

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
    if (!newDiseaseName.trim() || !clinicId) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("clinic_diseases").insert({
        clinic_id: clinicId,
        name: newDiseaseName.trim(),
      });

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
      const { error } = await supabase
        .from("clinic_diseases")
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
      const { error } = await supabase
        .from("clinic_diseases")
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

  const isLoading = loading || clinicLoading;

  // Loading skeleton that shows page structure
  const TableLoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-[200px]" />
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
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
                {isLoading ? (
                  <TableLoadingSkeleton />
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
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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

export default ClinicDiseases;
