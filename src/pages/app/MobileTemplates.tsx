import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { FileText } from "lucide-react";

const MobileTemplates = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/templates" : "/doctor/templates";
  return <MobilePlaceholder title="Templates" icon={FileText} webPath={webPath} />;
};

export default MobileTemplates;
