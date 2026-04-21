import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { User } from "lucide-react";

const MobileProfile = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/profile" : "/doctor/profile";
  return <MobilePlaceholder title="Profile" icon={User} webPath={webPath} />;
};

export default MobileProfile;
