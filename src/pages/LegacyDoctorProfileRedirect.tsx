import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateDoctorProfileUrl, generateDoctorSlug } from "@/lib/slugUtils";

const LegacyDoctorProfileRedirect = () => {
  const navigate = useNavigate();
  const { specialty, doctorSlug } = useParams<{ specialty: string; doctorSlug: string }>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const redirectToCanonicalProfile = async () => {
      if (!specialty || !doctorSlug) {
        setFailed(true);
        return;
      }

      const tryMatch = async () => {
        const { data: seoDoctors } = await supabase
          .from("seo_doctor_listings")
          .select("full_name, specialization, city")
          .eq("is_published", true)
          .limit(10000);

        const matchedSeo = seoDoctors?.find((doctor) => {
          return (
            generateDoctorSlug(doctor.full_name || "") === doctorSlug &&
            generateDoctorSlug(doctor.specialization || "") === specialty
          );
        });

        if (matchedSeo?.city) {
          return generateDoctorProfileUrl(
            matchedSeo.city,
            matchedSeo.specialization,
            matchedSeo.full_name
          );
        }

        const { data: approvedDoctors } = await supabase
          .from("doctors")
          .select(`
            specialization,
            city,
            profiles!inner(full_name)
          `)
          .eq("approved", true)
          .limit(10000);

        const matchedApproved = approvedDoctors?.find((doctor) => {
          const profile = doctor.profiles as { full_name?: string } | null;
          return (
            generateDoctorSlug(profile?.full_name || "") === doctorSlug &&
            generateDoctorSlug(doctor.specialization || "") === specialty
          );
        });

        const profile = matchedApproved?.profiles as { full_name?: string } | null;
        if (matchedApproved?.city && profile?.full_name) {
          return generateDoctorProfileUrl(
            matchedApproved.city,
            matchedApproved.specialization,
            profile.full_name
          );
        }

        return null;
      };

      const canonicalUrl = await tryMatch();

      if (canonicalUrl) {
        navigate(canonicalUrl, { replace: true });
        return;
      }

      setFailed(true);
    };

    void redirectToCanonicalProfile();
  }, [doctorSlug, navigate, specialty]);

  if (failed) {
    navigate("/not-found", { replace: true });
  }

  return null;
};

export default LegacyDoctorProfileRedirect;