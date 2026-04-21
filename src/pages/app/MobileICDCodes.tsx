import MobileCatalogScreen from "@/components/mobile/MobileCatalogScreen";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Hash } from "lucide-react";

const MobileICDCodes = () => {
  const { id, role, loading } = useMobileRole();
  const isClinic = role === "clinic";
  return (
    <MobileCatalogScreen
      title="ICD Codes"
      icon={Hash}
      table={isClinic ? "clinic_icd_codes" : "doctor_icd_codes"}
      ownerColumn={isClinic ? "clinic_id" : "doctor_id"}
      ownerId={id || null}
      loadingOwner={loading}
      titleField="code"
      subtitleField="description"
      searchFields={["code", "description"]}
      orderBy="code"
      fields={[
        { key: "code", label: "Code", placeholder: "e.g. I10", required: true },
        { key: "description", label: "Description", placeholder: "Hypertension", required: true },
      ]}
    />
  );
};

export default MobileICDCodes;
