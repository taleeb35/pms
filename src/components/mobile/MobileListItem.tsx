import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileListItemProps {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

/**
 * iOS/Material-style list row. Tappable, with active feedback.
 */
const MobileListItem = ({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  showChevron = true,
  className,
}: MobileListItemProps) => {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-3 bg-card border-b border-border last:border-b-0",
        interactive && "active:bg-muted/60 cursor-pointer transition-colors",
        className
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</div>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
      {!trailing && interactive && showChevron && (
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
    </div>
  );
};

export default MobileListItem;
