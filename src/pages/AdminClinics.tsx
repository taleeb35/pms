import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock, CheckCircle2, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Clinic {
  id: string;
  clinic_name: string;
  city: string;
  phone_number: string;
  address: string;
  no_of_doctors: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const { toast } = useToast();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinics")
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch doctor counts for each clinic
      const clinicsWithCounts = await Promise.all(
        data.map(async (clinic) => {
          const { count } = await supabase
            .from("doctors")
            .select("id", { count: "exact", head: true })
            .eq("clinic_id", clinic.id);
          return { ...clinic, no_of_doctors: count || 0 };
        })
      );
      setClinics(clinicsWithCounts);
    }
    setLoading(false);
  };

  const updateClinicStatus = async (clinicId: string, newStatus: string) => {
    setUpdating(clinicId);
    const { error } = await supabase
      .from("clinics")
      .update({ status: newStatus })
      .eq("id", clinicId);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Clinic status changed to ${newStatus}`,
      });
      fetchClinics();
    }
    setUpdating(null);
  };

  const stats = {
    total: clinics.length,
    active: clinics.filter(c => c.status === 'active').length,
    draft: clinics.filter(c => c.status === 'draft').length,
    suspended: clinics.filter(c => c.status === 'suspended').length,
  };

  // Pagination logic
  const totalPages = Math.ceil(clinics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClinics = clinics.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Manage Clinics</h2>
        <p className="text-muted-foreground text-base">
          Review and approve clinic registrations, manage clinic status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clinics</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            <Ban className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Clinics Table */}
      <Card className="border-border/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            All Clinics
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="45">45</SelectItem>
                <SelectItem value="60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading clinics...</p>
          ) : clinics.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No clinics registered yet</p>
          ) : (
            <>
              <div className="rounded-md border border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Clinic Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Address</TableHead>
                      <TableHead className="font-semibold text-center">Doctors</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentClinics.map((clinic) => (
                      <TableRow key={clinic.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{clinic.clinic_name}</p>
                            <p className="text-xs text-muted-foreground">{clinic.profiles.full_name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{clinic.profiles.email}</TableCell>
                        <TableCell className="text-sm">{clinic.phone_number}</TableCell>
                        <TableCell className="text-sm">
                          <div className="max-w-[200px]">
                            <p>{clinic.address}</p>
                            <p className="text-xs text-muted-foreground">{clinic.city}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-semibold">
                            {clinic.no_of_doctors}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={clinic.status}
                            onValueChange={(value) => updateClinicStatus(clinic.id, value)}
                            disabled={updating === clinic.id}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue>
                                {clinic.status === "active" && (
                                  <span className="flex items-center gap-1 text-success">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Active
                                  </span>
                                )}
                                {clinic.status === "draft" && (
                                  <span className="flex items-center gap-1 text-warning">
                                    <Clock className="h-3 w-3" />
                                    Draft
                                  </span>
                                )}
                                {clinic.status === "suspended" && (
                                  <span className="flex items-center gap-1 text-destructive">
                                    <Ban className="h-3 w-3" />
                                    Suspended
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-warning" />
                                  Draft
                                </span>
                              </SelectItem>
                              <SelectItem value="active">
                                <span className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                  Active
                                </span>
                              </SelectItem>
                              <SelectItem value="suspended">
                                <span className="flex items-center gap-2">
                                  <Ban className="h-4 w-4 text-destructive" />
                                  Suspended
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(clinic.created_at), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, clinics.length)} of {clinics.length} clinics
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <PaginationItem key={page}>...</PaginationItem>;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClinics;
