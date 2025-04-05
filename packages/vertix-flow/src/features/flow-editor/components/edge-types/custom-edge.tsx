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

  const edgeData = ( data as Partial<FlowIntegrationPoint> ) ?? {};
  const zIndex = typeof style?.zIndex === "number" ? style.zIndex : 0;
  const labelTheme = FLOW_EDITOR.theme.components.edge.label;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
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
      </EdgeLabelRenderer>
    </>
  );
}
