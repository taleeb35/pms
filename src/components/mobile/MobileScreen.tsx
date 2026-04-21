import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface MobileScreenProps {
  title: string;
  subtitle?: string;
  back?: boolean | string; // true = navigate(-1); string = path
  rightAction?: ReactNode;
  children: ReactNode;
  fab?: ReactNode;
  /** When true, removes default px-4 py-4 padding from main */
  noPadding?: boolean;
}

/**
 * Native-app-style screen wrapper used inside MobileAppShell-aware sub-pages.
 * - Sticky gradient top bar with back button
 * - Safe-area aware
 * - Optional FAB & right action slot
 */
const MobileScreen = ({
  title,
  subtitle,
  back = true,
  rightAction,
  children,
  fab,
  noPadding,
}: MobileScreenProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof back === "string") navigate(back);
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header
        className="sticky top-0 z-40 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="px-2 py-3 flex items-center gap-1 min-h-[56px]">
          {back && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className="h-10 w-10 rounded-full flex items-center justify-center active:scale-90 active:bg-primary-foreground/15 transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div className="flex-1 min-w-0 px-1">
            <h1 className="text-base font-semibold leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-primary-foreground/80 truncate leading-tight">{subtitle}</p>
            )}
          </div>
          {rightAction && <div className="flex items-center gap-1 pr-2">{rightAction}</div>}
        </div>
      </header>

      <main className={noPadding ? "flex-1" : "flex-1 px-4 py-4"}>{children}</main>

      {fab && (
        <div
          className="fixed right-4 z-40"
          style={{ bottom: `calc(env(safe-area-inset-bottom) + 84px)` }}
        >
          {fab}
        </div>
      )}
    </div>
  );
};

export default MobileScreen;
