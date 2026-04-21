import MobileCatalogScreen from "@/components/mobile/MobileCatalogScreen";
import { useMobileRole } from "@/hooks/useMobileRole";
import { AlertTriangle } from "lucide-react";

const MobileAllergies = () => {
  const { id, role, loading } = useMobileRole();
  const isClinic = role === "clinic";
  return (
    <MobileCatalogScreen
      title="Allergies"
      icon={AlertTriangle}
      table={isClinic ? "clinic_allergies" : "doctor_allergies"}
      ownerColumn={isClinic ? "clinic_id" : "doctor_id"}
      ownerId={id || null}
      loadingOwner={loading}
      titleField="name"
      searchFields={["name"]}
      orderBy="name"
      fields={[
        { key: "name", label: "Allergy Name", placeholder: "e.g. Penicillin", required: true },
      ]}
    />
  );
};

export default MobileAllergies;
