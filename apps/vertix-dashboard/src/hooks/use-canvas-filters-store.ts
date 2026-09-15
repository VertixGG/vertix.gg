import { create } from "zustand";

const EXTRA_MODULES_KEY = "vertix-dashboard-show-extra-modules";
const HIDDEN_SYSTEM_FLOWS_KEY = "vertix-dashboard-hidden-system-flows";
const HIDDEN_EDGE_KINDS_KEY = "vertix-dashboard-hidden-edge-kinds";

/**
 * Whether the editor draws what this module reaches into, as well as what it owns.
 *
 * A module's canvas pulls in the flows it hands off to, and those belong to other modules. Worth
 * seeing when somebody is following a path across - setup handing off to a version's wizard - and
 * worth leaving out the rest of the time, when they are somebody else's screens sitting in the
 * middle of this one.
 *
 * Remembered because it is a way of reading rather than a thing being done: whoever turned it off
 * did not mean only for that one visit.
 */
/**
 * On unless somebody has turned it off.
 *
 * A canvas that quietly left things out would be lying by omission to anybody who had not found the
 * box yet - better to draw everything and let the reader take away what they are not reading.
 * A browser that refuses storage answers the same way, for the same reason.
 */
function readStored( key: string ): boolean {
    try {
        const stored = localStorage.getItem( key );

        return null === stored || "true" === stored;
    } catch {
        return true;
    }
}

function writeStored( key: string, value: boolean ): void {
    try {
        localStorage.setItem( key, String( value ) );
    } catch {
        return;
    }
}

interface CanvasFiltersStore {
    showsExtraModules: boolean;
    setShowsExtraModules: ( value: boolean ) => void;

    /**
     * The routers the reader has put away, by name.
     *
     * Named rather than counted, and kept as the ones turned off rather than the ones left on: a
     * module's routers are not the same from one module to the next, and somebody who hid the
     * command router has said nothing about the control panel.
     */
    hiddenSystemFlows: string[];
    isSystemFlowHidden: ( flowName: string ) => boolean;
    setSystemFlowHidden: ( flowName: string, isHidden: boolean ) => void;

    /**
     * The kinds of line the reader has put away, by how they are drawn.
     *
     * Kept as the ones turned off, like the routers: a canvas that starts by leaving things out
     * would be lying to anybody who has not found the legend yet. Named by appearance rather than
     * by what draws them, because appearance is what the reader is pointing at - they are turning
     * off the thing that looks like this.
     */
    hiddenEdgeKinds: string[];
    isEdgeKindHidden: ( kindKey: string ) => boolean;
    setEdgeKindHidden: ( kindKey: string, isHidden: boolean ) => void;
    showAllEdgeKinds: () => void;
}

function readHiddenList( key: string ): string[] {
    try {
        const stored = localStorage.getItem( key );

        return stored ? JSON.parse( stored ) as string[] : [];
    } catch {
        return [];
    }
}

function writeHiddenList( key: string, names: string[] ): void {
    try {
        localStorage.setItem( key, JSON.stringify( names ) );
    } catch {
        return;
    }
}

export const useCanvasFiltersStore = create<CanvasFiltersStore>( ( set, get ) => ( {
    showsExtraModules: readStored( EXTRA_MODULES_KEY ),

    setShowsExtraModules: ( value ) => {
        writeStored( EXTRA_MODULES_KEY, value );

        set( { showsExtraModules: value } );
    },

    hiddenSystemFlows: readHiddenList( HIDDEN_SYSTEM_FLOWS_KEY ),

    isSystemFlowHidden: ( flowName ) => get().hiddenSystemFlows.includes( flowName ),

    setSystemFlowHidden: ( flowName, isHidden ) => {
        const remaining = get().hiddenSystemFlows.filter( ( name ) => name !== flowName ),
            next = isHidden ? [ ...remaining, flowName ] : remaining;

        writeHiddenList( HIDDEN_SYSTEM_FLOWS_KEY, next );

        set( { hiddenSystemFlows: next } );
    },

    hiddenEdgeKinds: readHiddenList( HIDDEN_EDGE_KINDS_KEY ),

    isEdgeKindHidden: ( kindKey ) => get().hiddenEdgeKinds.includes( kindKey ),

    setEdgeKindHidden: ( kindKey, isHidden ) => {
        const remaining = get().hiddenEdgeKinds.filter( ( key ) => key !== kindKey ),
            next = isHidden ? [ ...remaining, kindKey ] : remaining;

        writeHiddenList( HIDDEN_EDGE_KINDS_KEY, next );

        set( { hiddenEdgeKinds: next } );
    },

    showAllEdgeKinds: () => {
        writeHiddenList( HIDDEN_EDGE_KINDS_KEY, [] );

        set( { hiddenEdgeKinds: [] } );
    }
} ) );
