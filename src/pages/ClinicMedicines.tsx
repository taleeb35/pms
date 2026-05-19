import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClinicId } from "@/hooks/useClinicId";

interface Medicine { id: string; name: string; created_at: string; }

const ClinicMedicines = () => {
  const { toast } = useToast();
  const { clinicId } = useClinicId();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [deleting, setDeleting] = useState<Medicine | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => { if (clinicId) fetchMedicines(); }, [clinicId]);

  const fetchMedicines = async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clinic_medicines")
        .select("id, name, created_at")
        .eq("clinic_id", clinicId)
        .order("name")
        .limit(1000);
      if (error) throw error;
      setMedicines(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !clinicId) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("clinic_medicines").insert({ clinic_id: clinicId, name: newName.trim() });
      if (error) throw error;
      toast({ title: "Medicine added" });
      setNewName(""); setIsAddDialogOpen(false); fetchMedicines();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editing || !editing.name.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("clinic_medicines").update({ name: editing.name.trim() }).eq("id", editing.id);
      if (error) throw error;
      toast({ title: "Medicine updated" });
      setIsEditDialogOpen(false); setEditing(null); fetchMedicines();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("clinic_medicines").delete().eq("id", deleting.id);
      if (error) throw error;
      toast({ title: "Medicine deleted" });
      setIsDeleteDialogOpen(false); setDeleting(null); fetchMedicines();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const filtered = medicines.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const Skel = () => (<>{[1,2,3,4,5].map((i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
      <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8 rounded" /><Skeleton className="h-8 w-8 rounded" /></div></TableCell>
    </TableRow>
  ))}</>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Medicines</CardTitle>
              <CardDescription>Manage clinic medicines library ({medicines.length} total)</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Medicine</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search medicines..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-9" />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? <Skel /> : paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">{searchQuery ? "No medicines match your search" : "No medicines found."}</TableCell></TableRow>
                ) : paginated.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(m); setIsEditDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeleting(m); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="75">75</SelectItem><SelectItem value="100">100</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Medicine</DialogTitle><DialogDescription>Add a new medicine to the clinic library.</DialogDescription></DialogHeader>
          <Input placeholder="Medicine name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={submitting || !newName.trim()}>{submitting ? "Adding..." : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Medicine</DialogTitle><DialogDescription>Update the medicine name.</DialogDescription></DialogHeader>
          <Input placeholder="Medicine name" value={editing?.name || ""} onChange={(e) => setEditing((p) => p ? { ...p, name: e.target.value } : null)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={submitting || !editing?.name.trim()}>{submitting ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Medicine</DialogTitle><DialogDescription>Delete "{deleting?.name}"? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicMedicines;
