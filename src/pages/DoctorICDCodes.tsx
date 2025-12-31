import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TableSkeleton } from "@/components/TableSkeleton";

interface ICDCode {
  id: string;
  code: string;
  description: string;
  created_at: string;
}

const DoctorICDCodes = () => {
  const { toast } = useToast();
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [isSingleDoctor, setIsSingleDoctor] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<ICDCode | null>(null);
  const [formData, setFormData] = useState({ code: "", description: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    fetchDoctorInfo();
  }, []);

  useEffect(() => {
    if (clinicId || isSingleDoctor) {
      fetchICDCodes();
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

  const fetchICDCodes = async () => {
    try {
      let data, error;
      
      if (isSingleDoctor && doctorId) {
        const result = await supabase
          .from("doctor_icd_codes")
          .select("id, code, description, created_at")
          .eq("doctor_id", doctorId)
          .order("code");
        data = result.data;
        error = result.error;
      } else if (clinicId) {
        const result = await supabase
          .from("clinic_icd_codes")
          .select("id, code, description, created_at")
          .eq("clinic_id", clinicId)
          .order("code");
        data = result.data;
        error = result.error;
      }

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setIcdCodes(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCode) {
        const tableName = isSingleDoctor ? "doctor_icd_codes" : "clinic_icd_codes";
        const { error } = await supabase
          .from(tableName)
          .update({ code: formData.code, description: formData.description })
          .eq("id", editingCode.id);

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Success", description: "ICD code updated successfully" });
          fetchICDCodes();
          closeDialog();
        }
      } else {
        let error;
        
        if (isSingleDoctor && doctorId) {
          const result = await supabase
            .from("doctor_icd_codes")
            .insert({ doctor_id: doctorId, code: formData.code, description: formData.description });
          error = result.error;
        } else if (clinicId) {
          const result = await supabase
            .from("clinic_icd_codes")
            .insert({ clinic_id: clinicId, code: formData.code, description: formData.description });
          error = result.error;
        }

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Success", description: "ICD code added successfully" });
          fetchICDCodes();
          closeDialog();
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const tableName = isSingleDoctor ? "doctor_icd_codes" : "clinic_icd_codes";
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "ICD code deleted successfully" });
      fetchICDCodes();
    }
  };

  const openEditDialog = (icdCode: ICDCode) => {
    setEditingCode(icdCode);
    setFormData({ code: icdCode.code, description: icdCode.description });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingCode(null);
    setFormData({ code: "", description: "" });
  };

  const filteredCodes = icdCodes.filter(
    (icd) =>
      icd.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCodes.length / pageSize);
  const paginatedCodes = filteredCodes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ICD Codes Management</h1>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add ICD Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton columns={3} rows={5} columnWidths={["w-[100px]", "w-[250px]"]} />
              ) : paginatedCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No ICD codes match your search" : "No ICD codes found. Add your first ICD code."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCodes.map((icd) => (
                  <TableRow key={icd.id}>
                    <TableCell className="font-mono font-medium">{icd.code}</TableCell>
                    <TableCell>{icd.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(icd)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete ICD Code</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{icd.code}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(icd.id)} className="bg-destructive text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[25, 50, 75, 100].map(size => <SelectItem key={size} value={size.toString()}>{size}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages || totalPages === 0}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCode ? "Edit ICD Code" : "Add ICD Code"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>ICD Code</Label>
              <Input
                placeholder="e.g., A00.0"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g., Cholera due to Vibrio cholerae"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit">{editingCode ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorICDCodes;