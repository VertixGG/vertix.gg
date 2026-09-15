import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import { EDGE_COLORS } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";

interface LegendEntry {
    color: string;
    label: string;
    /** Drawn dashed on the canvas, which is the only thing telling it from its neighbour. */
    isDashed?: boolean;
}

/**
 * What each colour on the canvas means, and whether it is drawn broken.
 *
 * The dash is load bearing here rather than decoration: amber says two different things, and a
 * solid one against a broken one is the whole of what tells them apart. Same for pink, which is
 * the way into a modal one way round and the way back out of it the other.
 */
const LEGEND_ENTRIES: ReadonlyArray<LegendEntry> = [
    { color: EDGE_COLORS.MODULE_TO_FLOW, label: "A module and the flows it owns" },
    { color: EDGE_COLORS.COMPONENT_TO_FLOW, label: "A button that opens another flow", isDashed: true },
    { color: EDGE_COLORS.FLOW_TO_COMPONENT, label: "The screen a flow opens on" },
    { color: EDGE_COLORS.COMPONENT_TO_MODAL, label: "A button that opens a modal", isDashed: true },
    { color: EDGE_COLORS.COMPONENT_TO_MODAL, label: "Back out of a modal" },
    { color: EDGE_COLORS.STEP_TRANSITION, label: "A step inside one flow" },
    { color: EDGE_COLORS.SYSTEM_FLOW_TRANSITION, label: "Where a system flow routes", isDashed: true },
    { color: EDGE_COLORS.COMMAND_TRANSITION, label: "A slash command", isDashed: true },
    { color: EDGE_COLORS.PROGRAMMATIC_TRANSITION, label: "Moved by the bot, not by a click", isDashed: true }
];

/**
 * Function EdgeLegend() :: The colours on the canvas, named.
 *
 * Beside the zoom controls, which is where somebody already looks to change what they are seeing.
 * Folds away because it is read once and then in the way.
 */
export function EdgeLegend() {
    const [ isOpen, setIsOpen ] = useState( true );

    return (
        <div className="absolute bottom-4 left-14 bg-zinc-800/95 border border-zinc-700 rounded
            text-xs text-zinc-300 shadow-lg max-w-[280px]">
            <button
                onClick={ () => setIsOpen( ! isOpen ) }
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5
                    text-zinc-400 hover:text-zinc-200 transition-colors"
            >
                <span>Edge colours</span>
                { isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" /> }
            </button>

            { isOpen && (
                <div className="px-2 pb-2 space-y-1">
                    { LEGEND_ENTRIES.map( ( entry ) => (
                        <div key={ `${ entry.color }-${ entry.label }` } className="flex items-center gap-2">
                            <span
                                className="w-5 shrink-0"
                                style={ {
                                    borderTopWidth: 2,
                                    borderTopColor: entry.color,
                                    borderTopStyle: entry.isDashed ? "dashed" : "solid"
                                } }
                            />
                            <span className="leading-tight">{ entry.label }</span>
                        </div>
                    ) ) }
                </div>
            ) }
        </div>
    );
}
