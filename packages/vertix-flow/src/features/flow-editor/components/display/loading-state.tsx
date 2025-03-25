import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";

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
  className = "min-h-[200px] flex items-center justify-center",
  showHeader = false,
} ) => {
  if ( showHeader ) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-neutral-500">{message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <div className="text-center">
          <p className="text-neutral-500">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};
