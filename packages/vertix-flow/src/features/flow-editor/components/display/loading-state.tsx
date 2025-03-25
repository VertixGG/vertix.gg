import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import { Skeleton } from "@vertix.gg/flow/src/shared/components/skeleton";

export interface LoadingStateProps {
  message?: string;
  title?: string;
  className?: string;
  showHeader?: boolean;
}

/**
 * Loading state component displays a consistent loading UI
 */
export const LoadingState: React.FC<LoadingStateProps> = ( {
  message = "Loading data...",
  title = "Loading...",
  className = "min-h-[200px] flex flex-col items-center justify-center gap-4",
  showHeader = false,
} ) => {
  if ( showHeader ) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="w-full space-y-4">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <p className="text-muted-foreground text-center text-sm">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="w-full space-y-4">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <p className="text-muted-foreground text-center text-sm">{message}</p>
      </CardContent>
    </Card>
  );
};
