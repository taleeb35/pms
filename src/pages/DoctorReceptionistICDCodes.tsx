import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";

interface ICDCode { id: string; code: string; description: string; }

const DoctorReceptionistICDCodes = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<ICDCode | null>(null);
  const [formData, setFormData] = useState({ code: "", description: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => { if (doctorId) fetchICDCodes(); }, [doctorId]);

  const fetchICDCodes = async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase.from("doctor_icd_codes").select("id, code, description").eq("doctor_id", doctorId).order("code");
      if (error) throw error;
      setIcdCodes(data || []);
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;
    try {
      if (editingCode) {
        const { error } = await supabase.from("doctor_icd_codes").update({ code: formData.code, description: formData.description }).eq("id", editingCode.id);
        if (error) throw error;
        toast({ title: "ICD code updated" });
      } else {
        const { error } = await supabase.from("doctor_icd_codes").insert({ doctor_id: doctorId, code: formData.code, description: formData.description });
        if (error) throw error;
        toast({ title: "ICD code added" });
      }
      fetchICDCodes(); closeDialog();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("doctor_icd_codes").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "ICD code deleted" }); fetchICDCodes();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const openEditDialog = (icd: ICDCode) => { setEditingCode(icd); setFormData({ code: icd.code, description: icd.description }); setShowDialog(true); };
  const closeDialog = () => { setShowDialog(false); setEditingCode(null); setFormData({ code: "", description: "" }); };

  const filtered = icdCodes.filter(i => i.code.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (doctorLoading) return <div className="p-8 space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ICD Codes Management</h1>
        <Button onClick={() => setShowDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Add ICD Code</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10" /></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? [1,2,3,4,5].map(i => <TableRow key={i}><TableCell><Skeleton className="h-5 w-[100px]" /></TableCell><TableCell><Skeleton className="h-5 w-[250px]" /></TableCell><TableCell><Skeleton className="h-8 w-16" /></TableCell></TableRow>) :
                paginated.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{searchQuery ? "No match" : "No ICD codes."}</TableCell></TableRow> :
                paginated.map(icd => (
                  <TableRow key={icd.id}>
                    <TableCell className="font-mono font-medium">{icd.code}</TableCell>
                    <TableCell>{icd.description}</TableCell>
                    <TableCell className="text-right"><div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(icd)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle><AlertDialogDescription>Delete "{icd.code}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(icd.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                    </div></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Rows:</span><Select value={pageSize.toString()} onValueChange={v => { setPageSize(parseInt(v)); setCurrentPage(1); }}><SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger><SelectContent>{[25,50,75,100].map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Previous</Button><span className="text-sm">Page {currentPage} of {totalPages || 1}</span><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage >= totalPages}>Next</Button></div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={showDialog} onOpenChange={setShowDialog}><DialogContent><DialogHeader><DialogTitle>{editingCode ? "Edit" : "Add"} ICD Code</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label>ICD Code</Label><Input placeholder="e.g., A00.0" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required /></div><div className="space-y-2"><Label>Description</Label><Input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></div><DialogFooter><Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button><Button type="submit">{editingCode ? "Update" : "Add"}</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  );
};

export default DoctorReceptionistICDCodes;
