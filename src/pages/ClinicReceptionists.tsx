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
import { Plus, Trash2, UserCog, Search } from "lucide-react";
import { format } from "date-fns";
import { validateName, validateEmail, validatePassword, validatePhone, handleNameInput, handlePhoneInput } from "@/lib/validations";

interface Receptionist {
  id: string;
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

const ClinicReceptionists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState<Receptionist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get the receptionist records
      const { data: receptionistData, error: receptionistError } = await supabase
        .from("clinic_receptionists")
        .select("id, user_id, created_at")
        .eq("clinic_id", user.id)
        .order("created_at", { ascending: false });

      if (receptionistError) throw receptionistError;

      // Then fetch profiles for each receptionist
      const enrichedData = await Promise.all(
        (receptionistData || []).map(async (rec) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", rec.user_id)
            .single();

          return {
            ...rec,
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
    
    // Validation
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
      
      const clinicSession = session;
      const clinicId = session.user.id;

      // Create auth user for receptionist
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

      // Update profile with phone if provided
      if (formData.phone) {
        await supabase
          .from("profiles")
          .update({ phone: formData.phone })
          .eq("id", authData.user.id);
      }

      // Create receptionist link
      const { error: receptionistError } = await supabase
        .from("clinic_receptionists")
        .insert({
          user_id: authData.user.id,
          clinic_id: clinicId,
        });

      if (receptionistError) throw receptionistError;

      // Assign receptionist role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "receptionist",
        });

      if (roleError) throw roleError;

      // Restore clinic session
      await supabase.auth.signOut();
      await supabase.auth.setSession({
        access_token: clinicSession.access_token,
        refresh_token: clinicSession.refresh_token,
      });

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

  const handleDeleteReceptionist = async () => {
    if (!selectedReceptionist) return;
    
    setFormLoading(true);
    try {
      // Delete from clinic_receptionists (cascade will handle user_roles through auth.users)
      const { error } = await supabase
        .from("clinic_receptionists")
        .delete()
        .eq("id", selectedReceptionist.id);

      if (error) throw error;

      toast({
        title: "Receptionist Removed",
        description: "The receptionist has been removed from your clinic.",
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

  const filteredReceptionists = receptionists.filter((r) => {
    const name = r.profiles?.full_name?.toLowerCase() || "";
    const email = r.profiles?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Receptionists</h1>
          <p className="text-muted-foreground">Manage your clinic's receptionists</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Receptionist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Receptionist</DialogTitle>
              <DialogDescription>
                Create a new receptionist account for your clinic
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
                  placeholder="receptionist@clinic.com"
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
                Receptionists ({receptionists.length})
              </CardTitle>
              <CardDescription>
                Receptionists have full access to manage appointments, patients, and view finance data
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
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : filteredReceptionists.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "No receptionists found" : "No receptionists added yet"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceptionists.map((receptionist) => (
                  <TableRow key={receptionist.id}>
                    <TableCell className="font-medium">{receptionist.profiles?.full_name || "N/A"}</TableCell>
                    <TableCell>{receptionist.profiles?.email || "N/A"}</TableCell>
                    <TableCell>{receptionist.profiles?.phone || "-"}</TableCell>
                    <TableCell>{format(new Date(receptionist.created_at), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReceptionist(receptionist);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Receptionist</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedReceptionist?.profiles?.full_name} from your clinic? They will no longer be able to access the system.
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

export default ClinicReceptionists;
