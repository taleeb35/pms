import { LucideIcon, Construction } from "lucide-react";
import MobileScreen from "./MobileScreen";
import MobileEmptyState from "./MobileEmptyState";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MobilePlaceholderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  webPath?: string;
}

/**
 * Used while a native mobile screen is being built.
 * Offers a fallback to open the full web version inside the app.
 */
const MobilePlaceholder = ({
  title,
  description = "This screen is being built into a native mobile experience.",
  icon = Construction,
  webPath,
}: MobilePlaceholderProps) => {
  const navigate = useNavigate();
  return (
    <MobileScreen title={title}>
      <MobileEmptyState
        icon={icon}
        title="Coming up next"
        description={description}
        action={
          webPath ? (
            <Button onClick={() => navigate(webPath)}>Open full version</Button>
          ) : undefined
        }
      />
    </MobileScreen>
  );
};

export default MobilePlaceholder;
