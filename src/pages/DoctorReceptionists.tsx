import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UserCog, Search, Pencil, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { validateName, validateEmail, validatePassword, validatePhone, handleNameInput, handlePhoneInput } from "@/lib/validations";
import { Badge } from "@/components/ui/badge";
import TableSkeleton from "@/components/TableSkeleton";

interface Receptionist {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

const MAX_RECEPTIONISTS = 2;

const DoctorReceptionists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState<Receptionist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isClinicDoctor, setIsClinicDoctor] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkDoctorType();
    fetchReceptionists();
  }, []);

  const checkDoctorType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: doctorData } = await supabase
        .from("doctors")
        .select("clinic_id")
        .eq("id", user.id)
        .maybeSingle();

      setIsClinicDoctor(!!doctorData?.clinic_id);
    } catch (error) {
      console.error("Error checking doctor type:", error);
    }
  };

  const fetchReceptionists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: receptionistData, error: receptionistError } = await supabase
        .from("doctor_receptionists")
        .select("id, user_id, created_at, status")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (receptionistError) throw receptionistError;

      const enrichedData = await Promise.all(
        (receptionistData || []).map(async (rec) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", rec.user_id)
            .single();

          return {
            ...rec,
            status: rec.status || "active",
            profiles: profileData || { full_name: "N/A", email: "N/A", phone: null },
          };
        })
      );
      setReceptionists(enrichedData);
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

  const handleAddReceptionist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (receptionists.length >= MAX_RECEPTIONISTS) {
      toast({
        title: "Limit Reached",
        description: `You can only add up to ${MAX_RECEPTIONISTS} receptionists.`,
        variant: "destructive",
      });
      return;
    }
    
    const errors: string[] = [];
    
    const nameValidation = validateName(formData.fullName);
    if (!nameValidation.isValid) errors.push(`Name: ${nameValidation.message}`);
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) errors.push(`Email: ${emailValidation.message}`);
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) errors.push(`Password: ${passwordValidation.message}`);
    
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) errors.push(`Phone: ${phoneValidation.message}`);
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const doctorSession = session;
      const doctorId = session.user.id;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create receptionist account");

      const newReceptionistId = authData.user.id;

      await supabase.auth.setSession({
        access_token: doctorSession.access_token,
        refresh_token: doctorSession.refresh_token,
      });

      // Create receptionist link FIRST (so RLS policy allows profile update)
      const { error: receptionistError } = await supabase
        .from("doctor_receptionists")
        .insert({
          user_id: newReceptionistId,
          doctor_id: doctorId,
          status: "active",
        });

      if (receptionistError) throw receptionistError;

      // Assign receptionist role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: newReceptionistId,
          role: "receptionist",
        });

      if (roleError) throw roleError;

      // Update profile with phone if provided (AFTER doctor_receptionists record exists for RLS)
      if (formData.phone) {
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ phone: formData.phone })
          .eq("id", newReceptionistId);

        if (profileUpdateError) {
          console.error("Error updating profile phone:", profileUpdateError);
        }
      }

      toast({
        title: "Receptionist Added",
        description: "The receptionist has been registered and can now login.",
      });

      setFormData({ fullName: "", email: "", password: "", phone: "" });
      setAddDialogOpen(false);
      fetchReceptionists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditReceptionist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceptionist) return;

    const nameValidation = validateName(editFormData.fullName);
    if (!nameValidation.isValid) {
      toast({
        title: "Validation Error",
        description: `Name: ${nameValidation.message}`,
        variant: "destructive",
      });
      return;
    }

    if (editFormData.phone) {
      const phoneValidation = validatePhone(editFormData.phone);
      if (!phoneValidation.isValid) {
        toast({
          title: "Validation Error",
          description: `Phone: ${phoneValidation.message}`,
          variant: "destructive",
        });
        return;
      }
    }

    setFormLoading(true);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editFormData.fullName,
          phone: editFormData.phone || null,
        })
        .eq("id", selectedReceptionist.user_id);

      if (profileError) throw profileError;

      const { error: statusError } = await supabase
        .from("doctor_receptionists")
        .update({ status: editFormData.status })
        .eq("id", selectedReceptionist.id);

      if (statusError) throw statusError;

      toast({
        title: "Receptionist Updated",
        description: "The receptionist details have been updated.",
      });

      setEditDialogOpen(false);
      setSelectedReceptionist(null);
      fetchReceptionists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteReceptionist = async () => {
    if (!selectedReceptionist) return;
    
    setFormLoading(true);
    try {
      const userIdToDelete = selectedReceptionist.user_id;
      
      const { error } = await supabase
        .from("doctor_receptionists")
        .delete()
        .eq("id", selectedReceptionist.id);

      if (error) throw error;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && userIdToDelete) {
          await supabase.functions.invoke("delete-user", {
            body: { userId: userIdToDelete },
          });
        }
      } catch (authDeleteError) {
        console.error("Error deleting auth user:", authDeleteError);
      }

      toast({
        title: "Receptionist Removed",
        description: "The receptionist has been removed.",
      });

      setDeleteDialogOpen(false);
      setSelectedReceptionist(null);
      fetchReceptionists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const openEditDialog = (receptionist: Receptionist) => {
    setSelectedReceptionist(receptionist);
    setEditFormData({
      fullName: receptionist.profiles?.full_name || "",
      phone: receptionist.profiles?.phone || "",
      status: receptionist.status || "active",
    });
    setEditFormErrors({});
    setEditDialogOpen(true);
  };

  const filteredReceptionists = receptionists.filter((r) => {
    const name = r.profiles?.full_name?.toLowerCase() || "";
    const email = r.profiles?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  // If doctor is linked to a clinic, show message
  if (isClinicDoctor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Receptionists</h1>
          <p className="text-muted-foreground">Manage your receptionists</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Not Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  As a doctor linked to a clinic, receptionists are managed by your clinic owner. 
                  Please contact your clinic administrator for receptionist access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Receptionists</h1>
          <p className="text-muted-foreground">Manage your receptionists</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={receptionists.length >= MAX_RECEPTIONISTS}>
              <Plus className="h-4 w-4" />
              Add Receptionist ({receptionists.length}/{MAX_RECEPTIONISTS})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Receptionist</DialogTitle>
              <DialogDescription>
                Create a new receptionist account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddReceptionist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => {
                    const value = handleNameInput(e);
                    setFormData({ ...formData, fullName: value });
                    const validation = validateName(value);
                    setFormErrors((prev) => ({ ...prev, fullName: validation.isValid ? "" : validation.message }));
                  }}
                  required
                  placeholder="John Smith"
                  className={formErrors.fullName ? "border-destructive" : ""}
                />
                {formErrors.fullName && <p className="text-sm text-destructive">{formErrors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    const validation = validateEmail(e.target.value);
                    setFormErrors((prev) => ({ ...prev, email: validation.isValid ? "" : validation.message }));
                  }}
                  required
                  placeholder="receptionist@example.com"
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    const validation = validatePassword(e.target.value);
                    setFormErrors((prev) => ({ ...prev, password: validation.isValid ? "" : validation.message }));
                  }}
                  required
                  minLength={6}
                  className={formErrors.password ? "border-destructive" : ""}
                />
                {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = handlePhoneInput(e);
                    setFormData({ ...formData, phone: value });
                    if (value) {
                      const validation = validatePhone(value);
                      setFormErrors((prev) => ({ ...prev, phone: validation.isValid ? "" : validation.message }));
                    } else {
                      setFormErrors((prev) => ({ ...prev, phone: "" }));
                    }
                  }}
                  placeholder="+92 300 1234567"
                  className={formErrors.phone ? "border-destructive" : ""}
                />
                {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Adding..." : "Add Receptionist"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Receptionists ({receptionists.length}/{MAX_RECEPTIONISTS})
              </CardTitle>
              <CardDescription>
                Receptionists can manage appointments and patients on your behalf
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receptionists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton columns={5} rows={3} />
          ) : filteredReceptionists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No receptionists found matching your search" : "No receptionists added yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceptionists.map((receptionist) => (
                  <TableRow key={receptionist.id}>
                    <TableCell className="font-medium">
                      {receptionist.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{receptionist.profiles?.email || "N/A"}</TableCell>
                    <TableCell>{receptionist.profiles?.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={receptionist.status === "active" ? "default" : "secondary"}>
                        {receptionist.status === "active" ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Draft</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(receptionist.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(receptionist)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedReceptionist(receptionist);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Receptionist</DialogTitle>
            <DialogDescription>
              Update receptionist details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditReceptionist} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Full Name *</Label>
              <Input
                id="editFullName"
                value={editFormData.fullName}
                onChange={(e) => {
                  const value = handleNameInput(e);
                  setEditFormData({ ...editFormData, fullName: value });
                  const validation = validateName(value);
                  setEditFormErrors((prev) => ({ ...prev, fullName: validation.isValid ? "" : validation.message }));
                }}
                required
                className={editFormErrors.fullName ? "border-destructive" : ""}
              />
              {editFormErrors.fullName && <p className="text-sm text-destructive">{editFormErrors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone Number</Label>
              <Input
                id="editPhone"
                type="tel"
                value={editFormData.phone}
                onChange={(e) => {
                  const value = handlePhoneInput(e);
                  setEditFormData({ ...editFormData, phone: value });
                  if (value) {
                    const validation = validatePhone(value);
                    setEditFormErrors((prev) => ({ ...prev, phone: validation.isValid ? "" : validation.message }));
                  } else {
                    setEditFormErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                placeholder="+92 300 1234567"
                className={editFormErrors.phone ? "border-destructive" : ""}
              />
              {editFormErrors.phone && <p className="text-sm text-destructive">{editFormErrors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Receptionist</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedReceptionist?.profiles?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReceptionist} disabled={formLoading}>
              {formLoading ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorReceptionists;
