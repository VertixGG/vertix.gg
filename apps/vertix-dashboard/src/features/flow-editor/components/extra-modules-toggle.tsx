import { Layers } from "lucide-react";

import { useExtraModulesStore } from "@vertix.gg/dashboard/src/hooks/use-extra-modules-store";

/**
 * Function ExtraModulesToggle() :: Whether the canvas draws the modules this one reaches into.
 *
 * Under the search box, with the other thing that decides which of these rows are worth showing.
 */
export function ExtraModulesToggle() {
    const showsExtraModules = useExtraModulesStore( ( state ) => state.showsExtraModules );
    const setShowsExtraModules = useExtraModulesStore( ( state ) => state.setShowsExtraModules );

    return (
        <label
            className="flex items-center gap-2 mt-2 px-1 text-xs text-zinc-400 hover:text-zinc-200
                cursor-pointer select-none transition-colors"
            title="Draw the flows this module hands off to, which other modules own"
        >
            <input
                type="checkbox"
                checked={ showsExtraModules }
                onChange={ ( event ) => setShowsExtraModules( event.target.checked ) }
                className="accent-amber-500 cursor-pointer"
            />
            <Layers className="w-3.5 h-3.5" />
            Extra modules
        </label>
    );
}
