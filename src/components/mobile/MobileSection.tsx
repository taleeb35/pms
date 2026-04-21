import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileSectionProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Renders children inside a rounded card (default true) */
  card?: boolean;
}

const MobileSection = ({ title, action, children, className, card = true }: MobileSectionProps) => {
  return (
    <section className={cn("mb-5", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-2 px-1">
          {title && (
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {card ? (
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

export default MobileSection;
