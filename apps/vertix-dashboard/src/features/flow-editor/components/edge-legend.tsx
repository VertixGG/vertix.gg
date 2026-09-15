import { useState } from "react";

import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

import { EDGE_KINDS, kindKeyOf } from "@vertix.gg/dashboard/src/features/flow-editor/lib/edge-kinds";
import { useCanvasFiltersStore } from "@vertix.gg/dashboard/src/hooks/use-canvas-filters-store";

/**
 * Function EdgeLegend() :: The colours on the canvas, named, and each one a switch.
 *
 * Beside the zoom controls, which is where somebody already looks to change what they are seeing.
 * Folds away because it is read once and then in the way.
 *
 * Reading a canvas of two hundred lines is mostly a matter of reading one kind of line at a time,
 * and the legend is already the place where the kinds are listed - so it is where they are turned
 * off. A row that has been put away stays legible rather than disappearing: what is off has to be
 * as plain as what is on, or the canvas is quietly lying about how much it is showing.
 */
export function EdgeLegend() {
    const [ isOpen, setIsOpen ] = useState( true );

    const hiddenEdgeKinds = useCanvasFiltersStore( ( state ) => state.hiddenEdgeKinds );
    const setEdgeKindHidden = useCanvasFiltersStore( ( state ) => state.setEdgeKindHidden );
    const showAllEdgeKinds = useCanvasFiltersStore( ( state ) => state.showAllEdgeKinds );

    const hiddenCount = hiddenEdgeKinds.length;

    return (
        <div className="absolute bottom-4 left-14 bg-zinc-800/95 border border-zinc-700 rounded
            text-xs text-zinc-300 shadow-lg max-w-[280px]">
            <button
                onClick={ () => setIsOpen( ! isOpen ) }
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5
                    text-zinc-400 hover:text-zinc-200 transition-colors"
            >
                <span>
                    Edge colours
                    { hiddenCount > 0 && (
                        <span className="ml-1.5 text-amber-400/80">{ hiddenCount } hidden</span>
                    ) }
                </span>
                { isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" /> }
            </button>

            { isOpen && (
                <div className="px-2 pb-2 space-y-0.5">
                    { EDGE_KINDS.map( ( kind ) => {
                        const key = kindKeyOf( kind ),
                            isHidden = hiddenEdgeKinds.includes( key );

                        return (
                            <button
                                key={ `${ kind.color }-${ kind.label }` }
                                onClick={ () => setEdgeKindHidden( key, ! isHidden ) }
                                title={ isHidden ? "Show these lines" : "Hide these lines" }
                                className="w-full flex items-center gap-2 text-left rounded px-1 py-0.5
                                    hover:bg-zinc-700/60 transition-colors group"
                            >
                                <span
                                    className="w-5 shrink-0"
                                    style={ {
                                        borderTopWidth: 2,
                                        borderTopColor: kind.color,
                                        borderTopStyle: kind.isBroken ? "dashed" : "solid",
                                        opacity: isHidden ? 0.25 : 1
                                    } }
                                />
                                <span className={ `leading-tight flex-1 ${ isHidden ? "text-zinc-500 line-through" : "" }` }>
                                    { kind.label }
                                </span>
                                { isHidden
                                    ? <EyeOff className="w-3 h-3 shrink-0 text-zinc-500" />
                                    : <Eye className="w-3 h-3 shrink-0 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" /> }
                            </button>
                        );
                    } ) }

                    { hiddenCount > 0 && (
                        <button
                            onClick={ showAllEdgeKinds }
                            className="w-full text-left px-1 pt-1 text-[11px] text-zinc-400
                                hover:text-zinc-200 transition-colors"
                        >
                            Show all
                        </button>
                    ) }
                </div>
            ) }
        </div>
    );
}
