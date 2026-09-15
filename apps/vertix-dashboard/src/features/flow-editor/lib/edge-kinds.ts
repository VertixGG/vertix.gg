import { EDGE_COLORS } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";

import type { Edge } from "@xyflow/react";

export interface EdgeKind {
    color: string;
    label: string;
    /**
     * Drawn broken on the canvas, which is the only thing telling it from its neighbour.
     *
     * Broken covers both ways the canvas breaks a line - a dash pattern, and the moving dashes
     * react flow draws for an animated edge. They look the same to a reader and neither is ever
     * used on a line whose colour already stands alone, so one flag answers for both.
     */
    isBroken?: boolean;
}

/**
 * Every appearance a line on the canvas can have, and what each one means.
 *
 * Colour alone does not identify a line: amber says two different things, and pink is the way into
 * a modal one way round and the way back out the other. Colour and whether the line is broken
 * together do - there are nine appearances across the three modules and nine entries here, one
 * apiece, with nothing drawn that this list cannot name.
 */
export const EDGE_KINDS: ReadonlyArray<EdgeKind> = [
    { color: EDGE_COLORS.MODULE_TO_FLOW, label: "A module and the flows it owns" },
    { color: EDGE_COLORS.COMPONENT_TO_FLOW, label: "A button that opens another flow", isBroken: true },
    { color: EDGE_COLORS.FLOW_TO_COMPONENT, label: "The screen a flow opens on" },
    { color: EDGE_COLORS.COMPONENT_TO_MODAL, label: "A button that opens a modal", isBroken: true },
    { color: EDGE_COLORS.COMPONENT_TO_MODAL, label: "Back out of a modal" },
    { color: EDGE_COLORS.STEP_TRANSITION, label: "A step inside one flow" },
    { color: EDGE_COLORS.SYSTEM_FLOW_TRANSITION, label: "Where a system flow routes", isBroken: true },
    { color: EDGE_COLORS.COMMAND_TRANSITION, label: "A slash command", isBroken: true },
    { color: EDGE_COLORS.PROGRAMMATIC_TRANSITION, label: "Moved by the bot, not by a click", isBroken: true }
];

/**
 * Function edgeKindKey() :: What a line's appearance is called, so a row and a line can be matched.
 *
 * Taken from how the line is drawn rather than from anything stored on it, because that is what the
 * reader is pointing at: they are turning off the thing that looks like this, and the only claim
 * the key has to make is that two lines a reader cannot tell apart are named the same.
 */
export function edgeKindKey( color: string | undefined, isBroken: boolean ): string {
    return `${ color ?? "none" }|${ isBroken }`;
}

export function kindKeyOfEdge( edge: Edge ): string {
    const style = edge.style as { stroke?: string; strokeDasharray?: string } | undefined;

    return edgeKindKey( style?.stroke, Boolean( style?.strokeDasharray ) || Boolean( edge.animated ) );
}

export function kindKeyOf( kind: EdgeKind ): string {
    return edgeKindKey( kind.color, Boolean( kind.isBroken ) );
}
