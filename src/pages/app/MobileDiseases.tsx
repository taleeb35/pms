import MobileCatalogScreen from "@/components/mobile/MobileCatalogScreen";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Activity } from "lucide-react";

const MobileDiseases = () => {
  const { id, role, loading } = useMobileRole();
  const isClinic = role === "clinic";
  return (
    <MobileCatalogScreen
      title="Diseases"
      icon={Activity}
      table={isClinic ? "clinic_diseases" : "doctor_diseases"}
      ownerColumn={isClinic ? "clinic_id" : "doctor_id"}
      ownerId={id || null}
      loadingOwner={loading}
      titleField="name"
      searchFields={["name"]}
      orderBy="name"
      fields={[
        { key: "name", label: "Disease Name", placeholder: "e.g. Diabetes", required: true },
      ]}
    />
  );
};

export default MobileDiseases;
