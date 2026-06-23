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
import { generateDoctorProfileUrl } from "@/lib/slugUtils";
import VerifiedBadge from "@/components/public/VerifiedBadge";

const specialtyMap: Record<string, { name: string; urdu: string }> = {
  "aesthetic-physician": { name: "Aesthetic Physician", urdu: "ماہر جمالیات" },
  "allergist": { name: "Allergist", urdu: "ماہر الرجی" },
  "audiologist": { name: "Audiologist", urdu: "ماہر سماعت" },
  "bariatric-weight-loss-surgeon": { name: "Bariatric / Weight Loss Surgeon", urdu: "ماہر وزن میں کمی سرجری" },
  "cancer-surgeon": { name: "Cancer Surgeon", urdu: "ماہر سرطان سرجری" },
  "cardiologist": { name: "Cardiologist", urdu: "ماہر امراض قلب" },
  "chest-respiratory-specialist": { name: "Chest Respiratory Specialist", urdu: "ماہر امراض سینہ" },
  "clinical-nutritionist": { name: "Clinical Nutritionist", urdu: "ماہر غذائیت" },
  "dentist": { name: "Dentist", urdu: "ماہر دندان" },
  "dermatologist": { name: "Dermatologist", urdu: "ماہر امراض جلد" },
  "endocrinologist": { name: "Endocrinologist", urdu: "ماہر ہارمونز" },
  "ent-specialist": { name: "ENT Specialist", urdu: "ماہر کان ناک گلا" },
  "eye-surgeon": { name: "Eye Surgeon", urdu: "ماہر آنکھوں کی سرجری" },
  "family-medicine": { name: "Family Medicine", urdu: "ماہر خاندانی طب" },
  "gastroenterologist": { name: "Gastroenterologist", urdu: "ماہر امراض معدہ" },
  "general-physician": { name: "General Physician", urdu: "جنرل فزیشن" },
  "general-practitioner": { name: "General Practitioner", urdu: "جنرل پریکٹیشنر" },
  "general-surgeon": { name: "General Surgeon", urdu: "جنرل سرجن" },
  "geriatrician": { name: "Geriatrician", urdu: "ماہر امراض بزرگان" },
  "gynecologist": { name: "Gynecologist", urdu: "ماہر امراض نسواں" },
  "hematologist": { name: "Hematologist", urdu: "ماہر امراض خون" },
  "infectious-disease-specialist": { name: "Infectious Disease Specialist", urdu: "ماہر متعدی امراض" },
  "internal-medicine-specialist": { name: "Internal Medicine Specialist", urdu: "ماہر داخلی طب" },
  "interventional-cardiologist": { name: "Interventional Cardiologist", urdu: "ماہر مداخلتی امراض قلب" },
  "laparoscopic-surgeon": { name: "Laparoscopic Surgeon", urdu: "ماہر لیپروسکوپک سرجری" },
  "liver-specialist": { name: "Liver Specialist", urdu: "ماہر جگر" },
  "medical-specialist": { name: "Medical Specialist", urdu: "میڈیکل ماہر" },
  "nephrologist": { name: "Nephrologist", urdu: "ماہر امراض گردہ" },
  "neurologist": { name: "Neurologist", urdu: "ماہر اعصاب" },
  "neurosurgeon": { name: "Neurosurgeon", urdu: "نیورو سرجن" },
  "nutritionist": { name: "Nutritionist", urdu: "ماہر غذائیت" },
  "oncologist": { name: "Oncologist", urdu: "ماہر سرطان" },
  "ophthalmologist": { name: "Ophthalmologist", urdu: "ماہر امراض چشم" },
  "optometrist": { name: "Optometrist", urdu: "ماہر بصارت" },
  "oral-and-maxillofacial-surgeon": { name: "Oral and Maxillofacial Surgeon", urdu: "ماہر زبانی و چہرے کی سرجری" },
  "orthopedic-surgeon": { name: "Orthopedic Surgeon", urdu: "ماہر ہڈیوں" },
  "pain-management-specialist": { name: "Pain Management Specialist", urdu: "ماہر درد" },
  "pediatric-surgeon": { name: "Pediatric Surgeon", urdu: "ماہر اطفال سرجری" },
  "pediatrician": { name: "Pediatrician", urdu: "ماہر امراض اطفال" },
  "physiotherapist": { name: "Physiotherapist", urdu: "فزیو تھراپسٹ" },
  "plastic-surgeon": { name: "Plastic Surgeon", urdu: "پلاسٹک سرجن" },
  "psychiatrist": { name: "Psychiatrist", urdu: "ماہر نفسیات" },
  "psychologist": { name: "Psychologist", urdu: "ماہر نفسیات" },
  "pulmonologist": { name: "Pulmonologist", urdu: "ماہر امراض پھیپھڑے" },
  "radiologist": { name: "Radiologist", urdu: "ماہر تابکاری" },
  "rheumatologist": { name: "Rheumatologist", urdu: "ماہر جوڑوں کے امراض" },
  "speech-therapist": { name: "Speech Therapist", urdu: "ماہر گفتار" },
  "sports-medicine-specialist": { name: "Sports Medicine Specialist", urdu: "ماہر کھیلوں کی طب" },
  "urologist": { name: "Urologist", urdu: "ماہر امراض گردہ" },
  "vascular-surgeon": { name: "Vascular Surgeon", urdu: "ماہر شریانوں کی سرجری" },
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

  const pageUrl = `https://zonoir.com/doctors/${specialty}${cityQuery}`;

  const faqItems = [
    {
      q: `How do I find the best ${displayName} in ${locationLabel}?`,
      a: `Browse our verified list of ${displayName}s practicing in ${locationLabel}. Each profile shows qualifications, experience, clinic location, and consultation fees so you can choose the right specialist.`,
    },
    {
      q: `How can I book an appointment with a ${displayName}?`,
      a: `Click the doctor's profile to view their full schedule and book an appointment online. Many ${displayName}s on Zonoir also offer same-day and next-day appointment slots.`,
    },
    {
      q: `What does a ${displayName} typically treat?`,
      a: `A ${displayName} specialises in conditions and treatments related to their field. Read each doctor's introduction and qualifications on their profile to confirm they handle your specific concern.`,
    },
    {
      q: `Are these ${displayName}s verified?`,
      a: `Doctors marked with a verification badge have been onboarded through Zonoir's clinic management platform and their credentials reviewed by our team.`,
    },
  ];

  useSEO({
    title: `Best ${displayName}s in ${locationLabel} | Zonoir`,
    description: `Find the best ${displayName}s in ${locationLabel}. Book appointments with top-rated ${displayName}s, read reviews, and get quality healthcare.`,
    keywords: `${displayName} ${locationLabel}, best ${displayName} in ${locationLabel}, ${displayName} appointment ${locationLabel}, ${displayName} consultation`,
    canonicalUrl: pageUrl,
    ogTitle: `Best ${displayName}s in ${locationLabel} | Zonoir`,
    ogDescription: `Search and find the best ${displayName}s in ${locationLabel}. Book appointments instantly.`,
    ogUrl: pageUrl,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `Best ${displayName}s in ${locationLabel}`,
        description: `Directory of ${displayName}s practicing in ${locationLabel}, Pakistan.`,
        url: pageUrl,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
    breadcrumbs: [
      { name: "Home", url: "https://zonoir.com/" },
      { name: "Find Doctors", url: "https://zonoir.com/find-doctors" },
      { name: `${displayName}s in ${locationLabel}`, url: pageUrl },
    ],
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
        .eq("is_published", true)
        .limit(10000);

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
            {/* Intro copy for SEO and patient context */}
            <div className="prose prose-sm max-w-3xl mb-6 text-muted-foreground">
              <p>
                Looking for the best <strong>{displayName}</strong> in {locationLabel}? Zonoir lists verified {displayName}s
                practising across {locationLabel}, with full qualifications, years of experience, clinic location and
                consultation fee on each profile. Compare specialists, read their introductions and book an appointment
                online in minutes — no phone tag, no waiting in queues.
              </p>
              <p>
                Every {displayName} listed has been reviewed by our team, and many are active users of Zonoir's clinic
                management platform — which means their schedules and availability stay up to date in real time. Use the
                filters above to narrow your search by city or doctor name.
              </p>
            </div>

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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.map((doctor) => {
                  const profileUrl = doctor.city 
                    ? generateDoctorProfileUrl(doctor.city, doctor.specialization, doctor.full_name)
                    : null;

                  return (
                    <div
                      key={doctor.id}
                      className="bg-card border rounded-xl p-5 hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={doctor.avatar_url || undefined} />
                          <AvatarFallback className="text-lg bg-primary/10 text-primary">
                            {doctor.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate inline-flex items-center gap-1">
                            <span className="truncate">{doctor.full_name}</span>
                            {doctor.source === "system" && <VerifiedBadge size="sm" />}
                          </h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {doctor.specialization}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                        {doctor.experience_years && doctor.experience_years > 0 && (
                          <span>{doctor.experience_years} years exp</span>
                        )}
                        {doctor.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {doctor.city}
                          </span>
                        )}
                      </div>

                      {doctor.introduction && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {doctor.introduction}
                        </p>
                      )}

                      {profileUrl ? (
                        <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
                          <Link to={profileUrl}>View Profile</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full mt-auto" disabled>
                          View Profile
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 md:py-14 bg-muted/30 border-t">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Frequently asked questions about {displayName}s in {locationLabel}
            </h2>
            <div className="space-y-5">
              {faqItems.map((f, i) => (
                <div key={i} className="bg-card border rounded-lg p-5">
                  <h3 className="font-semibold text-base mb-2">{f.q}</h3>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>


      <PublicFooter />
    </div>
  );
};

export default DoctorsBySpecialty;
