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
import { useClinicId } from "@/hooks/useClinicId";

interface Procedure {
  id: string;
  name: string;
  price: number;
  doctor_id: string;
  created_at: string;
}

interface Doctor {
  id: string;
  profiles: {
    full_name: string;
  } | null;
  specialization: string;
}

const ClinicProcedures = () => {
  const { toast } = useToast();
  const { clinicId, loading: clinicLoading } = useClinicId();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "", doctor_id: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    if (clinicId) {
      fetchDoctors();
    }
  }, [clinicId]);

  useEffect(() => {
    if (doctors.length > 0) {
      fetchProcedures();
    }
  }, [doctors]);

  const fetchDoctors = async () => {
    if (!clinicId) return;
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, specialization, profiles(full_name)")
        .eq("clinic_id", clinicId)
        .order("profiles(full_name)");

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching doctors", description: error.message, variant: "destructive" });
    }
  };

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const doctorIds = doctors.map(d => d.id);
      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .in("doctor_id", doctorIds)
        .order("name");

      if (error) throw error;
      setProcedures(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.doctor_id) {
      toast({ title: "Error", description: "Please select a doctor", variant: "destructive" });
      return;
    }

    const procedureData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price) || 0,
      doctor_id: formData.doctor_id,
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
      setFormData({ name: "", price: "", doctor_id: "" });
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
    setFormData({ 
      name: procedure.name, 
      price: procedure.price.toString(),
      doctor_id: procedure.doctor_id 
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProcedure(null);
    setFormData({ name: "", price: "", doctor_id: doctors[0]?.id || "" });
    setIsDialogOpen(true);
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.profiles?.full_name || "Unknown Doctor";
  };

  const filteredProcedures = procedures.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDoctor = selectedDoctorFilter === "all" || p.doctor_id === selectedDoctorFilter;
    return matchesSearch && matchesDoctor;
  });

  const totalPages = Math.ceil(filteredProcedures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProcedures = filteredProcedures.slice(startIndex, startIndex + itemsPerPage);

  if (clinicLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Procedures Management</h1>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Procedure
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center flex-wrap">
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
        <Select value={selectedDoctorFilter} onValueChange={(v) => { setSelectedDoctorFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.profiles?.full_name || "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Procedure Name</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedProcedures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No procedures found. Add your first procedure.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProcedures.map((procedure) => (
                <TableRow key={procedure.id}>
                  <TableCell className="font-medium">{procedure.name}</TableCell>
                  <TableCell>{getDoctorName(procedure.doctor_id)}</TableCell>
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
          Showing {filteredProcedures.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredProcedures.length)} of {filteredProcedures.length}
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
              <Label>Doctor *</Label>
              <Select value={formData.doctor_id} onValueChange={(v) => setFormData({ ...formData, doctor_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.profiles?.full_name || "Unknown"} - {doctor.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

export default ClinicProcedures;
