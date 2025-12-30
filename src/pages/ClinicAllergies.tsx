import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
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
import DeletingOverlay from "@/components/DeletingOverlay";

interface Allergy {
  id: string;
  name: string;
  created_at: string;
}

const ClinicAllergies = () => {
  const { toast } = useToast();
  const { clinicId, isReceptionist, loading: clinicLoading } = useClinicId();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newAllergyName, setNewAllergyName] = useState("");
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [deletingAllergy, setDeletingAllergy] = useState<Allergy | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (clinicId) {
      fetchAllergies();
    }
  }, [clinicId]);

  const fetchAllergies = async () => {
    if (!clinicId) return;
    try {
      const { data, error } = await supabase
        .from("clinic_allergies")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("name");

      if (error) throw error;
      setAllergies(data || []);
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

  const handleAddAllergy = async () => {
    if (!newAllergyName.trim() || !clinicId) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("clinic_allergies").insert({
        clinic_id: clinicId,
        name: newAllergyName.trim(),
      });

      if (error) throw error;

      toast({ title: "Allergy added successfully" });
      setNewAllergyName("");
      setIsAddDialogOpen(false);
      fetchAllergies();
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

  const handleEditAllergy = async () => {
    if (!editingAllergy || !editingAllergy.name.trim()) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("clinic_allergies")
        .update({ name: editingAllergy.name.trim() })
        .eq("id", editingAllergy.id);

      if (error) throw error;

      toast({ title: "Allergy updated successfully" });
      setIsEditDialogOpen(false);
      setEditingAllergy(null);
      fetchAllergies();
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

  const handleDeleteAllergy = async () => {
    if (!deletingAllergy) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("clinic_allergies")
        .delete()
        .eq("id", deletingAllergy.id);

      if (error) throw error;

      toast({ title: "Allergy deleted successfully" });
      setIsDeleteDialogOpen(false);
      setDeletingAllergy(null);
      fetchAllergies();
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

  const filteredAllergies = allergies.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAllergies.length / pageSize);
  const paginatedAllergies = filteredAllergies.slice(
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
    <>
      <DeletingOverlay isVisible={submitting} message="Processing..." />
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>
                Manage allergy options for patient forms ({allergies.length} total)
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Allergy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search allergies..."
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
                ) : paginatedAllergies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "No allergies match your search" : "No allergies found. Add your first allergy."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAllergies.map((allergy) => (
                    <TableRow key={allergy.id}>
                      <TableCell>{allergy.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingAllergy(allergy);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingAllergy(allergy);
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
            <DialogTitle>Add Allergy</DialogTitle>
            <DialogDescription>Add a new allergy option for patient forms.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Allergy name"
            value={newAllergyName}
            onChange={(e) => setNewAllergyName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAllergy} disabled={submitting || !newAllergyName.trim()}>
              {submitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Allergy</DialogTitle>
            <DialogDescription>Update the allergy name.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Allergy name"
            value={editingAllergy?.name || ""}
            onChange={(e) =>
              setEditingAllergy((prev) => (prev ? { ...prev, name: e.target.value } : null))
            }
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAllergy} disabled={submitting || !editingAllergy?.name.trim()}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Allergy</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingAllergy?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllergy} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default ClinicAllergies;
