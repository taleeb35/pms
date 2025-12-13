import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Procedure {
  id: string;
  name: string;
  price: number;
  created_at: string;
}

const DoctorProcedures = () => {
  const { toast } = useToast();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("procedures")
      .select("*")
      .eq("doctor_id", user.id)
      .order("name");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProcedures(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const procedureData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price) || 0,
      doctor_id: user.id,
    };

    let error;
    if (editingProcedure) {
      ({ error } = await supabase
        .from("procedures")
        .update(procedureData)
        .eq("id", editingProcedure.id));
    } else {
      ({ error } = await supabase
        .from("procedures")
        .insert([procedureData]));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Procedure ${editingProcedure ? "updated" : "added"} successfully` });
      setIsDialogOpen(false);
      setEditingProcedure(null);
      setFormData({ name: "", price: "" });
      fetchProcedures();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this procedure?")) return;

    const { error } = await supabase
      .from("procedures")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Procedure deleted successfully" });
      fetchProcedures();
    }
  };

  const openEditDialog = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setFormData({ name: procedure.name, price: procedure.price.toString() });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProcedure(null);
    setFormData({ name: "", price: "" });
    setIsDialogOpen(true);
  };

  const filteredProcedures = procedures.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProcedures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProcedures = filteredProcedures.slice(startIndex, startIndex + itemsPerPage);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Procedures Management</h1>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Procedure
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search procedures..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Procedure Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedProcedures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No procedures found. Add your first procedure.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProcedures.map((procedure) => (
                <TableRow key={procedure.id}>
                  <TableCell className="font-medium">{procedure.name}</TableCell>
                  <TableCell>{procedure.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(procedure)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(procedure.id)}>
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProcedures.length)} of {filteredProcedures.length}
        </div>
        <div className="flex items-center gap-4">
          <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="75">75</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProcedure ? "Edit Procedure" : "Add Procedure"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Procedure Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Cataract Surgery"
                required
              />
            </div>
            <div>
              <Label>Price *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProcedure ? "Update" : "Add"} Procedure
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorProcedures;
