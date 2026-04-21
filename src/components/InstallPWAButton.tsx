import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as any).MSStream;

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true);

interface Props {
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
}

const InstallPWAButton = ({ className, variant = "default", size = "lg", fullWidth }: Props) => {
  const { toast } = useToast();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(isStandalone());

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleClick = async () => {
    if (installed) {
      toast({ title: "Already installed", description: "Open Zonoir from your home screen." });
      return;
    }

    if (isIOS()) {
      toast({
        title: "Install on iPhone / iPad",
        description: "Tap the Share button in Safari, then choose 'Add to Home Screen'.",
        duration: 8000,
      });
      return;
    }

    if (!deferred) {
      toast({
        title: "Install from your browser menu",
        description:
          "Open your browser menu (⋮) and tap 'Install app' or 'Add to Home Screen'.",
        duration: 8000,
      });
      return;
    }

    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      toast({ title: "Installing…", description: "Zonoir will appear on your home screen." });
      setDeferred(null);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={`${fullWidth ? "w-full" : ""} gap-2 ${className ?? ""}`}
    >
      {installed ? <Check className="h-5 w-5" /> : <Download className="h-5 w-5" />}
      {installed ? "App Installed" : isIOS() ? "Add to Home Screen" : "Install Zonoir App"}
      <Smartphone className="h-4 w-4 opacity-70" />
    </Button>
  );
};

export default InstallPWAButton;
