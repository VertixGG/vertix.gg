import { MarkerType } from "@xyflow/react";

import { EDGE_COLORS, EDGE_STYLES, MARKER_SIZES, Z_INDEX } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";

import type { Edge } from "@xyflow/react";

export function createModuleToFlowEdge( moduleNodeId: string, flowId: string, flowName: string ): Edge {
    return {
        id: `edge-module-${ flowName }`,
        source: moduleNodeId,
        target: flowId,
        style: { stroke: EDGE_COLORS.MODULE_TO_FLOW, ...EDGE_STYLES.DEFAULT },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.MODULE_TO_FLOW, ...MARKER_SIZES.MEDIUM }
    };
}

export function createFlowToComponentEdge( flowId: string, compId: string, flowName: string, compName: string ): Edge {
    return {
        id: `edge-${ flowName }-${ compName }`,
        source: flowId,
        target: compId,
        style: { stroke: EDGE_COLORS.FLOW_TO_COMPONENT, ...EDGE_STYLES.DEFAULT },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.FLOW_TO_COMPONENT, ...MARKER_SIZES.MEDIUM },
        data: { weight: 10 }
    };
}

export function createComponentToModalEdge(
    compId: string,
    modalId: string,
    sourceHandle: string
): Edge {
    return {
        id: `edge-${ compId }-${ modalId }`,
        source: compId,
        target: modalId,
        sourceHandle,
        zIndex: Z_INDEX.EDGE_OVERLAY,
        style: { stroke: EDGE_COLORS.COMPONENT_TO_MODAL, ...EDGE_STYLES.DASHED },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.COMPONENT_TO_MODAL, ...MARKER_SIZES.SMALL }
    };
}

export function createComponentToFlowEdge(
    compId: string,
    targetFlowId: string,
    buttonName: string,
    targetFlowName: string
): Edge {
    return {
        id: `edge-btn-flow-${ compId }-${ buttonName }-${ targetFlowName }`,
        source: compId,
        target: targetFlowId,
        sourceHandle: `btn-${ buttonName }`,
        zIndex: Z_INDEX.EDGE_OVERLAY,
        style: { stroke: EDGE_COLORS.COMPONENT_TO_FLOW, ...EDGE_STYLES.DEFAULT },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.COMPONENT_TO_FLOW, ...MARKER_SIZES.MEDIUM },
        animated: true
    };
}

export const FLOW_EXIT_HANDLE_ID = "exit";

export function createComponentToFlowExitEdge(
    compId: string,
    flowId: string,
    flowName: string,
    buttonName: string
): Edge {
    return {
        id: `edge-finish-exit-${ flowName }-${ compId }-${ buttonName }`,
        source: compId,
        target: flowId,
        sourceHandle: `btn-${ buttonName }`,
        targetHandle: FLOW_EXIT_HANDLE_ID,
        zIndex: Z_INDEX.EDGE_OVERLAY,
        label: "Finish",
        style: { stroke: EDGE_COLORS.STEP_TRANSITION, ...EDGE_STYLES.DEFAULT },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.STEP_TRANSITION, ...MARKER_SIZES.MEDIUM },
        labelStyle: { fill: EDGE_COLORS.STEP_TRANSITION, fontSize: 10, fontWeight: 600 },
        labelBgPadding: [ 6, 2 ],
        data: { weight: 1 }
    };
}

export function createComponentToComponentEdge(
    sourceCompId: string,
    targetCompId: string,
    flowName: string,
    sourceElementName: string,
    label: string,
    targetHandle?: string,
    isBackEdge?: boolean,
    weight?: number
): Edge {
    return {
        id: `edge-comp-comp-${ flowName }-${ sourceElementName }-${ targetCompId }-${ label }`,
        source: sourceCompId,
        target: targetCompId,
        sourceHandle: `btn-${ sourceElementName }`,
        targetHandle,
        zIndex: Z_INDEX.EDGE_OVERLAY,
        label,
        style: { stroke: EDGE_COLORS.STEP_TRANSITION, ...EDGE_STYLES.DEFAULT },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.STEP_TRANSITION, ...MARKER_SIZES.MEDIUM },
        labelStyle: { fill: EDGE_COLORS.STEP_TRANSITION, fontSize: 10, fontWeight: 600 },
        labelBgPadding: [ 6, 2 ],
        data: { isBackEdge: isBackEdge ?? false, weight: weight ?? 1 }
    };
}

export function createComponentToStateFallbackEdge(
    sourceCompId: string,
    targetCompId: string,
    flowName: string,
    label: string
): Edge {
    return {
        id: `edge-comp-state-${ flowName }-${ sourceCompId }-${ targetCompId }-${ label }`,
        source: sourceCompId,
        target: targetCompId,
        sourceHandle: "bottom",
        zIndex: Z_INDEX.EDGE_OVERLAY,
        label,
        style: { stroke: EDGE_COLORS.STEP_TRANSITION, ...EDGE_STYLES.DASHED_TRANSITION },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.STEP_TRANSITION, ...MARKER_SIZES.MEDIUM },
        labelStyle: { fill: EDGE_COLORS.STEP_TRANSITION, fontSize: 10, fontWeight: 600 },
        labelBgPadding: [ 6, 2 ]
    };
}

export function createProgrammaticTransitionEdge(
    sourceCompId: string,
    targetCompId: string,
    flowName: string,
    label: string
): Edge {
    return {
        id: `edge-programmatic-${ flowName }-${ sourceCompId }-${ targetCompId }-${ label }`,
        source: sourceCompId,
        target: targetCompId,
        sourceHandle: "bottom",
        zIndex: Z_INDEX.EDGE_OVERLAY,
        label,
        style: { stroke: EDGE_COLORS.PROGRAMMATIC_TRANSITION, ...EDGE_STYLES.DASHED_TRANSITION },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.PROGRAMMATIC_TRANSITION, ...MARKER_SIZES.MEDIUM },
        labelStyle: { fill: EDGE_COLORS.PROGRAMMATIC_TRANSITION, fontSize: 10, fontWeight: 600 },
        labelBgPadding: [ 6, 2 ]
    };
}

export function createModalToComponentEdge(
    modalId: string,
    targetCompId: string,
    flowName: string,
    label: string
): Edge {
    return {
        id: `edge-modal-comp-${ flowName }-${ modalId }-${ targetCompId }-${ label }`,
        source: modalId,
        target: targetCompId,
        zIndex: Z_INDEX.EDGE_OVERLAY,
        label,
        style: { stroke: EDGE_COLORS.COMPONENT_TO_MODAL, ...EDGE_STYLES.DEFAULT },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.COMPONENT_TO_MODAL, ...MARKER_SIZES.MEDIUM },
        labelStyle: { fill: EDGE_COLORS.COMPONENT_TO_MODAL, fontSize: 10, fontWeight: 600 },
        labelBgPadding: [ 6, 2 ]
    };
}

export function createStepTransitionEdge(
    prevCompId: string,
    compId: string,
    flowName: string,
    stepIndex: number,
    sourceHandle: string = "bottom"
): Edge {
    return {
        id: `edge-step-${ flowName }-${ stepIndex }`,
        source: prevCompId,
        target: compId,
        sourceHandle,
        label: `Step ${ stepIndex + 1 }`,
        style: { stroke: EDGE_COLORS.STEP_TRANSITION, ...EDGE_STYLES.DEFAULT },
        zIndex: Z_INDEX.EDGE_OVERLAY,
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.STEP_TRANSITION, ...MARKER_SIZES.MEDIUM },
        labelStyle: { fill: EDGE_COLORS.STEP_TRANSITION, fontSize: 10, fontWeight: 600 },
        labelBgPadding: [ 6, 2 ]
    };
}

export function createSystemFlowTransitionEdge(
    systemFlowId: string,
    targetFlowId: string,
    systemFlowName: string,
    targetFlowName: string,
    label: string,
    isCommand: boolean
): Edge {
    const color = isCommand ? EDGE_COLORS.COMMAND_TRANSITION : EDGE_COLORS.SYSTEM_FLOW_TRANSITION;

    return {
        id: `edge-${ systemFlowName }-${ targetFlowName }-${ label }`,
        source: systemFlowId,
        target: targetFlowId,
        label,
        style: { stroke: color, ...EDGE_STYLES.DASHED_TRANSITION },
        markerEnd: { type: MarkerType.ArrowClosed, color, ...MARKER_SIZES.MEDIUM },
        labelBgPadding: [ 6, 2 ],
        labelStyle: { fill: color, fontSize: 10, fontWeight: 600 },
        animated: true
    };
}
