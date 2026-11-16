import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Friendly "nothing here" block with a clear next step.
type Action = { label: string; onClick: () => void; variant?: "default" | "outline" };
export const EmptyState = ({ icon: Icon, title, text, actions = [], children }: { icon: LucideIcon; title: string; text?: string; actions?: Action[]; children?: ReactNode }) => (
  <div className="flex flex-col items-center px-4 py-10 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
    <p className="font-medium">{title}</p>
    {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
    {actions.length > 0 && (
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {actions.map((a) => <Button key={a.label} size="sm" variant={a.variant || "default"} onClick={a.onClick}>{a.label}</Button>)}
      </div>
    )}
    {children}
  </div>
);
export default EmptyState;
