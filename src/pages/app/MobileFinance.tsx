import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Wallet } from "lucide-react";

const MobileFinance = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/finance" : "/doctor/finance";
  return (
    <MobilePlaceholder
      title="Finance"
      icon={Wallet}
      description="Native finance dashboard with revenue, expenses and payments is coming next."
      webPath={webPath}
    />
  );
};

export default MobileFinance;
