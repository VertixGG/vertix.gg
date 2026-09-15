import { Layers, Radio } from "lucide-react";

import { useCanvasFiltersStore } from "@vertix.gg/dashboard/src/hooks/use-canvas-filters-store";

import type { LucideIcon } from "lucide-react";

interface FilterRowProps {
    icon?: LucideIcon;
    label: string;
    title: string;
    isChecked: boolean;
    onChange: ( value: boolean ) => void;
}

function FilterRow( { icon: Icon, label, title, isChecked, onChange }: FilterRowProps ) {
    return (
        <label
            className="flex items-center gap-2 px-1 text-xs text-zinc-400 hover:text-zinc-200
                cursor-pointer select-none transition-colors"
            title={ title }
        >
            <input
                type="checkbox"
                checked={ isChecked }
                onChange={ ( event ) => onChange( event.target.checked ) }
                className="accent-amber-500 cursor-pointer shrink-0"
            />
            { Icon && <Icon className="w-3.5 h-3.5 shrink-0" /> }
            <span className="truncate">{ label }</span>
        </label>
    );
}

interface CanvasFiltersProps {
    /** This module's routers, which are not the same from one module to the next. */
    systemFlowNames: string[];
}

/**
 * Function CanvasFilters() :: What the canvas is drawing.
 *
 * Under the search box, with the other thing that decides which of these rows are worth showing.
 * The routers are listed one by one rather than behind a single switch: a module's command router
 * and its control panel are different screens' worth of noise, and somebody reading one of them
 * usually wants the other out of the way rather than both.
 *
 * Everything is on unless turned off - a canvas that quietly left things out would be lying to
 * anybody who had not found the boxes yet.
 */
export function CanvasFilters( { systemFlowNames }: CanvasFiltersProps ) {
    const showsExtraModules = useCanvasFiltersStore( ( state ) => state.showsExtraModules );
    const setShowsExtraModules = useCanvasFiltersStore( ( state ) => state.setShowsExtraModules );
    const hiddenSystemFlows = useCanvasFiltersStore( ( state ) => state.hiddenSystemFlows );
    const setSystemFlowHidden = useCanvasFiltersStore( ( state ) => state.setSystemFlowHidden );

    return (
        <div className="mt-2 space-y-1">
            <FilterRow
                icon={ Layers }
                label="Extra modules"
                title="Draw the flows this module hands off to, which other modules own"
                isChecked={ showsExtraModules }
                onChange={ setShowsExtraModules }
            />

            { systemFlowNames.length > 0 && (
                <div className="pt-1 space-y-1">
                    <div className="flex items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-zinc-500">
                        <Radio className="w-3 h-3 shrink-0" />
                        Routers
                    </div>

                    { systemFlowNames.map( ( flowName ) => (
                        <div key={ flowName } className="pl-3">
                            <FilterRow
                                label={ flowName.split( "/" ).pop() ?? flowName }
                                title={ `Draw ${ flowName } and everything it routes to` }
                                isChecked={ ! hiddenSystemFlows.includes( flowName ) }
                                onChange={ ( isShown ) => setSystemFlowHidden( flowName, ! isShown ) }
                            />
                        </div>
                    ) ) }
                </div>
            ) }
        </div>
    );
}
