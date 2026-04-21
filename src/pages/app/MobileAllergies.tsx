import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { AlertCircle } from "lucide-react";

const MobileAllergies = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/allergies" : "/doctor/allergies";
  return <MobilePlaceholder title="Allergies" icon={AlertCircle} webPath={webPath} />;
};

export default MobileAllergies;
