import { ReactNode } from "react";
import { LucideIcon, Inbox } from "lucide-react";

interface MobileEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

const MobileEmptyState = ({ icon: Icon = Inbox, title, description, action }: MobileEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-20 w-20 rounded-3xl bg-muted/60 flex items-center justify-center mb-4">
        <Icon className="h-9 w-9 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default MobileEmptyState;
