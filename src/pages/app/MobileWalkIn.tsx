import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { ClipboardList } from "lucide-react";

const MobileWalkIn = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/walk-in" : "/doctor/walk-in";
  return <MobilePlaceholder title="Walk-in" icon={ClipboardList} webPath={webPath} />;
};

export default MobileWalkIn;
