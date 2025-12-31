import { Loader2 } from "lucide-react";

interface DeletingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const DeletingOverlay = ({ isVisible, message = "Deleting..." }: DeletingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 shadow-lg">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-semibold text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">Please wait, this may take a moment...</p>
      </div>
    </div>
  );
};

export default DeletingOverlay;
