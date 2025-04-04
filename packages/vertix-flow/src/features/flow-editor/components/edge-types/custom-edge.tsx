import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";

import { UIEFlowIntegrationPointType } from "@vertix.gg/gui/src/bases/ui-flow-base"; // Import enum

import { CommandLabelBadge } from "@vertix.gg/flow/src/features/flow-editor/components/command-label-badge";

import type { EdgeProps } from "@xyflow/react";

// Define a type for the expected edge data
interface CustomEdgeData {
  integrationType?: UIEFlowIntegrationPointType;
  commandName?: string;
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

  return (
    <>
      {/* Pass the calculated path and received style/marker */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            // Adjust the vertical translate to position above the edge line
            transform: `translate(-50%, calc(-100% - 4px)) translate(${ labelX }px,${ labelY }px)`,
            fontSize: 10,
            pointerEvents: "none",
            zIndex: zIndex + 1, // Use safe zIndex
          }}
          className="nodrag nopan"
        >
          {isCommandEdge && commandName ? (
            // Render "Command Handoff: " text + badge
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              Command Handoff:
              <CommandLabelBadge name={commandName} />
            </span>
          ) : (
            // Render standard label (if provided)
            label && (
                <span style={{ padding: "2px 4px", background: "rgba(255, 255, 255, 0.7)", borderRadius: "3px", display: "inline-flex", alignItems: "center" }}>
                    {label}
                </span>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
