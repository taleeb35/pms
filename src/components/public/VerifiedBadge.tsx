import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md";
  withLabel?: boolean;
}

/**
 * Blue verified tick shown on doctors that are registered & approved on the platform.
 */
const VerifiedBadge = ({ className, size = "sm", withLabel = false }: VerifiedBadgeProps) => {
  const dimension = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[#1d9bf0]",
        className
      )}
      title="Verified — Registered with Zonoir"
      aria-label="Verified doctor"
    >
      <CheckCircle2 className={cn(dimension, "fill-[#1d9bf0] text-white")} strokeWidth={2.5} />
      {withLabel && <span className="text-xs font-semibold">Verified</span>}
    </span>
  );
};

export default VerifiedBadge;
