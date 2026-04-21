import MobileCatalogScreen from "@/components/mobile/MobileCatalogScreen";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Sparkles } from "lucide-react";

const MobileSpecializations = () => {
  const { id, role, loading } = useMobileRole();
  return (
    <MobileCatalogScreen
      title="Specializations"
      icon={Sparkles}
      table="specializations"
      ownerColumn="clinic_id"
      ownerId={role === "clinic" ? id || null : null}
      loadingOwner={loading}
      titleField="name"
      searchFields={["name"]}
      orderBy="name"
      fields={[
        { key: "name", label: "Specialization", placeholder: "e.g. Cardiologist", required: true },
      ]}
    />
  );
};

export default MobileSpecializations;
