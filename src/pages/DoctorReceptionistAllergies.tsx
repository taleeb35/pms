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
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";

interface Allergy {
  id: string;
  name: string;
}

const DoctorReceptionistAllergies = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => { if (doctorId) fetchAllergies(); }, [doctorId]);

  const fetchAllergies = async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase.from("doctor_allergies").select("id, name").eq("doctor_id", doctorId).order("name");
      if (error) throw error;
      setAllergies(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newAllergyName.trim() || !doctorId) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("doctor_allergies").insert({ doctor_id: doctorId, name: newAllergyName.trim() });
      if (error) throw error;
      toast({ title: "Allergy added successfully" });
      setNewAllergyName(""); setIsAddDialogOpen(false); fetchAllergies();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editingAllergy?.name.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("doctor_allergies").update({ name: editingAllergy.name.trim() }).eq("id", editingAllergy.id);
      if (error) throw error;
      toast({ title: "Allergy updated successfully" });
      setIsEditDialogOpen(false); setEditingAllergy(null); fetchAllergies();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deletingAllergy) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("doctor_allergies").delete().eq("id", deletingAllergy.id);
      if (error) throw error;
      toast({ title: "Allergy deleted successfully" });
      setIsDeleteDialogOpen(false); setDeletingAllergy(null); fetchAllergies();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const filtered = allergies.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (doctorLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Allergies</CardTitle><CardDescription>Manage allergy options ({allergies.length} total)</CardDescription></div>
            <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Allergy</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search allergies..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-9" />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? [1,2,3,4,5].map(i => <TableRow key={i}><TableCell><Skeleton className="h-5 w-[200px]" /></TableCell><TableCell><Skeleton className="h-8 w-16" /></TableCell></TableRow>) :
                  paginated.length === 0 ? <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">{searchQuery ? "No match" : "No allergies. Add one."}</TableCell></TableRow> :
                  paginated.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{a.name}</TableCell>
                      <TableCell><div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingAllergy(a); setIsEditDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeletingAllergy(a); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Rows:</span>
              <Select value={pageSize.toString()} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}><SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger><SelectContent>{[25,50,75,100].map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Previous</Button>
              <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage >= totalPages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}><DialogContent><DialogHeader><DialogTitle>Add Allergy</DialogTitle><DialogDescription>Add a new allergy.</DialogDescription></DialogHeader><Input placeholder="Allergy name" value={newAllergyName} onChange={e => setNewAllergyName(e.target.value)} /><DialogFooter><Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button><Button onClick={handleAdd} disabled={submitting || !newAllergyName.trim()}>{submitting ? "Adding..." : "Add"}</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}><DialogContent><DialogHeader><DialogTitle>Edit Allergy</DialogTitle></DialogHeader><Input value={editingAllergy?.name || ""} onChange={e => setEditingAllergy(prev => prev ? {...prev, name: e.target.value} : null)} /><DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleEdit} disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent><DialogHeader><DialogTitle>Delete Allergy</DialogTitle><DialogDescription>Delete "{deletingAllergy?.name}"?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting ? "Deleting..." : "Delete"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
};

export default DoctorReceptionistAllergies;
