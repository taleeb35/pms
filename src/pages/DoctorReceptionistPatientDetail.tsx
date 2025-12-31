import { useParams, useNavigate } from "react-router-dom";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";
import TableSkeleton from "@/components/TableSkeleton";
import { useEffect } from "react";

const DoctorReceptionistPatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctorId, loading } = useDoctorReceptionistId();

  // For now, redirect to patient detail - the component can be expanded later
  useEffect(() => {
    if (!loading && doctorId && id) {
      // The PatientDetail component doesn't accept props, so we navigate there
      // RLS will handle access control
      navigate(`/doctor/patients/${id}`, { replace: true });
    }
  }, [loading, doctorId, id, navigate]);

  if (loading) {
    return <TableSkeleton columns={4} rows={5} />;
  }

  return <TableSkeleton columns={4} rows={5} />;
};

export default DoctorReceptionistPatientDetail;
