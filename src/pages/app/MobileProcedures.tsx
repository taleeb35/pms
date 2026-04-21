import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { useMobileRole } from "@/hooks/useMobileRole";
import { Stethoscope } from "lucide-react";

const MobileProcedures = () => {
  const { role } = useMobileRole();
  const webPath = role === "clinic" ? "/clinic/procedures" : "/doctor/procedures";
  return <MobilePlaceholder title="Procedures" icon={Stethoscope} webPath={webPath} />;
};

export default MobileProcedures;
