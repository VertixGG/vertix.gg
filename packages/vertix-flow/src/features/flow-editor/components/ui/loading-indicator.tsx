import React from "react";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@vertix.gg/flow/src/shared/components/card";

import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

/**
 * LoadingIndicator component that displays based on the global loading state
 */
export const LoadingIndicator: React.FC = () => {
  const { isLoading } = useFlowUI();

  if ( !isLoading ) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card>
        <CardContent className="p-6 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingIndicator;
