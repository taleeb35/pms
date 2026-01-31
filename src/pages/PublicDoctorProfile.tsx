import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { slugToDisplayName, generateDoctorSlug, generateCitySlug, generateSpecialtySlug } from "@/lib/slugUtils";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorProfileHeader from "@/components/public/DoctorProfileHeader";
import DoctorClinicTabs, { ClinicInfo } from "@/components/public/DoctorClinicTabs";
import type { ScheduleDay } from "@/components/public/DoctorWeeklySchedule";
import RelatedDoctorCard from "@/components/public/RelatedDoctorCard";

interface DoctorData {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string;
  city: string;
  experience_years: number | null;
  introduction: string | null;
  avatar_url: string | null;
  clinic_name?: string | null;
  clinic_location?: string | null;
  timing?: string | null;
  pmdc_verified?: boolean | null;
  contact_number?: string | null;
  consultation_fee?: number | null;
  source: 'seo_listing' | 'approved_doctor';
}

interface RelatedDoctor {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string;
  city: string;
  experience_years: number | null;
  avatar_url: string | null;
}

const PublicDoctorProfile = () => {
  const { city, specialty, doctorSlug } = useParams<{
    city: string;
    specialty: string;
    doctorSlug: string;
  }>();

  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedDoctors, setRelatedDoctors] = useState<RelatedDoctor[]>([]);

  const cityDisplay = city ? slugToDisplayName(city) : "";
  const specialtyDisplay = specialty ? slugToDisplayName(specialty) : "";

  const [seoClinics, setSeoClinics] = useState<any[]>([]);
  const [approvedSchedule, setApprovedSchedule] = useState<ScheduleDay[] | null>(null);

  const formatTimeToDisplay = (time: string | null | undefined) => {
    if (!time) return undefined;
    // Accept "HH:mm" or "HH:mm:ss"
    const parts = time.split(":");
    const hh = Number(parts[0] || 0);
    const mm = Number(parts[1] || 0);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return time;
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = ((hh + 11) % 12) + 1;
    return `${hour12}:${String(mm).padStart(2, "0")} ${ampm}`;
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!city || !specialty || !doctorSlug) return;

      setLoading(true);
      setSeoClinics([]);
      setApprovedSchedule(null);

      // First try SEO listings
      const { data: seoData, error: seoError } = await supabase
        .from("seo_doctor_listings")
        .select("*")
        .eq("is_published", true);

      if (!seoError && seoData) {
        const matchedSeo = seoData.find(doc => {
          const docCitySlug = generateCitySlug(doc.city || "");
          const docSpecialtySlug = generateSpecialtySlug(doc.specialization || "");
          const docNameSlug = generateDoctorSlug(doc.full_name || "");
          return docCitySlug === city && docSpecialtySlug === specialty && docNameSlug === doctorSlug;
        });

        if (matchedSeo) {
          setDoctor({
            id: matchedSeo.id,
            full_name: matchedSeo.full_name,
            specialization: matchedSeo.specialization,
            qualification: matchedSeo.qualification,
            city: matchedSeo.city || "",
            experience_years: matchedSeo.experience_years,
            introduction: matchedSeo.introduction,
            avatar_url: matchedSeo.avatar_url,
            clinic_name: matchedSeo.clinic_name,
            clinic_location: matchedSeo.clinic_location,
            timing: matchedSeo.timing,
            pmdc_verified: matchedSeo.pmdc_verified,
            source: 'seo_listing'
          });
          
          // Fetch multiple clinics for SEO doctor
          const { data: clinicsData } = await supabase
            .from("seo_doctor_clinics")
            .select("*")
            .eq("doctor_id", matchedSeo.id)
            .order("display_order", { ascending: true });
          
          setSeoClinics(clinicsData ?? []);
          
          setLoading(false);
          fetchRelatedDoctors(matchedSeo.specialization, matchedSeo.city || "", matchedSeo.id);
          return;
        }
      }

      // Then try approved doctors
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          qualification,
          city,
          experience_years,
          introduction,
          consultation_fee,
          contact_number,
          profiles!inner(full_name, avatar_url)
        `)
        .eq("approved", true);

      if (!doctorError && doctorData) {
        const matchedDoctor = doctorData.find(doc => {
          const profile = doc.profiles as any;
          const docCitySlug = generateCitySlug(doc.city || "");
          const docSpecialtySlug = generateSpecialtySlug(doc.specialization || "");
          const docNameSlug = generateDoctorSlug(profile?.full_name || "");
          return docCitySlug === city && docSpecialtySlug === specialty && docNameSlug === doctorSlug;
        });

        if (matchedDoctor) {
          const profile = matchedDoctor.profiles as any;
          setDoctor({
            id: matchedDoctor.id,
            full_name: profile?.full_name || "",
            specialization: matchedDoctor.specialization,
            qualification: matchedDoctor.qualification,
            city: matchedDoctor.city || "",
            experience_years: matchedDoctor.experience_years,
            introduction: matchedDoctor.introduction,
            avatar_url: profile?.avatar_url,
            consultation_fee: matchedDoctor.consultation_fee,
            contact_number: matchedDoctor.contact_number,
            source: 'approved_doctor'
          });

          // Fetch weekly schedule for approved doctor
          const { data: scheduleRows, error: scheduleError } = await supabase
            .from("doctor_schedules")
            .select("day_of_week, is_available, start_time, end_time")
            .eq("doctor_id", matchedDoctor.id)
            .order("day_of_week", { ascending: true });

          if (!scheduleError) {
            const DAYS: Array<{ day: string; short: string }> = [
              { day: "Sunday", short: "Sun" },
              { day: "Monday", short: "Mon" },
              { day: "Tuesday", short: "Tue" },
              { day: "Wednesday", short: "Wed" },
              { day: "Thursday", short: "Thu" },
              { day: "Friday", short: "Fri" },
              { day: "Saturday", short: "Sat" },
            ];

            const fullSchedule: ScheduleDay[] = DAYS.map((meta, i) => {
              const row = scheduleRows?.find((r) => r.day_of_week === i);
              const isAvailable = row ? !!row.is_available : i !== 0; // Sunday off by default
              return {
                day: meta.day,
                dayShort: meta.short,
                isAvailable,
                startTime: isAvailable ? formatTimeToDisplay(row?.start_time ?? "09:00") : undefined,
                endTime: isAvailable ? formatTimeToDisplay(row?.end_time ?? "17:00") : undefined,
              };
            });

            setApprovedSchedule(fullSchedule);
          }

          fetchRelatedDoctors(matchedDoctor.specialization, matchedDoctor.city || "", matchedDoctor.id);
        }
      }

      setLoading(false);
    };

    const fetchRelatedDoctors = async (specialization: string, doctorCity: string, excludeId: string) => {
      // Fetch doctors with same specialization
      const { data: relatedSeoBySpec } = await supabase
        .from("seo_doctor_listings")
        .select("*")
        .eq("is_published", true)
        .eq("specialization", specialization)
        .neq("id", excludeId)
        .limit(4);

      // Fetch doctors from same city (different specialization)
      const { data: relatedSeoByCity } = await supabase
        .from("seo_doctor_listings")
        .select("*")
        .eq("is_published", true)
        .eq("city", doctorCity)
        .neq("specialization", specialization)
        .neq("id", excludeId)
        .limit(4);

      const { data: relatedApprovedBySpec } = await supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          qualification,
          city,
          experience_years,
          profiles!inner(full_name, avatar_url)
        `)
        .eq("approved", true)
        .eq("specialization", specialization)
        .neq("id", excludeId)
        .limit(4);

      const { data: relatedApprovedByCity } = await supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          qualification,
          city,
          experience_years,
          profiles!inner(full_name, avatar_url)
        `)
        .eq("approved", true)
        .eq("city", doctorCity)
        .neq("specialization", specialization)
        .neq("id", excludeId)
        .limit(4);

      const related: RelatedDoctor[] = [];
      const seenIds = new Set<string>();

      // Add SEO listings by specialization first
      if (relatedSeoBySpec) {
        relatedSeoBySpec.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            related.push({
              id: doc.id,
              full_name: doc.full_name,
              specialization: doc.specialization,
              qualification: doc.qualification,
              city: doc.city || "",
              experience_years: doc.experience_years,
              avatar_url: doc.avatar_url,
            });
          }
        });
      }

      // Add approved doctors by specialization
      if (relatedApprovedBySpec) {
        relatedApprovedBySpec.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            const profile = doc.profiles as any;
            related.push({
              id: doc.id,
              full_name: profile?.full_name || "",
              specialization: doc.specialization,
              qualification: doc.qualification,
              city: doc.city || "",
              experience_years: doc.experience_years,
              avatar_url: profile?.avatar_url,
            });
          }
        });
      }

      // Add SEO listings by city
      if (relatedSeoByCity) {
        relatedSeoByCity.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            related.push({
              id: doc.id,
              full_name: doc.full_name,
              specialization: doc.specialization,
              qualification: doc.qualification,
              city: doc.city || "",
              experience_years: doc.experience_years,
              avatar_url: doc.avatar_url,
            });
          }
        });
      }

      // Add approved doctors by city
      if (relatedApprovedByCity) {
        relatedApprovedByCity.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            const profile = doc.profiles as any;
            related.push({
              id: doc.id,
              full_name: profile?.full_name || "",
              specialization: doc.specialization,
              qualification: doc.qualification,
              city: doc.city || "",
              experience_years: doc.experience_years,
              avatar_url: profile?.avatar_url,
            });
          }
        });
      }

      setRelatedDoctors(related.slice(0, 8));
    };

    fetchDoctor();
  }, [city, specialty, doctorSlug]);

  // SEO Configuration
  const pageTitle = doctor 
    ? `${doctor.full_name} - ${doctor.specialization} in ${doctor.city} | Zonoir`
    : `${specialtyDisplay} in ${cityDisplay} | Zonoir`;
  
  const pageDescription = doctor
    ? `Book appointment with ${doctor.full_name}, ${doctor.qualification}. ${doctor.experience_years ? `${doctor.experience_years}+ years experience` : ''} ${doctor.specialization} in ${doctor.city}. ${doctor.clinic_name ? `Available at ${doctor.clinic_name}.` : ''}`
    : `Find the best ${specialtyDisplay} doctors in ${cityDisplay}, Pakistan.`;

  const canonicalUrl = `https://zonoir.com/doctors/${city}/${specialty}/${doctorSlug}`;

  const jsonLd = doctor ? {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": doctor.full_name,
    "description": doctor.introduction || pageDescription,
    "image": doctor.avatar_url || undefined,
    "medicalSpecialty": doctor.specialization,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": doctor.city,
      "addressCountry": "Pakistan",
      "streetAddress": doctor.clinic_location || undefined
    },
    "worksFor": doctor.clinic_name ? {
      "@type": "MedicalClinic",
      "name": doctor.clinic_name,
      "address": doctor.clinic_location
    } : undefined,
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "degree",
      "name": doctor.qualification
    }
  } : undefined;

  useSEO({
    title: pageTitle,
    description: pageDescription,
    keywords: doctor 
      ? `${doctor.full_name}, ${doctor.specialization}, ${doctor.city}, doctor in ${doctor.city}, best ${doctor.specialization} ${doctor.city}, book appointment ${doctor.city}`
      : `${specialtyDisplay}, ${cityDisplay}, doctors in Pakistan`,
    canonicalUrl,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogUrl: canonicalUrl,
    ogType: "profile",
    ogImage: doctor?.avatar_url || "https://zonoir.com/og-image.png",
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: doctor?.avatar_url || "https://zonoir.com/og-image.png",
    jsonLd
  });

  // Build clinic data for tabs
  const getClinics = (): ClinicInfo[] => {
    if (!doctor) return [];

    const normalize = (s?: string | null) => (s || "").trim().toLowerCase();
    
    // If we have SEO clinics from the seo_doctor_clinics table, use them
    const clinicsFromTable: ClinicInfo[] = seoClinics.map((clinic, index) => ({
        id: clinic.id || `clinic-${index}`,
        name: clinic.clinic_name || "Clinic",
        location: clinic.clinic_location || doctor.city,
        fee: clinic.fee,
        timing: clinic.timing,
        mapQuery: clinic.map_query || `${clinic.clinic_location || ""} ${doctor.city}, Pakistan`
      }));

    // Legacy single clinic data (kept for backward compatibility)
    const legacyClinic: ClinicInfo | null =
      doctor.clinic_name || doctor.clinic_location
        ? {
            id: "legacy-clinic",
            name: doctor.clinic_name || "Main Clinic",
            location: doctor.clinic_location || doctor.city,
            fee: doctor.consultation_fee,
            timing: doctor.timing,
            mapQuery: `${doctor.clinic_location || ""} ${doctor.city}, Pakistan`,
          }
        : null;

    // If we have clinic records + legacy clinic, merge them (avoid duplicates)
    if (clinicsFromTable.length > 0) {
      const merged = [...clinicsFromTable];
      if (
        legacyClinic &&
        !merged.some(
          (c) =>
            normalize(c.name) === normalize(legacyClinic.name) &&
            normalize(c.location) === normalize(legacyClinic.location),
        )
      ) {
        // Prefer showing the legacy clinic first (it's usually the primary one)
        merged.unshift(legacyClinic);
      }
      return merged;
    }
    
    // Fallback to legacy single clinic data
    const clinics: ClinicInfo[] = [];
    
    if (doctor.clinic_name || doctor.clinic_location) {
      clinics.push({
        id: "clinic-1",
        name: doctor.clinic_name || "Main Clinic",
        location: doctor.clinic_location || doctor.city,
        fee: doctor.consultation_fee,
        timing: doctor.timing,
        mapQuery: `${doctor.clinic_location || ""} ${doctor.city}, Pakistan`
      });
    } else {
      // Default clinic if no specific data
      clinics.push({
        id: "clinic-1",
        name: "Primary Practice",
        location: doctor.city,
        fee: doctor.consultation_fee,
        timing: doctor.timing,
        scheduleData: doctor.source === "approved_doctor" ? approvedSchedule ?? undefined : undefined,
        mapQuery: `${doctor.city}, Pakistan`
      });
    }
    
    return clinics;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-6 w-64" />
            <Card className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <Skeleton className="h-40 w-40 rounded-full mx-auto md:mx-0" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-6 w-48" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <Skeleton className="h-64 w-full" />
            </Card>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Doctor Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The doctor profile you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/find-doctors">Find Other Doctors</Link>
          </Button>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 overflow-x-auto pb-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors whitespace-nowrap">Home</Link>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          <Link to="/find-doctors" className="hover:text-primary transition-colors whitespace-nowrap">Find Doctors</Link>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          <Link to={`/doctors/${specialty}?city=${cityDisplay}`} className="hover:text-primary transition-colors whitespace-nowrap">
            {specialtyDisplay}s in {cityDisplay}
          </Link>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          <span className="text-foreground font-medium truncate">{doctor.full_name}</span>
        </nav>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header */}
          <DoctorProfileHeader doctor={doctor} />

          {/* Practice Address and Timings Section */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Practice Address and Timings
            </h2>
            <DoctorClinicTabs clinics={getClinics()} />
          </section>

          {/* Related Doctors Section */}
          {relatedDoctors.length > 0 && (
            <section className="mt-12 pt-8 border-t">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Similar Doctors You May Like
              </h2>
              <p className="text-muted-foreground mb-6">
                Other {doctor.specialization}s and specialists in {doctor.city}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedDoctors.map((related) => (
                  <RelatedDoctorCard key={related.id} doctor={related} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PublicDoctorProfile;
