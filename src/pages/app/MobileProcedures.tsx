import MobileCatalogScreen from "@/components/mobile/MobileCatalogScreen";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Syringe } from "lucide-react";

const MobileProcedures = () => {
  const { id, role, loading } = useMobileRole();
  return (
    <MobileCatalogScreen
      title="Procedures"
      icon={Syringe}
      table="procedures"
      ownerColumn="doctor_id"
      ownerId={role === "doctor" ? id || null : null}
      loadingOwner={loading}
      titleField="name"
      searchFields={["name"]}
      trailingField="price"
      trailingFormat={(v) => `Rs ${Number(v).toLocaleString("en-PK")}`}
      orderBy="name"
      fields={[
        { key: "name", label: "Procedure Name", placeholder: "e.g. ECG", required: true },
        { key: "price", label: "Price (PKR)", placeholder: "0", type: "number", required: true },
      ]}
    />
  );
};

export default MobileProcedures;
