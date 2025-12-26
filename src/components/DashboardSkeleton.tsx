import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DashboardSkeletonProps {
  statsCount?: number;
  showHeader?: boolean;
  showQuickActions?: boolean;
  showCharts?: boolean;
}

export const DashboardSkeleton = ({
  statsCount = 4,
  showHeader = true,
  showQuickActions = true,
  showCharts = true,
}: DashboardSkeletonProps) => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      {showHeader && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 via-muted/30 to-background p-4 border border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-48" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-32 ml-auto" />
              <Skeleton className="h-6 w-24 ml-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid Skeleton */}
      <div className={`grid gap-4 ${statsCount === 5 ? 'md:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {Array.from({ length: statsCount }).map((_, index) => (
          <Card key={index} className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-20 mb-2" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      {showCharts && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/40">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions Skeleton */}
      {showQuickActions && (
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg border border-border/40">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardSkeleton;
