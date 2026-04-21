import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Activity } from "lucide-react";

const MobileActivityLogs = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/activity-logs" : "/doctor/activity-logs";
  return <MobilePlaceholder title="Activity Logs" icon={Activity} webPath={webPath} />;
};

export default MobileActivityLogs;
