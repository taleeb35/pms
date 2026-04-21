import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { CreditCard } from "lucide-react";

const MobileSubscription = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/subscription" : "/doctor/subscription";
  return <MobilePlaceholder title="Subscription" icon={CreditCard} webPath={webPath} />;
};

export default MobileSubscription;
