import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardGridSkeletonProps {
  count?: number;
}

export function CardGridSkeleton({ count = 6 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="grid-cols-[auto_1fr] items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
