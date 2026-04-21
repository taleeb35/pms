import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { HelpCircle } from "lucide-react";

const MobileSupport = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/support" : "/doctor/support";
  return <MobilePlaceholder title="Support" icon={HelpCircle} webPath={webPath} />;
};

export default MobileSupport;
