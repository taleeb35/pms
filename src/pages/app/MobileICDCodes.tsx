import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Tag } from "lucide-react";

const MobileICDCodes = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/icd-codes" : "/doctor/icd-codes";
  return <MobilePlaceholder title="ICD Codes" icon={Tag} webPath={webPath} />;
};

export default MobileICDCodes;
