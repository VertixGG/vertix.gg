import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";

import { UIEFlowIntegrationPointType } from "@vertix.gg/gui/src/bases/ui-flow-base"; // Import enum

import { CommandLabelBadge } from "@vertix.gg/flow/src/features/flow-editor/components/command-label-badge";

import { FLOW_EDITOR } from "@vertix.gg/flow/src/features/flow-editor/config"; // Import main config

import type { EdgeProps } from "@xyflow/react";

// Define a type for the expected edge data
interface CustomEdgeData {
  integrationType?: UIEFlowIntegrationPointType;
  commandName?: string;
  fullName?: string;
  eventName?: string;
}

export function CustomEdge( {
    // We don't use id in the component logic, so prefix with _
    // id: _id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style, // Style object is passed directly
    markerEnd,
    label, // Default string label
    data, // Custom data object
}: EdgeProps ) {

  const [ edgePath, labelX, labelY ] = getSmoothStepPath( {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  } );

  // Type cast data to our expected format for safety, default to empty object
  const edgeData = ( data as CustomEdgeData ) ?? {};
  const isCommandEdge = edgeData.integrationType === UIEFlowIntegrationPointType.COMMAND;
  const commandName = edgeData.commandName;

  // Safely access zIndex, defaulting to 0 if not present or not a number
  const zIndex = typeof style?.zIndex === "number" ? style.zIndex : 0;

  // Get label styles from theme
  const labelTheme = FLOW_EDITOR.theme.components.edge.label;

  return (
    <>
      {/* Pass the calculated path and received style/marker */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            // Use offsetY from theme
            transform: `translate(-50%, calc(-100% - ${ labelTheme.offsetY }px)) translate(${ labelX }px,${ labelY }px)`,
            // Use fontSize from theme
            fontSize: labelTheme.fontSize,
            pointerEvents: "none",
            zIndex: zIndex + 1, // Ensure label is above edge
          }}
          className="nodrag nopan"
        >
          {isCommandEdge && commandName ? (
            // Render "Command Handoff: " text + badge
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: labelTheme.textColor }}>
              Command Handoff:
              <CommandLabelBadge name={edgeData.fullName!} />
            </span>
          ) : edgeData.eventName ? (
            // Render "Event Handoff: " text + GREEN badge
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: labelTheme.textColor }}>
              Event Handoff:
              <CommandLabelBadge name={edgeData.eventName} variant="success" />
            </span>
          ) : (
            // Render standard label (if provided)
            label && (
                // Use theme values for standard label styling
                <span style={{
                    padding: labelTheme.padding,
                    background: labelTheme.backgroundColor,
                    borderRadius: labelTheme.borderRadius,
                    color: labelTheme.textColor, // Use theme text color
                    display: "inline-flex",
                    alignItems: "center"
                }}>
                    {label}
                </span>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
