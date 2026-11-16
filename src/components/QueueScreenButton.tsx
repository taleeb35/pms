import { MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";

// Opens the waiting-room queue screen in a new tab, ready to drag onto a TV or tablet.
export default function QueueScreenButton() {
  return (
    <Button variant="outline" className="gap-2" onClick={() => window.open("/queue", "_blank", "noopener")}>
      <MonitorPlay className="h-4 w-4" />
      Queue screen
    </Button>
  );
}
