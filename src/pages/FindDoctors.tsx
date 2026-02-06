import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Stethoscope, Heart, Brain, Bone, Eye, Baby, Syringe, Pill, Activity, Smile, Wind, Droplets, Thermometer, Check, ChevronsUpDown, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { generateCitySlug, generateSpecialtySlug, generateDoctorSlug } from "@/lib/slugUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DoctorResult {
  id: string;
  full_name: string;
  specialization: string;
  city: string;
  avatar_url: string | null;
  source: 'seo' | 'registered';
}
const specialties = [
  {
    name: "Allergist",
    slug: "allergist",
    urdu: "ماہر الرجی",
    description: "Specialists who diagnose and treat allergies, asthma, and immune system disorders.",
    icon: Syringe,
  },
  {
    name: "Bariatric / Weight Loss Surgeon",
    slug: "bariatric-weight-loss-surgeon",
    urdu: "ماہر وزن میں کمی سرجری",
    description: "Surgeons who perform weight loss surgeries to help patients achieve healthy body weight.",
    icon: Activity,
  },
  {
    name: "Cancer Surgeon",
    slug: "cancer-surgeon",
    urdu: "ماہر سرطان سرجری",
    description: "Surgeons who specialize in removing tumors and cancerous tissues from the body.",
    icon: Syringe,
  },
  {
    name: "Cardiologist",
    slug: "cardiologist",
    urdu: "ماہر امراض قلب",
    description: "Specialists who diagnose and treat diseases and conditions of the heart and cardiovascular system.",
    icon: Heart,
  },
  {
    name: "Clinical Nutritionist",
    slug: "clinical-nutritionist",
    urdu: "ماہر غذائیت",
    description: "Experts who provide dietary guidance and nutrition therapy for health and disease management.",
    icon: Pill,
  },
  {
    name: "Dentist",
    slug: "dentist",
    urdu: "ماہر دندان",
    description: "Doctors who specialize in the diagnosis, prevention and treatment of diseases of the teeth and gums.",
    icon: Smile,
  },
  {
    name: "Dermatologist",
    slug: "dermatologist",
    urdu: "ماہر امراض جلد",
    description: "Specialists who treat skin problems, including acne, eczema, psoriasis, and other skin conditions.",
    icon: Droplets,
  },
  {
    name: "Endocrinologist",
    slug: "endocrinologist",
    urdu: "ماہر ہارمونز",
    description: "Specialists who treat disorders related to hormones and metabolism including diabetes and thyroid issues.",
    icon: Thermometer,
  },
  {
    name: "ENT Specialist",
    slug: "ent-specialist",
    urdu: "ماہر کان ناک گلا",
    description: "Specialists who diagnose and treat conditions related to the ear, nose, and throat.",
    icon: Wind,
  },
  {
    name: "Eye Surgeon",
    slug: "eye-surgeon",
    urdu: "ماہر آنکھوں کی سرجری",
    description: "Surgeons who perform surgical procedures to treat eye diseases and improve vision.",
    icon: Eye,
  },
  {
    name: "Gastroenterologist",
    slug: "gastroenterologist",
    urdu: "ماہر امراض معدہ",
    description: "Specialists who work in diagnosing and treating disorders related to the digestive system.",
    icon: Activity,
  },
  {
    name: "General Physician",
    slug: "general-physician",
    urdu: "جنرل فزیشن",
    description: "Medical doctors who specialize in the non-surgical treatment of all types of diseases and illnesses.",
    icon: Stethoscope,
  },
  {
    name: "General Surgeon",
    slug: "general-surgeon",
    urdu: "جنرل سرجن",
    description: "Surgeons who perform a wide variety of surgical procedures on the abdomen, skin, and soft tissues.",
    icon: Syringe,
  },
  {
    name: "Geriatrician",
    slug: "geriatrician",
    urdu: "ماہر امراض بزرگان",
    description: "Specialists who focus on healthcare for elderly patients and age-related conditions.",
    icon: Stethoscope,
  },
  {
    name: "Gynecologist",
    slug: "gynecologist",
    urdu: "ماہر امراض نسواں",
    description: "Specialists that treat women's reproductive issues, pregnancy care, and child birth.",
    icon: Baby,
  },
  {
    name: "Hematologist",
    slug: "hematologist",
    urdu: "ماہر امراض خون",
    description: "Specialists who diagnose and treat blood disorders including anemia and blood cancers.",
    icon: Droplets,
  },
  {
    name: "Infectious Disease Specialist",
    slug: "infectious-disease-specialist",
    urdu: "ماہر متعدی امراض",
    description: "Specialists who diagnose and treat infections caused by bacteria, viruses, and parasites.",
    icon: Pill,
  },
  {
    name: "Nephrologist",
    slug: "nephrologist",
    urdu: "ماہر امراض گردہ",
    description: "Specialists who diagnose and treat kidney diseases and help manage kidney function.",
    icon: Droplets,
  },
  {
    name: "Neurologist",
    slug: "neurologist",
    urdu: "ماہر اعصاب",
    description: "Specialists who diagnose and treat disorders of the nervous system including brain and spinal cord.",
    icon: Brain,
  },
  {
    name: "Neurosurgeon",
    slug: "neurosurgeon",
    urdu: "نیورو سرجن",
    description: "Surgeons who specialize in surgical treatment of disorders affecting the brain and spine.",
    icon: Brain,
  },
  {
    name: "Oncologist",
    slug: "oncologist",
    urdu: "ماہر سرطان",
    description: "Specialists who diagnose and treat cancer using chemotherapy, immunotherapy, and other treatments.",
    icon: Activity,
  },
  {
    name: "Ophthalmologist",
    slug: "ophthalmologist",
    urdu: "ماہر امراض چشم",
    description: "Medical doctors who specialize in eye and vision care, including surgeries and treatments.",
    icon: Eye,
  },
  {
    name: "Orthopedic Surgeon",
    slug: "orthopedic-surgeon",
    urdu: "ماہر ہڈیوں",
    description: "Surgeons qualified to diagnose and manage or treat all problems related to bones and joints.",
    icon: Bone,
  },
  {
    name: "Pain Management Specialist",
    slug: "pain-management-specialist",
    urdu: "ماہر درد",
    description: "Specialists who diagnose and treat chronic pain conditions using various treatment methods.",
    icon: Activity,
  },
  {
    name: "Pediatrician",
    slug: "pediatrician",
    urdu: "ماہر امراض اطفال",
    description: "Medical doctors who specialize in the health and medical care of infants, children, and adolescents.",
    icon: Baby,
  },
  {
    name: "Plastic Surgeon",
    slug: "plastic-surgeon",
    urdu: "پلاسٹک سرجن",
    description: "Surgeons who perform reconstructive and cosmetic procedures to restore form and function.",
    icon: Smile,
  },
  {
    name: "Psychiatrist",
    slug: "psychiatrist",
    urdu: "ماہر نفسیات",
    description: "Doctors with specialized training in the diagnosis and treatment methods of mental illnesses.",
    icon: Brain,
  },
  {
    name: "Psychologist",
    slug: "psychologist",
    urdu: "ماہر نفسیات",
    description: "Experts in studying the normal and abnormal mental states of a person and their behavior patterns.",
    icon: Brain,
  },
  {
    name: "Pulmonologist",
    slug: "pulmonologist",
    urdu: "ماہر امراض پھیپھڑے",
    description: "Specialists who focus on diseases and conditions of the lungs and respiratory system.",
    icon: Wind,
  },
  {
    name: "Radiologist",
    slug: "radiologist",
    urdu: "ماہر تابکاری",
    description: "Specialists who use medical imaging to diagnose and treat diseases within the body.",
    icon: Eye,
  },
  {
    name: "Rheumatologist",
    slug: "rheumatologist",
    urdu: "ماہر جوڑوں کے امراض",
    description: "Specialists who treat arthritis, autoimmune diseases, and musculoskeletal conditions.",
    icon: Bone,
  },
  {
    name: "Sports Medicine Specialist",
    slug: "sports-medicine-specialist",
    urdu: "ماہر کھیلوں کی طب",
    description: "Specialists who treat sports-related injuries and help athletes improve their performance.",
    icon: Bone,
  },
  {
    name: "Urologist",
    slug: "urologist",
    urdu: "ماہر امراض گردہ",
    description: "Specialists who diagnose, treat, and manage conditions that affect reproductive and bladder health.",
    icon: Droplets,
  },
  {
    name: "Vascular Surgeon",
    slug: "vascular-surgeon",
    urdu: "ماہر شریانوں کی سرجری",
    description: "Surgeons who treat diseases of the vascular system including arteries and veins.",
    icon: Heart,
  },
];

const cities = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Abbottabad",
];

const FindDoctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [doctorResults, setDoctorResults] = useState<DoctorResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Debounced doctor name search
  useEffect(() => {
    const searchDoctors = async () => {
      if (searchTerm.length < 2) {
        setDoctorResults([]);
        return;
      }

      // Check if searching for doctor name (not just specialty)
      const isSpecialtySearch = specialties.some(
        s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.urdu.includes(searchTerm)
      );
      
      // Only search doctors if it's not a clear specialty match or if term is 3+ chars
      if (searchTerm.length < 3 && isSpecialtySearch) {
        setDoctorResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results: DoctorResult[] = [];
        const seenIds = new Set<string>();

        // Search SEO listings
        const { data: seoData } = await supabase
          .from("seo_doctor_listings")
          .select("id, full_name, specialization, city, avatar_url")
          .eq("is_published", true)
          .ilike("full_name", `%${searchTerm}%`)
          .limit(5);

        if (seoData) {
          seoData.forEach(doc => {
            if (!seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              results.push({
                id: doc.id,
                full_name: doc.full_name,
                specialization: doc.specialization,
                city: doc.city || "",
                avatar_url: doc.avatar_url,
                source: 'seo'
              });
            }
          });
        }

        // Search approved doctors
        const { data: approvedData } = await supabase
          .from("doctors")
          .select("id, specialization, city, profiles!inner(full_name, avatar_url)")
          .eq("approved", true)
          .limit(5);

        if (approvedData) {
          approvedData.forEach(doc => {
            const profile = doc.profiles as any;
            if (profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) && !seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              results.push({
                id: doc.id,
                full_name: profile.full_name,
                specialization: doc.specialization,
                city: doc.city || "",
                avatar_url: profile.avatar_url,
                source: 'registered'
              });
            }
          });
        }

        setDoctorResults(results.slice(0, 5));
      } catch (error) {
        console.error("Error searching doctors:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchDoctors, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  useSEO({
    title: "Find Doctors in Pakistan | Best Specialists Near You - Zonoir",
    description: "Find the best doctors and specialists near you in Pakistan. Search by specialty, city, and get instant appointments with top-rated doctors.",
    keywords: "find doctors pakistan, best doctors near me, specialists pakistan, dermatologist, gynecologist, cardiologist",
    canonicalUrl: "https://zonoir.com/find-doctors",
    ogTitle: "Find Doctors in Pakistan | Best Specialists Near You",
    ogDescription: "Search and find the best doctors and specialists across Pakistan. Book appointments instantly.",
    ogUrl: "https://zonoir.com/find-doctors",
  });

  const filteredSpecialties = specialties.filter(
    (specialty) =>
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.urdu.includes(searchTerm)
  );

  const handleSpecialtyClick = (slug: string) => {
    const cityParam = selectedCity && selectedCity !== "all" ? `?city=${encodeURIComponent(selectedCity)}` : "";
    navigate(`/doctors/${slug}${cityParam}`);
  };

  const handleDoctorClick = (doctor: DoctorResult) => {
    const citySlug = generateCitySlug(doctor.city);
    const specialtySlug = generateSpecialtySlug(doctor.specialization);
    const doctorSlug = generateDoctorSlug(doctor.full_name);
    navigate(`/doctors/${citySlug}/${specialtySlug}/${doctorSlug}`);
  };

  const handleSearch = () => {
    if (selectedSpecialty) {
      const specialty = specialties.find(s => s.name === selectedSpecialty);
      if (specialty) {
        const cityParam = selectedCity && selectedCity !== "all" ? `?city=${encodeURIComponent(selectedCity)}` : "";
        navigate(`/doctors/${specialty.slug}${cityParam}`);
      }
    }
  };

  const selectedCityLabel = selectedCity === "all" ? "All Cities" : selectedCity || "Select City";
  const selectedSpecialtyLabel = selectedSpecialty || "All Specialties";

  // Filter specialties grid based on selected specialty
  const displayedSpecialties = selectedSpecialty 
    ? specialties.filter(s => s.name === selectedSpecialty)
    : filteredSpecialties;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Find the Best Doctor Near You
            </h1>
            <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              Search from thousands of verified doctors across Pakistan and book your appointment instantly
            </p>

            {/* Search Bar */}
            <div className="mx-auto" style={{ maxWidth: '90rem' }}>
              <div className="flex flex-col md:flex-row gap-3 bg-card rounded-xl shadow-lg p-4 border">
                {/* City Selector */}
                <div className="flex-1 flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={cityOpen}
                        className="w-full justify-between p-0 h-auto font-normal hover:bg-transparent"
                      >
                        {selectedCityLabel}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background z-50" align="start">
                      <Command>
                        <CommandInput placeholder="Search city..." className="h-9" />
                        <CommandList className="max-h-[200px] overflow-y-auto">
                          <CommandEmpty>No city found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="All Cities"
                              onSelect={() => {
                                setSelectedCity("all");
                                setCityOpen(false);
                              }}
                            >
                              All Cities
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedCity === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                            {cities.map((city) => (
                              <CommandItem
                                key={city}
                                value={city}
                                onSelect={() => {
                                  setSelectedCity(city);
                                  setCityOpen(false);
                                }}
                              >
                                {city}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedCity === city ? "opacity-100" : "opacity-0"
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

                {/* Specialty Selector */}
                <div className="flex-1 flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={specialtyOpen}
                        className="w-full justify-between p-0 h-auto font-normal hover:bg-transparent"
                      >
                        {selectedSpecialtyLabel}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background z-50" align="start">
                      <Command>
                        <CommandInput placeholder="Search specialty..." className="h-9" />
                        <CommandList className="max-h-[250px] overflow-y-auto">
                          <CommandEmpty>No specialty found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="All Specialties"
                              onSelect={() => {
                                setSelectedSpecialty("");
                                setSpecialtyOpen(false);
                              }}
                            >
                              All Specialties
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedSpecialty === "" ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                            {specialties.map((specialty) => (
                              <CommandItem
                                key={specialty.slug}
                                value={specialty.name}
                                onSelect={() => {
                                  setSelectedSpecialty(specialty.name);
                                  setSpecialtyOpen(false);
                                }}
                              >
                                <specialty.icon className="mr-2 h-4 w-4 text-primary" />
                                {specialty.name}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedSpecialty === specialty.name ? "opacity-100" : "opacity-0"
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

                {/* Search Input */}
                <div className="flex-[2] flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by Doctor Name (e.g., Dr. Ali)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                  />
                </div>

                <Button size="lg" className="whitespace-nowrap" onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Search Suggestions Dropdown */}
              {searchTerm && (filteredSpecialties.length > 0 || doctorResults.length > 0) && (
                <div className="bg-card border rounded-lg shadow-lg mt-2 max-h-80 overflow-y-auto">
                  {/* Doctor Results */}
                  {doctorResults.length > 0 && (
                    <div className="border-b last:border-b-0">
                      <div className="px-4 py-2 bg-muted/30">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Doctors</p>
                      </div>
                      {doctorResults.map((doctor) => (
                        <button
                          key={doctor.id}
                          onClick={() => handleDoctorClick(doctor)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={doctor.avatar_url || undefined} alt={doctor.full_name} />
                            <AvatarFallback className="bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doctor.full_name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {doctor.specialization} {doctor.city && `• ${doctor.city}`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Specialty Results */}
                  {filteredSpecialties.length > 0 && (
                    <div>
                      {doctorResults.length > 0 && (
                        <div className="px-4 py-2 bg-muted/30">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Specialties</p>
                        </div>
                      )}
                      {filteredSpecialties.slice(0, 5).map((specialty) => (
                        <button
                          key={specialty.slug}
                          onClick={() => handleSpecialtyClick(specialty.slug)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <specialty.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{specialty.name}</p>
                            <p className="text-sm text-muted-foreground">{specialty.urdu}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Loading state */}
                  {isSearching && doctorResults.length === 0 && (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      Searching doctors...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Specialties Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              How can we help you today?
            </h2>
            <p className="text-muted-foreground mb-8">
              Browse doctors by specialty
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSpecialties.map((specialty) => (
                <Link
                  key={specialty.slug}
                  to={`/doctors/${specialty.slug}${selectedCity && selectedCity !== "all" ? `?city=${encodeURIComponent(selectedCity)}` : ""}`}
                  className="group bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                      <specialty.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {specialty.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {specialty.description}
                      </p>
                      <span className="text-sm text-primary font-medium group-hover:underline">
                        Find Doctors →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default FindDoctors;
