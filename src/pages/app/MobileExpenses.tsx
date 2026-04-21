import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";
import { Receipt } from "lucide-react";

const MobileExpenses = () => (
  <MobilePlaceholder title="Expenses" icon={Receipt} webPath="/clinic/expenses" />
);

export default MobileExpenses;
