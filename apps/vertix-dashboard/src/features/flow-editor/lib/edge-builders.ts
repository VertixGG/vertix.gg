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

export function createFlowToComponentEdge( flowId: string, compId: string, flowName: string ): Edge {
    return {
        /*
         * Named after the screen it lands on rather than after the component drawn there.
         *
         * A flow can open at several screens and draw the same component on all of them - clearing
         * a chat says how many it cleared, or that there was nothing to clear, or that it went
         * wrong, all through the one component. Named after the component, those were one id, and
         * the ways in past the first were dropped as repeats of the first.
         */
        id: `edge-${ flowName }-${ compId }`,
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
    targetFlowName: string,
    sourceFlowName: string
): Edge {
    return {
        /*
         * Named after the flow the button belongs to rather than the component drawing it.
         *
         * A flow with several states draws its component once per state, and every copy carries the
         * same buttons - so a name carrying the copy made one button leading out of a flow into one
         * line per state. The general module drew thirty-five of these to say six things, each of
         * them several thousand pixels long. There is one fact here - this button leads to that
         * flow - and this is one line for it.
         */
        id: `edge-btn-flow-${ sourceFlowName }-${ buttonName }-${ targetFlowName }`,
        source: compId,
        target: targetFlowId,
        sourceHandle: `btn-${ buttonName }`,
        zIndex: Z_INDEX.EDGE_OVERLAY,
        // The button is the interaction. It was known all along - the flow declares which element
        // opens which flow - and the canvas drew the line without ever saying which press it was.
        label: buttonName.split( "/" ).pop(),
        style: { stroke: EDGE_COLORS.COMPONENT_TO_FLOW, ...EDGE_STYLES.DEFAULT },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.COMPONENT_TO_FLOW, ...MARKER_SIZES.MEDIUM },
        labelStyle: { fill: EDGE_COLORS.COMPONENT_TO_FLOW, fontSize: 10, fontWeight: 600 },
        labelBgStyle: { fill: "#18181b" },
        labelBgPadding: [ 4, 2 ] as [ number, number ],
        labelBgBorderRadius: 3,
        animated: true
    };
}

/**
 * Function createHubToFlowEdge() :: A control on a router's screen, and the flow it opens.
 *
 * Named after the screen rather than the router, unlike the edge above it. A router can be pressed
 * from more than one screen - the channel's own message and the master channel's panel carry the
 * same grid - and a name carrying only the router made those two screens' lines one line, so
 * whichever was drawn second silently lost all of them.
 */
export function createHubToFlowEdge(
    compId: string,
    targetFlowId: string,
    buttonName: string,
    targetFlowName: string
): Edge {
    return {
        ...createComponentToFlowEdge( compId, targetFlowId, buttonName, targetFlowName, compId ),
        id: `edge-btn-flow-${ compId }-${ buttonName }-${ targetFlowName }`
    };
}

/**
 * Function createNoticeEdge() :: What a member was doing when a notice was put in front of them.
 *
 * Not a press and not a move, so it is drawn unlike either: a notice is what the bot says when it
 * refuses, and the line carries the refusal rather than the control that caused it. Dashed and
 * unanimated, because nothing travels along it - there is no screen at the far end to arrive at.
 */
export function createNoticeEdge(
    sourceId: string,
    noticeId: string,
    description: string
): Edge {
    return {
        id: `edge-notice-${ sourceId }-${ noticeId }`,
        source: sourceId,
        target: noticeId,
        zIndex: Z_INDEX.EDGE_OVERLAY,
        label: description,
        style: { stroke: EDGE_COLORS.COMPONENT_TO_MODAL, ...EDGE_STYLES.DASHED },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS.COMPONENT_TO_MODAL, ...MARKER_SIZES.SMALL },
        labelStyle: { fill: EDGE_COLORS.COMPONENT_TO_MODAL, fontSize: 10, fontWeight: 600 },
        labelBgStyle: { fill: "#18181b" },
        labelBgPadding: [ 4, 2 ] as [ number, number ],
        labelBgBorderRadius: 3,
        data: { weight: 1 }
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

/**
 * Function createDeclaredTransitionEdge() :: One move the flow says it makes, drawn as it is written.
 *
 * Read off the flow's own transitions rather than worked out from the shape of the screens. The
 * label is the element that causes it, because that is the interaction - "this menu opens that
 * screen" is the whole fact, and an unlabelled arrow between two boxes is the half of it nobody
 * needed.
 *
 * A transition nothing is bound to is drawn faintly and says so. Forty-five percent of them are
 * like that, and inventing a cause for those is what had the editor asserting things the bot never
 * said. Better a thin line admitting the gap than a confident one that is wrong.
 */
export function createDeclaredTransitionEdge(
    sourceId: string,
    targetId: string,
    fromStateKey: string,
    toStateKey: string,
    triggerName: string | undefined,
    outcomeCondition?: string,
    isBackEdge = false,
    sourceHandle?: string
): Edge {
    /*
     * A move with nobody pressing anything is not always a gap.
     *
     * Some of them are outcomes - the bot looked at what happened and took this branch - and the
     * flow says so, in the condition it declares for the branch. Those read as the condition and
     * are drawn in the colour the canvas already uses for what the bot does on its own. Only a move
     * with neither a trigger nor a condition is genuinely undescribed, and only that one says so.
     */
    const label = triggerName ?? outcomeCondition ?? "not attributed",
        isUndescribed = ! triggerName && ! outcomeCondition,
        color = triggerName ? EDGE_COLORS.STEP_TRANSITION : EDGE_COLORS.PROGRAMMATIC_TRANSITION;

    return {
        id: `edge-transition-${ fromStateKey }-${ toStateKey }-${ label }`,
        source: sourceId,
        target: targetId,
        /*
         * The control the line leaves from.
         *
         * Every other kind of line says this and this one did not, so react flow attached it to
         * whichever handle it found first on the screen - which is the first control drawn there,
         * whatever the line is about. A wizard's Next line left the Edit Channel Name button beside
         * it: the label said Next and the line pointed at something else.
         */
        sourceHandle,
        label,
        style: {
            stroke: color,
            ...( triggerName ? EDGE_STYLES.DEFAULT : EDGE_STYLES.DASHED_TRANSITION ),
            ...( isUndescribed ? { opacity: 0.45 } : {} )
        },
        markerEnd: { type: MarkerType.ArrowClosed, color, ...MARKER_SIZES.MEDIUM },
        labelStyle: { fill: color, fontSize: 10, fontWeight: 600, opacity: isUndescribed ? 0.5 : 1 },
        labelBgStyle: { fill: "#18181b" },
        labelBgPadding: [ 4, 2 ] as [ number, number ],
        labelBgBorderRadius: 3,
        /*
         * Whether this move returns to a screen the flow has already been through.
         *
         * The layout reads it and leaves the move out of its ranking. Ranked, a Back button is an
         * instruction to put the screen it returns to below the screen it leaves - so a flow whose
         * every screen can go back to the first one gets stretched into a column as tall as it has
         * screens, and then every one of those Backs is drawn the whole height of it.
         *
         * The move is still drawn. It is only the ordering that stops listening to it.
         */
        data: { isBackEdge }
    };
}
