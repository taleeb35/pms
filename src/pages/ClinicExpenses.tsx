import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Pencil, Calendar as CalendarIcon, Receipt, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string | null;
  amount: number;
  created_at: string;
}

const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Equipment",
  "Supplies",
  "Maintenance",
  "Insurance",
  "Marketing",
  "Miscellaneous",
];

export default function ClinicExpenses() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clinicId, setClinicId] = useState<string | null>(null);
  
  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    expense_date: new Date(),
    category: "",
    description: "",
    amount: "",
  });
  const [saving, setSaving] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchClinicId();
  }, []);

  useEffect(() => {
    if (clinicId) {
      fetchExpenses();
    }
  }, [clinicId, startDate, endDate, filterCategory]);

  const fetchClinicId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is a clinic owner
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (clinicData) {
        setClinicId(clinicData.id);
        return;
      }

      // Check if user is a receptionist
      const { data: receptionistData } = await supabase
        .from("clinic_receptionists")
        .select("clinic_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (receptionistData) {
        setClinicId(receptionistData.clinic_id);
      }
    } catch (error: any) {
      console.error("Error fetching clinic ID:", error);
    }
  };

  const fetchExpenses = async () => {
    if (!clinicId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("clinic_expenses")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("expense_date", { ascending: false });

      if (startDate) {
        query = query.gte("expense_date", format(startDate, "yyyy-MM-dd"));
      }
      if (endDate) {
        query = query.lte("expense_date", format(endDate, "yyyy-MM-dd"));
      }
      if (filterCategory && filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
      setCurrentPage(1);
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

  const openAddDialog = () => {
    setEditingExpense(null);
    setFormData({
      expense_date: new Date(),
      category: "",
      description: "",
      amount: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      expense_date: new Date(expense.expense_date),
      category: expense.category,
      description: expense.description || "",
      amount: expense.amount.toString(),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!clinicId) return;
    
    if (!formData.category || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const expenseData = {
        clinic_id: clinicId,
        expense_date: format(formData.expense_date, "yyyy-MM-dd"),
        category: formData.category,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
      };

      if (editingExpense) {
        const { error } = await supabase
          .from("clinic_expenses")
          .update(expenseData)
          .eq("id", editingExpense.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("clinic_expenses")
          .insert(expenseData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense added successfully",
        });
      }

      setDialogOpen(false);
      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const { error } = await supabase
        .from("clinic_expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const paginatedExpenses = expenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && !clinicId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clinic Expenses</h1>
          <p className="text-muted-foreground">Track and manage your clinic's expenses</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PP") : <span>Start</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background" align="end">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => { setStartDate(date); setStartDateOpen(false); }}
                disabled={(date) => endDate ? date > endDate : false}
              />
            </PopoverContent>
          </Popover>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PP") : <span>End</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background" align="end">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => { setEndDate(date); setEndDateOpen(false); }}
                disabled={(date) => startDate ? date < startDate : false}
              />
            </PopoverContent>
          </Popover>
          {(startDate || endDate || filterCategory !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setStartDate(undefined); setEndDate(undefined); setFilterCategory("all"); }}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Receipt className="h-5 w-5" />
            Total Expenses
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {startDate && endDate
              ? `${format(startDate, "PP")} - ${format(endDate, "PP")}`
              : startDate
                ? `From ${format(startDate, "PP")}`
                : endDate
                  ? `Until ${format(endDate, "PP")}`
                  : "All time"}
            {filterCategory !== "all" && ` • ${filterCategory}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            PKR {totalExpenses.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Records</CardTitle>
              <CardDescription>
                {expenses.length} expense{expenses.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expenses found. Click "Add Expense" to add your first expense.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(new Date(expense.expense_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {expense.description || "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">
                        PKR {Number(expense.amount).toLocaleString('en-PK')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, expenses.length)} of {expenses.length} entries
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
            <DialogDescription>
              {editingExpense ? "Update the expense details below" : "Enter the expense details below"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.expense_date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background">
                  <Calendar
                    mode="single"
                    selected={formData.expense_date}
                    onSelect={(date) => date && setFormData({ ...formData, expense_date: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (PKR) *</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingExpense ? "Update" : "Add"} Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
