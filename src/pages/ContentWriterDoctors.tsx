import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, Plus, X, Upload, Check, ChevronsUpDown, Loader2, Trash2, Building2, Edit, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TableSkeleton from "@/components/TableSkeleton";
import { TablePagination } from "@/components/TablePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { TimeSelect } from "@/components/TimeSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DeletingOverlay from "@/components/DeletingOverlay";

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

const DAYS_OF_WEEK = [
  { id: 0, name: "Sunday" },
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
];

interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

interface ClinicFormData {
  id?: string;
  clinic_name: string;
  clinic_location: string;
  fee: string;
  schedule: Record<number, DaySchedule>;
}

const getDefaultSchedule = (): Record<number, DaySchedule> => {
  const schedule: Record<number, DaySchedule> = {};
  DAYS_OF_WEEK.forEach(day => {
    schedule[day.id] = {
      isWorking: day.id !== 0, // Sunday off by default
      startTime: "09:00",
      endTime: "17:00"
    };
  });
  return schedule;
};

const formatTimeToDisplay = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const formatScheduleToString = (schedule: Record<number, DaySchedule>): string => {
  const lines: string[] = [];
  DAYS_OF_WEEK.forEach(day => {
    const daySchedule = schedule[day.id];
    if (daySchedule?.isWorking) {
      const start = formatTimeToDisplay(daySchedule.startTime);
      const end = formatTimeToDisplay(daySchedule.endTime);
      lines.push(`${day.name}: ${start} - ${end}`);
    } else {
      lines.push(`${day.name}: Closed`);
    }
  });
  return lines.join("\n");
};

// Parse timing string back to schedule format
const parseTimingToSchedule = (timing: string | null): Record<number, DaySchedule> => {
  if (!timing) return getDefaultSchedule();
  
  const schedule = getDefaultSchedule();
  const lines = timing.split("\n");
  
  lines.forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const dayName = match[1];
      const timeStr = match[2].trim();
      const dayObj = DAYS_OF_WEEK.find(d => d.name === dayName);
      
      if (dayObj) {
        if (timeStr.toLowerCase() === "closed") {
          schedule[dayObj.id] = { isWorking: false, startTime: "09:00", endTime: "17:00" };
        } else {
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (timeMatch) {
            const startHour = parseInt(timeMatch[1]);
            const startMin = timeMatch[2];
            const startPeriod = timeMatch[3].toUpperCase();
            const endHour = parseInt(timeMatch[4]);
            const endMin = timeMatch[5];
            const endPeriod = timeMatch[6].toUpperCase();
            
            const start24 = startPeriod === "PM" && startHour !== 12 ? startHour + 12 : (startPeriod === "AM" && startHour === 12 ? 0 : startHour);
            const end24 = endPeriod === "PM" && endHour !== 12 ? endHour + 12 : (endPeriod === "AM" && endHour === 12 ? 0 : endHour);
            
            schedule[dayObj.id] = {
              isWorking: true,
              startTime: `${start24.toString().padStart(2, "0")}:${startMin}`,
              endTime: `${end24.toString().padStart(2, "0")}:${endMin}`
            };
          }
        }
      }
    }
  });
  
  return schedule;
};

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

// Clinic Schedule Editor Component
const ClinicScheduleEditor = ({
  schedule,
  onScheduleChange,
}: {
  schedule: Record<number, DaySchedule>;
  onScheduleChange: (schedule: Record<number, DaySchedule>) => void;
}) => {
  const updateDaySchedule = (dayId: number, updates: Partial<DaySchedule>) => {
    const newSchedule = {
      ...schedule,
      [dayId]: { ...schedule[dayId], ...updates }
    };
    onScheduleChange(newSchedule);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Weekly Working Hours</Label>
      <div className="space-y-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.id} className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
            <div className="w-24 font-medium">{day.name}</div>
            <div className="flex items-center gap-2">
              <Switch
                checked={schedule[day.id]?.isWorking ?? false}
                onCheckedChange={(checked) => updateDaySchedule(day.id, { isWorking: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {schedule[day.id]?.isWorking ? "Working" : "Closed"}
              </span>
            </div>
            {schedule[day.id]?.isWorking && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Start:</span>
                  <TimeSelect
                    value={schedule[day.id]?.startTime || "09:00"}
                    onValueChange={(value) => updateDaySchedule(day.id, { startTime: value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">End:</span>
                  <TimeSelect
                    value={schedule[day.id]?.endTime || "17:00"}
                    onValueChange={(value) => updateDaySchedule(day.id, { endTime: value })}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Clinic Form Card Component
const ClinicFormCard = ({
  clinic,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  clinic: ClinicFormData;
  index: number;
  onUpdate: (index: number, updates: Partial<ClinicFormData>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) => {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Clinic {index + 1}
          </CardTitle>
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Clinic Name *</Label>
            <Input
              value={clinic.clinic_name}
              onChange={(e) => onUpdate(index, { clinic_name: e.target.value })}
              placeholder="e.g., City Hospital"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Clinic Location</Label>
            <Input
              value={clinic.clinic_location}
              onChange={(e) => onUpdate(index, { clinic_location: e.target.value })}
              placeholder="e.g., Lahore, Gulberg III"
            />
          </div>
          <div className="space-y-2">
            <Label>Consultation Fee (Rs.)</Label>
            <Input
              type="number"
              value={clinic.fee}
              onChange={(e) => onUpdate(index, { fee: e.target.value })}
              placeholder="e.g., 2000"
            />
          </div>
        </div>
        <ClinicScheduleEditor
          schedule={clinic.schedule}
          onScheduleChange={(schedule) => onUpdate(index, { schedule })}
        />
      </CardContent>
    </Card>
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

interface SEODoctorClinic {
  id: string;
  doctor_id: string;
  clinic_name: string;
  clinic_location: string | null;
  timing: string | null;
  fee: number | null;
  display_order: number | null;
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

  // Edit state
  const [editingDoctor, setEditingDoctor] = useState<SEODoctor | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    pmdc_verified: false,
    specialization: "",
    qualification: "",
    experience_years: "",
    city: "",
    introduction: "",
  });
  const [editClinics, setEditClinics] = useState<ClinicFormData[]>([]);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

  // Delete state
  const [doctorToDelete, setDoctorToDelete] = useState<SEODoctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [addFormData, setAddFormData] = useState({
    full_name: "",
    pmdc_verified: false,
    specialization: "",
    qualification: "",
    experience_years: "",
    city: "",
    introduction: "",
  });

  const [clinics, setClinics] = useState<ClinicFormData[]>([
    {
      clinic_name: "",
      clinic_location: "",
      fee: "",
      schedule: getDefaultSchedule(),
    }
  ]);

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

  const fetchDoctorClinics = async (doctorId: string): Promise<SEODoctorClinic[]> => {
    try {
      const { data, error } = await supabase
        .from("seo_doctor_clinics")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching clinics:", error);
      return [];
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

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addClinic = () => {
    setClinics([
      ...clinics,
      {
        clinic_name: "",
        clinic_location: "",
        fee: "",
        schedule: getDefaultSchedule(),
      }
    ]);
  };

  const updateClinic = (index: number, updates: Partial<ClinicFormData>) => {
    const newClinics = [...clinics];
    newClinics[index] = { ...newClinics[index], ...updates };
    setClinics(newClinics);
  };

  const removeClinic = (index: number) => {
    if (clinics.length > 1) {
      setClinics(clinics.filter((_, i) => i !== index));
    }
  };

  // Edit clinics handlers
  const addEditClinic = () => {
    setEditClinics([
      ...editClinics,
      {
        clinic_name: "",
        clinic_location: "",
        fee: "",
        schedule: getDefaultSchedule(),
      }
    ]);
  };

  const updateEditClinic = (index: number, updates: Partial<ClinicFormData>) => {
    const newClinics = [...editClinics];
    newClinics[index] = { ...newClinics[index], ...updates };
    setEditClinics(newClinics);
  };

  const removeEditClinic = (index: number) => {
    if (editClinics.length > 1) {
      setEditClinics(editClinics.filter((_, i) => i !== index));
    }
  };

  const handleEdit = async (doctor: SEODoctor) => {
    setEditingDoctor(doctor);
    setEditFormData({
      full_name: doctor.full_name,
      pmdc_verified: doctor.pmdc_verified || false,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience_years: doctor.experience_years?.toString() || "",
      city: doctor.city || "",
      introduction: doctor.introduction || "",
    });
    setEditAvatarPreview(doctor.avatar_url);
    setEditAvatarFile(null);

    // Fetch clinics for this doctor
    const fetchedClinics = await fetchDoctorClinics(doctor.id);
    
    if (fetchedClinics.length > 0) {
      setEditClinics(fetchedClinics.map(c => ({
        id: c.id,
        clinic_name: c.clinic_name,
        clinic_location: c.clinic_location || "",
        fee: c.fee?.toString() || "",
        schedule: parseTimingToSchedule(c.timing),
      })));
    } else {
      // Fallback to legacy data
      setEditClinics([{
        clinic_name: doctor.clinic_name || "",
        clinic_location: doctor.clinic_location || "",
        fee: "",
        schedule: parseTimingToSchedule(doctor.timing),
      }]);
    }
  };

  const handleCancelEdit = () => {
    setEditingDoctor(null);
    setEditFormData({
      full_name: "",
      pmdc_verified: false,
      specialization: "",
      qualification: "",
      experience_years: "",
      city: "",
      introduction: "",
    });
    setEditClinics([]);
    setEditAvatarFile(null);
    setEditAvatarPreview(null);
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    if (!editClinics.some(c => c.clinic_name.trim())) {
      toast({
        title: "Error",
        description: "At least one clinic must have a name",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);

    try {
      let avatarUrl = editingDoctor.avatar_url;

      // Upload new avatar if provided
      if (editAvatarFile) {
        const fileExt = editAvatarFile.name.split('.').pop();
        const fileName = `seo-doctor-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("medical-documents")
          .upload(fileName, editAvatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("medical-documents")
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      // Get first clinic for legacy fields
      const primaryClinic = editClinics[0];

      // Update doctor listing
      const { error: doctorError } = await supabase
        .from("seo_doctor_listings")
        .update({
          full_name: editFormData.full_name,
          specialization: editFormData.specialization,
          qualification: editFormData.qualification,
          experience_years: editFormData.experience_years ? parseInt(editFormData.experience_years) : null,
          introduction: editFormData.introduction || null,
          avatar_url: avatarUrl,
          pmdc_verified: editFormData.pmdc_verified,
          clinic_name: primaryClinic.clinic_name || null,
          timing: formatScheduleToString(primaryClinic.schedule),
          clinic_location: primaryClinic.clinic_location || null,
          city: editFormData.city || null,
        })
        .eq("id", editingDoctor.id);

      if (doctorError) throw doctorError;

      // Delete existing clinics
      await supabase
        .from("seo_doctor_clinics")
        .delete()
        .eq("doctor_id", editingDoctor.id);

      // Insert updated clinics
      const clinicsToInsert = editClinics
        .filter(c => c.clinic_name.trim())
        .map((clinic, index) => ({
          doctor_id: editingDoctor.id,
          clinic_name: clinic.clinic_name,
          clinic_location: clinic.clinic_location || null,
          timing: formatScheduleToString(clinic.schedule),
          fee: clinic.fee ? parseFloat(clinic.fee) : null,
          map_query: clinic.clinic_location ? `${clinic.clinic_location}, ${editFormData.city}, Pakistan` : null,
          display_order: index,
        }));

      if (clinicsToInsert.length > 0) {
        const { error: clinicsError } = await supabase
          .from("seo_doctor_clinics")
          .insert(clinicsToInsert);

        if (clinicsError) throw clinicsError;
      }

      toast({ title: "Success", description: "Doctor listing updated successfully" });
      handleCancelEdit();
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

  const handleDelete = async () => {
    if (!doctorToDelete) return;

    setIsDeleting(true);

    try {
      // Delete clinics first
      await supabase
        .from("seo_doctor_clinics")
        .delete()
        .eq("doctor_id", doctorToDelete.id);

      // Delete doctor listing
      const { error } = await supabase
        .from("seo_doctor_listings")
        .delete()
        .eq("id", doctorToDelete.id);

      if (error) throw error;

      toast({ title: "Success", description: "Doctor listing deleted successfully" });
      setDoctorToDelete(null);
      fetchSeoDoctors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one clinic has a name
    if (!clinics.some(c => c.clinic_name.trim())) {
      toast({
        title: "Error",
        description: "At least one clinic must have a name",
        variant: "destructive",
      });
      return;
    }

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

      // Get first clinic for legacy fields
      const primaryClinic = clinics[0];

      // Insert doctor listing
      const { data: doctorData, error: doctorError } = await supabase
        .from("seo_doctor_listings")
        .insert({
          full_name: addFormData.full_name,
          specialization: addFormData.specialization,
          qualification: addFormData.qualification,
          experience_years: addFormData.experience_years ? parseInt(addFormData.experience_years) : null,
          introduction: addFormData.introduction || null,
          avatar_url: avatarUrl,
          pmdc_verified: addFormData.pmdc_verified,
          clinic_name: primaryClinic.clinic_name || null,
          timing: formatScheduleToString(primaryClinic.schedule),
          clinic_location: primaryClinic.clinic_location || null,
          city: addFormData.city || null,
          created_by: user.id,
          is_published: true,
        })
        .select()
        .single();

      if (doctorError) throw doctorError;

      // Insert clinics into seo_doctor_clinics table
      const clinicsToInsert = clinics
        .filter(c => c.clinic_name.trim())
        .map((clinic, index) => ({
          doctor_id: doctorData.id,
          clinic_name: clinic.clinic_name,
          clinic_location: clinic.clinic_location || null,
          timing: formatScheduleToString(clinic.schedule),
          fee: clinic.fee ? parseFloat(clinic.fee) : null,
          map_query: clinic.clinic_location ? `${clinic.clinic_location}, ${addFormData.city}, Pakistan` : null,
          display_order: index,
        }));

      if (clinicsToInsert.length > 0) {
        const { error: clinicsError } = await supabase
          .from("seo_doctor_clinics")
          .insert(clinicsToInsert);

        if (clinicsError) throw clinicsError;
      }

      toast({ title: "Success", description: "Doctor listing added successfully with clinics" });
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
      introduction: "",
    });
    setClinics([
      {
        clinic_name: "",
        clinic_location: "",
        fee: "",
        schedule: getDefaultSchedule(),
      }
    ]);
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
      <DeletingOverlay isVisible={isDeleting} message="Deleting doctor..." />
      
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
        {!showAddForm && !editingDoctor && (
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
                <CardDescription>Fill in the details to add a new doctor profile with multiple clinics</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setShowAddForm(false); resetAddForm(); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDoctor} className="space-y-6">
              {/* Doctor Info Section */}
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

              {/* Clinics Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Clinic Locations
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={addClinic} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Another Clinic
                  </Button>
                </div>
                <div className="space-y-4">
                  {clinics.map((clinic, index) => (
                    <ClinicFormCard
                      key={index}
                      clinic={clinic}
                      index={index}
                      onUpdate={updateClinic}
                      onRemove={removeClinic}
                      canRemove={clinics.length > 1}
                    />
                  ))}
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

      {/* Edit Doctor Form */}
      {editingDoctor && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Doctor Listing</CardTitle>
                <CardDescription>Update the details for {editingDoctor.full_name}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateDoctor} className="space-y-6">
              {/* Doctor Info Section */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit_full_name">Name *</Label>
                  <Input
                    id="edit_full_name"
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
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
                        id="edit_pmdc_yes"
                        checked={editFormData.pmdc_verified}
                        onCheckedChange={(checked) => setEditFormData({ ...editFormData, pmdc_verified: checked === true })}
                      />
                      <Label htmlFor="edit_pmdc_yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit_pmdc_no"
                        checked={!editFormData.pmdc_verified}
                        onCheckedChange={(checked) => setEditFormData({ ...editFormData, pmdc_verified: checked !== true })}
                      />
                      <Label htmlFor="edit_pmdc_no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </div>
                </div>

                {/* Type/Specialization */}
                <SpecializationSelect
                  value={editFormData.specialization}
                  onValueChange={(value) => setEditFormData({ ...editFormData, specialization: value })}
                  label="Type / Specialization *"
                />

                {/* Qualification */}
                <div className="space-y-2">
                  <Label htmlFor="edit_qualification">Qualification & Education *</Label>
                  <Input
                    id="edit_qualification"
                    value={editFormData.qualification}
                    onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                    placeholder="e.g., MBBS, FCPS"
                    required
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="edit_experience">Experience (Years)</Label>
                  <Input
                    id="edit_experience"
                    type="number"
                    value={editFormData.experience_years}
                    onChange={(e) => setEditFormData({ ...editFormData, experience_years: e.target.value })}
                    placeholder="e.g., 10"
                  />
                </div>

                {/* City */}
                <CitySelectDropdown
                  value={editFormData.city}
                  onValueChange={(value) => setEditFormData({ ...editFormData, city: value })}
                  label="City *"
                />

                {/* Profile Picture */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    {editAvatarPreview ? (
                      <img src={editAvatarPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover border" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleEditAvatarChange}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Introduction */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit_introduction">Introduction / Bio</Label>
                  <Textarea
                    id="edit_introduction"
                    value={editFormData.introduction}
                    onChange={(e) => setEditFormData({ ...editFormData, introduction: e.target.value })}
                    placeholder="Write a brief introduction about the doctor..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Clinics Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Clinic Locations
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={addEditClinic} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Another Clinic
                  </Button>
                </div>
                <div className="space-y-4">
                  {editClinics.map((clinic, index) => (
                    <ClinicFormCard
                      key={index}
                      clinic={clinic}
                      index={index}
                      onUpdate={updateEditClinic}
                      onRemove={removeEditClinic}
                      canRemove={editClinics.length > 1}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Doctor
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
            <TableSkeleton rows={5} columns={7} />
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
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(doc)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setDoctorToDelete(doc)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!doctorToDelete} onOpenChange={(open) => !open && setDoctorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{doctorToDelete?.full_name}</strong>? 
              This will permanently remove the doctor listing and all associated clinic data. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContentWriterDoctors;
