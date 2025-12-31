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
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";

interface Procedure { id: string; name: string; price: number; }

const DoctorReceptionistProcedures = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => { if (doctorId) fetchProcedures(); }, [doctorId]);

  const fetchProcedures = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("procedures").select("*").eq("doctor_id", doctorId).order("name");
      if (error) throw error;
      setProcedures(data || []);
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;
    const procedureData = { name: formData.name.trim(), price: parseFloat(formData.price) || 0, doctor_id: doctorId };
    try {
      if (editingProcedure) {
        const { error } = await supabase.from("procedures").update(procedureData).eq("id", editingProcedure.id);
        if (error) throw error;
        toast({ title: "Procedure updated" });
      } else {
        const { error } = await supabase.from("procedures").insert([procedureData]);
        if (error) throw error;
        toast({ title: "Procedure added" });
      }
      setIsDialogOpen(false); setEditingProcedure(null); setFormData({ name: "", price: "" }); fetchProcedures();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this procedure?")) return;
    try {
      await supabase.from("appointments").update({ procedure_id: null, procedure_fee: 0 }).eq("procedure_id", id);
      const { error } = await supabase.from("procedures").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Procedure deleted" }); fetchProcedures();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const openEditDialog = (p: Procedure) => { setEditingProcedure(p); setFormData({ name: p.name, price: p.price.toString() }); setIsDialogOpen(true); };
  const openAddDialog = () => { setEditingProcedure(null); setFormData({ name: "", price: "" }); setIsDialogOpen(true); };

  const filtered = procedures.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  if (doctorLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Procedures Management</h1>
        <Button onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" />Add Procedure</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10" /></div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Procedure Name</TableHead><TableHead>Price</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? [1,2,3,4,5].map(i => <TableRow key={i}><TableCell><Skeleton className="h-5 w-[200px]" /></TableCell><TableCell><Skeleton className="h-5 w-[80px]" /></TableCell><TableCell><Skeleton className="h-8 w-16" /></TableCell></TableRow>) :
              paginated.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{searchQuery ? "No match" : "No procedures."}</TableCell></TableRow> :
              paginated.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.price.toFixed(2)}</TableCell>
                  <TableCell><div className="flex gap-2"><Button variant="ghost" size="icon" onClick={() => openEditDialog(p)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}</div>
        <div className="flex items-center gap-4">
          <Select value={itemsPerPage.toString()} onValueChange={v => { setItemsPerPage(Number(v)); setCurrentPage(1); }}><SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger><SelectContent>{[25,50,75,100].map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}</SelectContent></Select>
          <div className="flex gap-2"><Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>Previous</Button><Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p+1)}>Next</Button></div>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editingProcedure ? "Edit" : "Add"} Procedure</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label>Procedure Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div><div><Label>Price *</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} min="0" step="0.01" required /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button type="submit">{editingProcedure ? "Update" : "Add"}</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  );
};

export default DoctorReceptionistProcedures;
