import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Search, MapPin, ArrowLeft, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import PublicCityCombobox from "@/components/PublicCityCombobox";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

const specialtyMap: Record<string, { name: string; urdu: string }> = {
  "dermatologist": { name: "Dermatologist", urdu: "ماہر امراض جلد" },
  "gynecologist": { name: "Gynecologist", urdu: "ماہر امراض نسواں" },
  "urologist": { name: "Urologist", urdu: "ماہر امراض گردہ" },
  "gastroenterologist": { name: "Gastroenterologist", urdu: "ماہر امراض معدہ" },
  "general-physician": { name: "General Physician", urdu: "جنرل فزیشن" },
  "psychiatrist": { name: "Psychiatrist", urdu: "ماہر نفسیات" },
  "psychologist": { name: "Psychologist", urdu: "ماہر نفسیات" },
  "orthopedic-surgeon": { name: "Orthopedic Surgeon", urdu: "ماہر ہڈیوں" },
  "dentist": { name: "Dentist", urdu: "ماہر دندان" },
  "cardiologist": { name: "Cardiologist", urdu: "ماہر امراض قلب" },
  "neurologist": { name: "Neurologist", urdu: "ماہر اعصاب" },
  "ophthalmologist": { name: "Ophthalmologist", urdu: "ماہر امراض چشم" },
  "ent-specialist": { name: "ENT Specialist", urdu: "ماہر کان ناک گلا" },
  "pediatrician": { name: "Pediatrician", urdu: "ماہر امراض اطفال" },
  "endocrinologist": { name: "Endocrinologist", urdu: "ماہر ہارمونز" },
  "pulmonologist": { name: "Pulmonologist", urdu: "ماہر امراض پھیپھڑے" },
};

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

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string;
  experience_years: number | null;
  city: string | null;
  introduction: string | null;
  avatar_url: string | null;
  source?: 'system' | 'seo';
}

const DoctorsBySpecialty = () => {
  const { specialty } = useParams<{ specialty: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");

  const specialtyInfo = specialty ? specialtyMap[specialty] : null;
  const displayName = specialtyInfo?.name || specialty?.replace(/-/g, " ") || "Doctors";
  const locationLabel = selectedCity && selectedCity !== "all" ? selectedCity : "Pakistan";
  const cityQuery =
    selectedCity && selectedCity !== "all"
      ? `?city=${encodeURIComponent(selectedCity)}`
      : "";

  useSEO({
    title: `Best ${displayName}s in ${locationLabel} | Zonoir`,
    description: `Find the best ${displayName}s in ${locationLabel}. Book appointments with top-rated ${displayName}s, read reviews, and get quality healthcare.`,
    keywords: `${displayName} ${locationLabel}, best ${displayName} in ${locationLabel}, ${displayName} appointment ${locationLabel}, ${displayName} consultation`,
    canonicalUrl: `https://zonoir.com/doctors/${specialty}${cityQuery}`,
    ogTitle: `Best ${displayName}s in ${locationLabel}`,
    ogDescription: `Search and find the best ${displayName}s in ${locationLabel}. Book appointments instantly.`,
    ogUrl: `https://zonoir.com/doctors/${specialty}${cityQuery}`,
  });

  useEffect(() => {
    fetchDoctors();
  }, [specialty, selectedCity]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Fetch from SEO doctor listings
      let seoQuery = supabase
        .from("seo_doctor_listings")
        .select("*")
        .eq("is_published", true);

      if (specialty) {
        const searchTerm = specialtyInfo?.name || specialty.replace(/-/g, " ");
        seoQuery = seoQuery.ilike("specialization", `%${searchTerm}%`);
      }

      if (selectedCity && selectedCity !== "all") {
        seoQuery = seoQuery.ilike("city", `%${selectedCity}%`);
      }

      // Fetch from actual system doctors
      let systemQuery = supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          qualification,
          experience_years,
          city,
          introduction,
          profiles!inner(full_name, avatar_url)
        `)
        .eq("approved", true);

      if (specialty) {
        const searchTerm = specialtyInfo?.name || specialty.replace(/-/g, " ");
        systemQuery = systemQuery.ilike("specialization", `%${searchTerm}%`);
      }

      if (selectedCity && selectedCity !== "all") {
        systemQuery = systemQuery.ilike("city", `%${selectedCity}%`);
      }

      // Execute both queries in parallel
      const [seoResult, systemResult] = await Promise.all([
        seoQuery,
        systemQuery
      ]);

      // Map SEO listings to doctor format
      const seoDoctors: Doctor[] = (seoResult.data || []).map((doc) => ({
        id: doc.id,
        full_name: doc.full_name,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience_years: doc.experience_years,
        city: doc.city,
        introduction: doc.introduction,
        avatar_url: doc.avatar_url,
        source: 'seo' as const,
      }));

      // Map system doctors to doctor format
      const systemDoctors: Doctor[] = (systemResult.data || []).map((doc: any) => ({
        id: doc.id,
        full_name: doc.profiles?.full_name || 'Unknown',
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience_years: doc.experience_years,
        city: doc.city,
        introduction: doc.introduction,
        avatar_url: doc.profiles?.avatar_url,
        source: 'system' as const,
      }));

      // Combine both sources
      const allDoctors = [...systemDoctors, ...seoDoctors];
      setDoctors(allDoctors);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city && city !== "all") {
      setSearchParams({ city });
    } else {
      setSearchParams({});
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Link
              to="/find-doctors"
              className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Specialties
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Best {displayName}s in {locationLabel}
            </h1>
            {specialtyInfo && (
              <p className="text-muted-foreground text-lg mb-6">
                {specialtyInfo.urdu}
              </p>
            )}

            {/* Filter Bar - Matching FindDoctors Design */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-3 bg-card rounded-xl shadow-lg p-4 border">
                <div className="flex-1 flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <PublicCityCombobox
                    value={selectedCity}
                    onValueChange={handleCityChange}
                    cities={cities}
                    includeAllOption
                    placeholder="Select city"
                    searchPlaceholder="Search city..."
                    className="flex-1"
                    triggerClassName="border-0 shadow-none h-auto p-0 font-normal hover:bg-transparent"
                  />
                </div>

                <div className="flex-1 flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Doctors List */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground mb-6">
              {loading ? "Loading..." : `${filteredDoctors.length} ${displayName}(s) found`}
            </p>

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card border rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-20 h-20 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-16">
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Doctors Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any {displayName}s matching your criteria.
                </p>
                <Button asChild>
                  <Link to="/find-doctors">Browse All Specialties</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={doctor.avatar_url || undefined} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {doctor.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {doctor.full_name}
                          </h3>
                          <Badge variant="secondary">{doctor.specialization}</Badge>
                        </div>


                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          {doctor.experience_years && doctor.experience_years > 0 && (
                            <span>{doctor.experience_years} years experience</span>
                          )}
                          {doctor.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {doctor.city}
                            </span>
                          )}
                        </div>

                        {doctor.introduction && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doctor.introduction}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default DoctorsBySpecialty;
