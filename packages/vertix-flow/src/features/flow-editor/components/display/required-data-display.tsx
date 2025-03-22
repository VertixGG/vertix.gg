import React from "react";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

export interface RequiredDataDisplayProps {
  requiredData: Record<string, string[]>;
}

/**
 * RequiredDataDisplay component shows the data requirements for the flow
 */
export const RequiredDataDisplay: React.FC<RequiredDataDisplayProps> = ( { requiredData } ) => {
  const hasData = Object.keys( requiredData ).length > 0;

  return (
    <div>
      <h3 className="font-medium mb-2">Required Data</h3>
      {hasData ? (
        Object.entries( requiredData ).map( ( [ key, values ] ) => (
          <div key={key} className="mb-2">
            <h4 className="text-sm font-medium">{key}</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {values.map( ( value: string, index: number ) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {value}
                </Badge>
              ) )}
            </div>
          </div>
        ) )
      ) : (
        <p className="text-sm text-neutral-500">No required data</p>
      )}
    </div>
  );
};
