import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileFABProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Floating Action Button — sits above the bottom tab bar.
 * Always elevated and easily reachable with the thumb.
 */
const MobileFAB = ({ onClick, icon, label, className, ariaLabel = "Add" }: MobileFABProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-transform",
        label ? "px-5" : "w-14",
        className
      )}
    >
      {icon ?? <Plus className="h-6 w-6" />}
      {label && <span className="font-semibold text-sm">{label}</span>}
    </button>
  );
};

export default MobileFAB;
