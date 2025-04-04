import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";

// Import the enum from its definition
import { UIEFlowIntegrationPointType } from "@vertix.gg/gui/src/bases/ui-flow-base";

// Import the shared type for the data prop

import { CommandLabelBadge } from "@vertix.gg/flow/src/features/flow-editor/components/command-label-badge";

import { FLOW_EDITOR } from "@vertix.gg/flow/src/features/flow-editor/config"; // Import main config

import type { FlowIntegrationPoint } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

import type { EdgeProps } from "@xyflow/react";

// Remove local interface, we use the imported FlowIntegrationPoint type for data
// interface CustomEdgeData {
//   integrationType?: UIEFlowIntegrationPointType;
//   commandName?: string;
//   fullName?: string;
//   eventName?: string;
// }

// Update props: remove the unused 'label' prop
export function CustomEdge( {
    // id: _id, // Still unused
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    // label, // REMOVED
    data, // Custom data object (should conform to FlowIntegrationPoint)
}: Omit<EdgeProps, "label"> ) { // Omit label from EdgeProps type

  const [ edgePath, labelX, labelY ] = getSmoothStepPath( {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  } );

  // Type cast data to our expected format for safety, default to empty object
  // Ensure the structure matches FlowIntegrationPoint
  const edgeData = ( data as Partial<FlowIntegrationPoint> ) ?? {};

  // Safely access zIndex, defaulting to 0 if not present or not a number
  const zIndex = typeof style?.zIndex === "number" ? style.zIndex : 0;

  // Get label styles from theme
  const labelTheme = FLOW_EDITOR.theme.components.edge.label;

  // Helper function to extract the last part of a namespaced string
  const getLastPart = ( name: string | undefined ) => name?.split( "/" ).pop() || "";

  return (
    <>
      {/* Pass the calculated path and received style/marker */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, calc(-100% - ${ labelTheme.offsetY }px)) translate(${ labelX }px,${ labelY }px)`,
            fontSize: labelTheme.fontSize,
            pointerEvents: "none",
            zIndex: zIndex + 1, // Ensure label is above edge
          }}
          className="nodrag nopan"
        >
          {edgeData.type === UIEFlowIntegrationPointType.COMMAND && edgeData.fullName ? (
            // Render COMMAND: Use fullName for the badge (extract last part?)
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: labelTheme.textColor }}>
              Command:
              {/* Prepend with slash and use last part of fullName */}
              <CommandLabelBadge name={`/${ getLastPart( edgeData.fullName ) }`} />
            </span>
          ) : edgeData.type === UIEFlowIntegrationPointType.EVENT && edgeData.fullName ? (
            // Render EVENT: Use fullName for the badge (extract last part?)
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: labelTheme.textColor }}>
              Event:
              {/* Use last part of fullName, maybe success variant */}
              <CommandLabelBadge name={getLastPart( edgeData.fullName )} variant="success" />
            </span>
          ) : edgeData.type === UIEFlowIntegrationPointType.GENERIC ? (
             // Render GENERIC: Use description or transition as label
             ( edgeData.description || edgeData.transition ) && (
                 <span style={{
                     padding: labelTheme.padding,
                     background: labelTheme.backgroundColor,
                     borderRadius: labelTheme.borderRadius,
                     color: labelTheme.textColor,
                     display: "inline-flex",
                     alignItems: "center"
                 }}>
                     {/* Show description, fallback to last part of transition */}
                     {edgeData.description || getLastPart( edgeData.transition )}
                 </span>
             )
          ) : (
             // Fallback for unknown types or missing data (render nothing?)
             null
          )
          }
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
