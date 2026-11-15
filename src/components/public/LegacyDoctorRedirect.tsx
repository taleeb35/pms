import { Navigate, useLocation, useParams } from "react-router-dom";

// A7: old profile links /doctors/<city>/<specialty>/<name> move to
// /doctors/<country>/<city>/<specialty>/<name>. All existing listings are in Pakistan.
// (nginx also answers these old links with a 301 for search engines.)
const LegacyDoctorRedirect = () => {
  const { city, specialty, doctorSlug } = useParams();
  const { search, hash } = useLocation();
  return <Navigate to={`/doctors/pk/${city}/${specialty}/${doctorSlug}${search}${hash}`} replace />;
};

export default LegacyDoctorRedirect;
