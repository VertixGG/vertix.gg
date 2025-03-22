import React from "react";

export interface CurrentStateDisplayProps {
  currentState: string;
}

/**
 * Displays the current state of a flow
 */
export const CurrentStateDisplay: React.FC<CurrentStateDisplayProps> = ( { currentState } ) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Current State</h3>
      <div className="p-2 bg-neutral-100 rounded">
        {currentState}
      </div>
    </div>
  );
};
