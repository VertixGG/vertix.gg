import React from "react";

export interface FlowStateDataDisplayProps {
  flowData: Record<string, unknown>;
}

/**
 * Displays current flow state data
 */
export const FlowStateDataDisplay: React.FC<FlowStateDataDisplayProps> = ( { flowData } ) => {
  const hasData = Object.keys( flowData ).length > 0;

  if ( !hasData ) {
    return null;
  }

  return (
    <div>
      <h3 className="font-medium mb-2">Flow Data</h3>
      <div className="p-2 bg-muted rounded text-sm">
        <pre>{JSON.stringify( flowData, null, 2 )}</pre>
      </div>
    </div>
  );
};
