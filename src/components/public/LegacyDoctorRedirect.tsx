import { Navigate, useLocation, useParams } from "react-router-dom";

// Old profile links /doctors/<city>/<specialty>/<name> and /doctors/<country>/<city>/<specialty>/<name>
// move to /doctors/<specialty>/<name>. (nginx answers these old links with a 301 for search engines.)
const LegacyDoctorRedirect = () => {
  const { specialty, doctorSlug } = useParams();
  const { search, hash } = useLocation();
  return <Navigate to={`/doctors/${specialty}/${doctorSlug}${search}${hash}`} replace />;
};

export default LegacyDoctorRedirect;
