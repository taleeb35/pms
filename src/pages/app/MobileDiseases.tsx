import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Pill } from "lucide-react";

const MobileDiseases = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/diseases" : "/doctor/diseases";
  return <MobilePlaceholder title="Diseases" icon={Pill} webPath={webPath} />;
};

export default MobileDiseases;
