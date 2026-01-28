import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, UserPlus, Trash2, Loader2, PenLine, Users } from "lucide-react";
import { format } from "date-fns";
import TableSkeleton from "@/components/TableSkeleton";

interface ContentWriter {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
}

const AdminContentWriters = () => {
  const [writers, setWriters] = useState<ContentWriter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchWriters();
  }, []);

  const fetchWriters = async () => {
    setLoading(true);
    try {
      // Get all content_writer role entries
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id, created_at")
        .eq("role", "content_writer");

      if (roleError) throw roleError;

      if (roleData && roleData.length > 0) {
        const userIds = roleData.map(r => r.user_id);
        
        // Get profile data for these users
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        if (profileError) throw profileError;

        const writersWithData = roleData.map(role => {
          const profile = profileData?.find(p => p.id === role.user_id);
          return {
            id: role.user_id,
            user_id: role.user_id,
            email: profile?.email || "",
            full_name: profile?.full_name || "",
            created_at: role.created_at,
          };
        });

        setWriters(writersWithData);
      } else {
        setWriters([]);
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Create user via edge function
      const { data, error } = await supabase.functions.invoke("create-content-writer", {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content writer account created successfully",
      });

      setFormData({ full_name: "", email: "", password: "" });
      setIsDialogOpen(false);
      fetchWriters();
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

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this content writer?")) return;

    setDeletingId(userId);
    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content writer deleted successfully",
      });

      fetchWriters();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PenLine className="h-8 w-8 text-primary" />
            Content Writers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your content writing team
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Content Writer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Content Writer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Content writers can manage blogs and doctors profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : writers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <PenLine className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content writers yet</p>
              <p className="text-sm">Add your first content writer to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {writers.map((writer) => (
                  <TableRow key={writer.id}>
                    <TableCell className="font-medium">{writer.full_name}</TableCell>
                    <TableCell>{writer.email}</TableCell>
                    <TableCell>
                      {format(new Date(writer.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(writer.user_id)}
                        disabled={deletingId === writer.user_id}
                      >
                        {deletingId === writer.user_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentWriters;
