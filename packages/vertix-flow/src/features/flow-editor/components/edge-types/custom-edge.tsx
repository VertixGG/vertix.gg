import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";

// Import the enum from its definition
import { UIEFlowIntegrationPointType } from "@vertix.gg/gui/src/bases/ui-flow-base";

// Import the shared type for the data prop

import { CommandLabelBadge } from "@vertix.gg/flow/src/features/flow-editor/components/command-label-badge";
// Import the new EventLabelBadge
import { EventLabelBadge } from "@vertix.gg/flow/src/features/flow-editor/components/event-label-badge";

import { FLOW_EDITOR } from "@vertix.gg/flow/src/features/flow-editor/config"; // Import main config

import type { FlowIntegrationPoint } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

import type { EdgeProps } from "@xyflow/react";

export function CustomEdge( {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    data,
}: Omit<EdgeProps, "label"> ) {
  const [ edgePath, labelX, labelY ] = getSmoothStepPath( {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  } );

  const edgeData = ( data as Partial<FlowIntegrationPoint> & { connectionType?: "trigger" | "handoff" } ) ?? {};
  const zIndex = typeof style?.zIndex === "number" ? style.zIndex : 0;
  const labelTheme = FLOW_EDITOR.theme.components.edge.label;

  // Determine if this is a trigger connection
  const isTriggerConnection = edgeData.connectionType === "trigger";

  // Apply trigger-specific styles if applicable
  const edgeStyle = {
    ...style,
    ...( isTriggerConnection && { strokeDasharray: FLOW_EDITOR.theme.components.edge.trigger.strokeDasharray || "5,5" } ) // Add dash style for trigger
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, calc(-100% - ${ labelTheme.offsetY }px)) translate(${ labelX }px,${ labelY }px)`,
            fontSize: labelTheme.fontSize,
            pointerEvents: "none",
            zIndex: zIndex + 1,
          }}
          className="nodrag nopan"
        >
          {/* Wrap existing label and new text for vertical layout */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div>
              {/* Prepend Trigger Emoji/Text if it's a trigger connection */}
              {isTriggerConnection && <span style={{ marginRight: "4px" }}>⚡️ Trigger:</span>}

              {/* Existing label rendering logic */}
              {edgeData.type === UIEFlowIntegrationPointType.COMMAND && edgeData.transition ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: labelTheme.textColor }}>
                  Command:
                  <CommandLabelBadge name={`/${ edgeData.transition }`} />
                </span>
              ) : edgeData.type === UIEFlowIntegrationPointType.EVENT && edgeData.transition ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: labelTheme.textColor }}>
                  Event:
                  <EventLabelBadge name={edgeData.transition} />
                </span>
              ) : edgeData.type === UIEFlowIntegrationPointType.GENERIC ? (
                ( edgeData.description || edgeData.transition ) && (
                  <span style={{
                    padding: labelTheme.padding,
                    background: labelTheme.backgroundColor,
                    borderRadius: labelTheme.borderRadius,
                    color: labelTheme.textColor,
                    display: "inline-flex",
                    alignItems: "center"
                  }}>
                    {edgeData.description || edgeData.transition}
                  </span>
                )
              ) : null}
            </div>

            {/* Add the new line for trigger connections */}
            {isTriggerConnection && (
              <div style={{ fontSize: "smaller", color: "gray", marginTop: "2px" }}>
                This will create a new ephemeral interaction
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
