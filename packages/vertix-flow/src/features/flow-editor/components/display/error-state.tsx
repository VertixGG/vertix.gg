import React from "react";

import { Card, CardContent } from "@vertix.gg/flow/src/shared/components/card";

export interface ErrorStateProps {
  message: string;
  className?: string;
}

/**
 * Error state component displays error messages in a consistent way
 */
export const ErrorState: React.FC<ErrorStateProps> = ( {
  message,
  className = "min-h-[200px] flex items-center justify-center"
} ) => {
  return (
    <Card className={className}>
      <CardContent>
        <div className="text-center">
          <p className="text-red-500">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};
