import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

interface MobileFilterSheetProps {
  children: ReactNode;
  trigger?: ReactNode;
  title?: string;
  activeCount?: number;
  onReset?: () => void;
  onApply?: () => void;
}

const MobileFilterSheet = ({
  children,
  trigger,
  title = "Filters",
  activeCount = 0,
  onReset,
  onApply,
}: MobileFilterSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2 relative">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 text-[10px] rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {activeCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">{children}</div>
        {(onReset || onApply) && (
          <div className="flex gap-2 sticky bottom-0 bg-background pt-3 pb-2 border-t">
            {onReset && (
              <Button variant="outline" className="flex-1" onClick={onReset}>
                Reset
              </Button>
            )}
            {onApply && (
              <Button className="flex-1" onClick={onApply}>
                Apply
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterSheet;
