import React from "react";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@vertix.gg/flow/src/shared/components/alert";

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
    <div className={className}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};
