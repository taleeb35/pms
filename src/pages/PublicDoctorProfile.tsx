import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { slugToDisplayName, generateDoctorSlug, generateCitySlug, generateSpecialtySlug } from "@/lib/slugUtils";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Award, 
  Clock, 
  Building2, 
  GraduationCap, 
  Stethoscope,
  CheckCircle,
  ChevronRight,
  Phone,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const PublicDoctorProfile = () => {
  const { city, specialty, doctorSlug } = useParams<{
    city: string;
    specialty: string;
    doctorSlug: string;
  }>();

  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedDoctors, setRelatedDoctors] = useState<DoctorData[]>([]);

  // Format display values
  const cityDisplay = city ? slugToDisplayName(city) : "";
  const specialtyDisplay = specialty ? slugToDisplayName(specialty) : "";

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!city || !specialty || !doctorSlug) return;

      setLoading(true);

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
          fetchRelatedDoctors(matchedDoctor.specialization, matchedDoctor.city || "", matchedDoctor.id);
        }
      }

      setLoading(false);
    };

    const fetchRelatedDoctors = async (specialization: string, doctorCity: string, excludeId: string) => {
      // Fetch related doctors from same specialty
      const { data: relatedSeo } = await supabase
        .from("seo_doctor_listings")
        .select("*")
        .eq("is_published", true)
        .eq("specialization", specialization)
        .neq("id", excludeId)
        .limit(4);

      const { data: relatedApproved } = await supabase
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

      const related: DoctorData[] = [];

      if (relatedSeo) {
        related.push(...relatedSeo.map(doc => ({
          id: doc.id,
          full_name: doc.full_name,
          specialization: doc.specialization,
          qualification: doc.qualification,
          city: doc.city || "",
          experience_years: doc.experience_years,
          introduction: null,
          avatar_url: doc.avatar_url,
          source: 'seo_listing' as const
        })));
      }

      if (relatedApproved) {
        related.push(...relatedApproved.map(doc => {
          const profile = doc.profiles as any;
          return {
            id: doc.id,
            full_name: profile?.full_name || "",
            specialization: doc.specialization,
            qualification: doc.qualification,
            city: doc.city || "",
            experience_years: doc.experience_years,
            introduction: null,
            avatar_url: profile?.avatar_url,
            source: 'approved_doctor' as const
          };
        }));
      }

      setRelatedDoctors(related.slice(0, 4));
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
    canonicalUrl,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogUrl: canonicalUrl,
    ogType: "profile",
    jsonLd
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <Skeleton className="h-48 w-48 rounded-full" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
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
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/find-doctors" className="hover:text-primary transition-colors">Find Doctors</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/doctors/${specialty}?city=${cityDisplay}`} className="hover:text-primary transition-colors">
            {specialtyDisplay}s in {cityDisplay}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{doctor.full_name}</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Main Profile Card */}
          <Card className="border-primary/20 shadow-lg mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-40 w-40 border-4 border-primary/20">
                    <AvatarImage src={doctor.avatar_url || undefined} alt={doctor.full_name} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {getInitials(doctor.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {doctor.pmdc_verified && (
                    <Badge className="mt-4 bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      PMDC Verified
                    </Badge>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{doctor.full_name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-sm">
                      <Stethoscope className="h-4 w-4 mr-1" />
                      {doctor.specialization}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <span>{doctor.qualification}</span>
                    </div>

                    {doctor.experience_years && (
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span>{doctor.experience_years}+ years of experience</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{doctor.clinic_location || doctor.city}</span>
                    </div>

                    {doctor.clinic_name && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span>{doctor.clinic_name}</span>
                      </div>
                    )}

                    {doctor.timing && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>{doctor.timing}</span>
                      </div>
                    )}

                    {doctor.consultation_fee && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span>Consultation Fee: Rs. {doctor.consultation_fee}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Button */}
                  {doctor.contact_number && (
                    <div className="mt-6">
                      <Button asChild className="w-full md:w-auto">
                        <a href={`tel:${doctor.contact_number}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call for Appointment
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Introduction/About Section */}
              {doctor.introduction && (
                <div className="mt-8 pt-8 border-t">
                  <h2 className="text-xl font-semibold text-foreground mb-4">About {doctor.full_name}</h2>
                  <p className="text-muted-foreground leading-relaxed">{doctor.introduction}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Doctors Section */}
          {relatedDoctors.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Other {doctor.specialization}s You May Like
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedDoctors.map((related) => (
                  <Link
                    key={related.id}
                    to={`/doctors/${generateCitySlug(related.city)}/${generateSpecialtySlug(related.specialization)}/${generateDoctorSlug(related.full_name)}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={related.avatar_url || undefined} alt={related.full_name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(related.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground">{related.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{related.qualification}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{related.city}</span>
                              {related.experience_years && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {related.experience_years}+ years
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
