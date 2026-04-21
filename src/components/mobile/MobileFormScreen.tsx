import { ReactNode } from "react";
import MobileScreen from "./MobileScreen";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MobileFormScreenProps {
  title: string;
  subtitle?: string;
  back?: boolean | string | (() => void);
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel?: () => void;
}

/**
 * Native-app form screen with sticky bottom save bar.
 * Use for create/edit flows instead of modal dialogs on mobile.
 */
const MobileFormScreen = ({
  title,
  subtitle,
  back = true,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading,
  onCancel,
}: MobileFormScreenProps) => {
  return (
    <MobileScreen title={title} subtitle={subtitle} back={back} noPadding>
      <form onSubmit={onSubmit} className="flex flex-col">
        <div className="px-4 py-4 space-y-4 pb-32">{children}</div>
        <div
          className="fixed left-0 right-0 bottom-0 bg-card border-t border-border z-40 px-4 py-3 flex gap-2"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          {onCancel && (
            <Button type="button" variant="outline" className="flex-1 h-11" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" className="flex-1 h-11 font-semibold" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
          </Button>
        </div>
      </form>
    </MobileScreen>
  );
};

export default MobileFormScreen;
