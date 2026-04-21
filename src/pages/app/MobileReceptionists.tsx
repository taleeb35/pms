import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { UserCog } from "lucide-react";

const MobileReceptionists = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/receptionists" : "/doctor/receptionists";
  return <MobilePlaceholder title="Receptionists" icon={UserCog} webPath={webPath} />;
};

export default MobileReceptionists;
