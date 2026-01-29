import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, Plus, X, Upload, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TableSkeleton from "@/components/TableSkeleton";
import { TablePagination } from "@/components/TablePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Specializations list
const specializations = [
  "Allergist",
  "Cardiologist",
  "Dentist",
  "Dermatologist",
  "Endocrinologist",
  "ENT Specialist",
  "Gastroenterologist",
  "General Physician",
  "General Surgeon",
  "Geriatrician",
  "Gynecologist",
  "Hematologist",
  "Infectious Disease Specialist",
  "Nephrologist",
  "Neurologist",
  "Neurosurgeon",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedic Surgeon",
  "Pain Management Specialist",
  "Pediatrician",
  "Plastic Surgeon",
  "Psychiatrist",
  "Psychologist",
  "Pulmonologist",
  "Radiologist",
  "Rheumatologist",
  "Sports Medicine Specialist",
  "Urologist",
  "Vascular Surgeon",
];

// Pakistan cities list
const pakistanCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot",
  "Sargodha", "Bahawalpur", "Sukkur", "Larkana", "Hyderabad",
  "Mardan", "Mingora", "Abbottabad", "Dera Ghazi Khan", "Sahiwal",
  "Nawabshah", "Jhang", "Rahim Yar Khan", "Kasur", "Gujrat",
  "Sheikhupura", "Dera Ismail Khan", "Mirpur Khas", "Okara", "Chiniot",
  "Kamoke", "Mandi Bahauddin", "Jhelum", "Sadiqabad", "Jacobabad",
  "Shikarpur", "Khanewal", "Hafizabad", "Kohat", "Muzaffargarh",
  "Khanpur", "Gojra", "Mandi Burewala", "Daska", "Vehari"
].sort();

// Searchable Specialization Select Component
const SpecializationSelect = ({
  value,
  onValueChange,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background font-normal"
          >
            {value || "Select specialization"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background z-50" align="start">
          <Command>
            <CommandInput placeholder="Search specialization..." className="h-9" />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>No specialization found.</CommandEmpty>
              <CommandGroup>
                {specializations.map((spec) => (
                  <CommandItem
                    key={spec}
                    value={spec}
                    onSelect={() => {
                      onValueChange(spec);
                      setOpen(false);
                    }}
                  >
                    {spec}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === spec ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Searchable City Select Component
const CitySelectDropdown = ({
  value,
  onValueChange,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background font-normal"
          >
            {value || "Select city"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background z-50" align="start">
          <Command>
            <CommandInput placeholder="Search city..." className="h-9" />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {pakistanCities.map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onValueChange(city);
                      setOpen(false);
                    }}
                  >
                    {city}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === city ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface SEODoctor {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string;
  experience_years: number | null;
  introduction: string | null;
  city: string | null;
  avatar_url: string | null;
  is_published: boolean;
  pmdc_verified: boolean | null;
  clinic_name: string | null;
  timing: string | null;
  clinic_location: string | null;
  created_by: string;
}

const DEFAULT_PAGE_SIZE = 25;

const ContentWriterDoctors = () => {
  const [seoDoctors, setSeoDoctors] = useState<SEODoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { toast } = useToast();

  const [addFormData, setAddFormData] = useState({
    full_name: "",
    pmdc_verified: false,
    specialization: "",
    qualification: "",
    experience_years: "",
    city: "",
    clinic_name: "",
    timing: "",
    clinic_location: "",
    introduction: "",
  });

  useEffect(() => {
    fetchSeoDoctors();
  }, []);

  const fetchSeoDoctors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("seo_doctor_listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSeoDoctors(data || []);
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let avatarUrl = null;

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `seo-doctor-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("medical-documents")
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("medical-documents")
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from("seo_doctor_listings")
        .insert({
          full_name: addFormData.full_name,
          specialization: addFormData.specialization,
          qualification: addFormData.qualification,
          experience_years: addFormData.experience_years ? parseInt(addFormData.experience_years) : null,
          introduction: addFormData.introduction || null,
          avatar_url: avatarUrl,
          pmdc_verified: addFormData.pmdc_verified,
          clinic_name: addFormData.clinic_name || null,
          timing: addFormData.timing || null,
          clinic_location: addFormData.clinic_location || null,
          city: addFormData.city || null,
          created_by: user.id,
          is_published: true,
        });

      if (error) throw error;

      toast({ title: "Success", description: "Doctor listing added successfully" });
      setShowAddForm(false);
      resetAddForm();
      fetchSeoDoctors();
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

  const resetAddForm = () => {
    setAddFormData({
      full_name: "",
      pmdc_verified: false,
      specialization: "",
      qualification: "",
      experience_years: "",
      city: "",
      clinic_name: "",
      timing: "",
      clinic_location: "",
      introduction: "",
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const filteredSeoDoctors = seoDoctors.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      doc.full_name.toLowerCase().includes(searchLower) ||
      doc.specialization.toLowerCase().includes(searchLower) ||
      (doc.city || "").toLowerCase().includes(searchLower) ||
      (doc.clinic_name || "").toLowerCase().includes(searchLower) ||
      (doc.clinic_location || "").toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredSeoDoctors.length / pageSize);
  const paginatedDoctors = filteredSeoDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-info" />
            Listed Doctors
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage SEO doctor listings for public profiles
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Doctor
          </Button>
        )}
      </div>

      {/* Add Doctor Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Add New Doctor Listing</CardTitle>
                <CardDescription>Fill in the details to add a new doctor profile</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setShowAddForm(false); resetAddForm(); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDoctor} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Name *</Label>
                  <Input
                    id="full_name"
                    value={addFormData.full_name}
                    onChange={(e) => setAddFormData({ ...addFormData, full_name: e.target.value })}
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>

                {/* PMDC Verified */}
                <div className="space-y-2">
                  <Label>PMDC Verified</Label>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pmdc_yes"
                        checked={addFormData.pmdc_verified}
                        onCheckedChange={(checked) => setAddFormData({ ...addFormData, pmdc_verified: checked === true })}
                      />
                      <Label htmlFor="pmdc_yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pmdc_no"
                        checked={!addFormData.pmdc_verified}
                        onCheckedChange={(checked) => setAddFormData({ ...addFormData, pmdc_verified: checked !== true })}
                      />
                      <Label htmlFor="pmdc_no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </div>
                </div>

                {/* Type/Specialization */}
                <SpecializationSelect
                  value={addFormData.specialization}
                  onValueChange={(value) => setAddFormData({ ...addFormData, specialization: value })}
                  label="Type / Specialization *"
                />

                {/* Qualification */}
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification & Education *</Label>
                  <Input
                    id="qualification"
                    value={addFormData.qualification}
                    onChange={(e) => setAddFormData({ ...addFormData, qualification: e.target.value })}
                    placeholder="e.g., MBBS, FCPS"
                    required
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={addFormData.experience_years}
                    onChange={(e) => setAddFormData({ ...addFormData, experience_years: e.target.value })}
                    placeholder="e.g., 10"
                  />
                </div>

                {/* City */}
                <CitySelectDropdown
                  value={addFormData.city}
                  onValueChange={(value) => setAddFormData({ ...addFormData, city: value })}
                  label="City *"
                />

                {/* Clinic Name */}
                <div className="space-y-2">
                  <Label htmlFor="clinic_name">Clinic Name</Label>
                  <Input
                    id="clinic_name"
                    value={addFormData.clinic_name}
                    onChange={(e) => setAddFormData({ ...addFormData, clinic_name: e.target.value })}
                    placeholder="e.g., City Hospital"
                  />
                </div>

                {/* Timing */}
                <div className="space-y-2">
                  <Label htmlFor="timing">Timing</Label>
                  <Input
                    id="timing"
                    value={addFormData.timing}
                    onChange={(e) => setAddFormData({ ...addFormData, timing: e.target.value })}
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                  />
                </div>

                {/* Clinic Location */}
                <div className="space-y-2">
                  <Label htmlFor="clinic_location">Clinic Location</Label>
                  <Input
                    id="clinic_location"
                    value={addFormData.clinic_location}
                    onChange={(e) => setAddFormData({ ...addFormData, clinic_location: e.target.value })}
                    placeholder="e.g., Lahore, Gulberg III"
                  />
                </div>

                {/* Profile Picture */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover border" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Introduction */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="introduction">Introduction / Bio</Label>
                  <Textarea
                    id="introduction"
                    value={addFormData.introduction}
                    onChange={(e) => setAddFormData({ ...addFormData, introduction: e.target.value })}
                    placeholder="Write a brief introduction about the doctor..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); resetAddForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Doctor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Doctor Listings Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Your Doctor Listings</CardTitle>
              <CardDescription>{filteredSeoDoctors.length} of {seoDoctors.length} listings</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, clinic..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : paginatedDoctors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No doctor listings found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Clinic</TableHead>
                    <TableHead>PMDC</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDoctors.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.full_name}</TableCell>
                      <TableCell>{doc.specialization}</TableCell>
                      <TableCell>{doc.city || "N/A"}</TableCell>
                      <TableCell>{doc.clinic_name || "N/A"}</TableCell>
                      <TableCell>
                        {doc.pmdc_verified ? (
                          <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Not Verified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {doc.is_published ? (
                          <Badge className="bg-info/10 text-info border-info/20">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                  totalItems={filteredSeoDoctors.length}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentWriterDoctors;
