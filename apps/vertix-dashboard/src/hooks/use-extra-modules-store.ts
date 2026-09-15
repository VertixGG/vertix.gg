import { create } from "zustand";

const STORAGE_KEY = "vertix-dashboard-show-extra-modules";

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
function readStored(): boolean {
    try {
        const stored = localStorage.getItem( STORAGE_KEY );

        return null === stored || "true" === stored;
    } catch {
        return true;
    }
}

function writeStored( value: boolean ): void {
    try {
        localStorage.setItem( STORAGE_KEY, String( value ) );
    } catch {
        return;
    }
}

interface ExtraModulesStore {
    showsExtraModules: boolean;
    setShowsExtraModules: ( value: boolean ) => void;
}

export const useExtraModulesStore = create<ExtraModulesStore>( ( set ) => ( {
    showsExtraModules: readStored(),

    setShowsExtraModules: ( value ) => {
        writeStored( value );

        set( { showsExtraModules: value } );
    }
} ) );
