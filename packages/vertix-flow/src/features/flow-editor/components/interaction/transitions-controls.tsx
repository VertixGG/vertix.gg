import React from "react";
import { Button } from "@vertix.gg/flow/src/shared/components/button";

export interface TransitionsControlsProps {
  transitions: string[];
  onTransition: ( transition: string ) => void;
}

/**
 * Displays available transitions and handles transition actions
 */
export const TransitionsControls: React.FC<TransitionsControlsProps> = ( {
  transitions,
  onTransition
} ) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Available Transitions</h3>
      <div className="flex flex-wrap gap-2">
        {transitions.length > 0 ? (
          transitions.map( ( transition ) => (
            <Button
              key={transition}
              variant="outline"
              size="sm"
              onClick={() => onTransition( transition )}
            >
              {transition}
            </Button>
          ) )
        ) : (
          <p className="text-sm text-neutral-500">No transitions available</p>
        )}
      </div>
    </div>
  );
};
