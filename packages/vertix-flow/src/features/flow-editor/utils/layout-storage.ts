import { STORAGE_KEYS } from "@vertix.gg/flow/src/features/flow-editor/utils/constants";

const isValidLayoutSizes = ( sizes: unknown ): sizes is number[] => {
    return (
        Array.isArray( sizes )
        && sizes.length === 3
        && sizes.every( ( s ) => typeof s === "number" && s > 0 && s < 100 )
        && sizes.reduce( ( sum, s ) => sum + s, 0 ) === 100
    );
};

// Function to save layout sizes to local storage
export const saveLayoutToLocalStorage = ( sizes: number[] ): void => {
    try {
        localStorage.setItem( STORAGE_KEYS.FLOW_EDITOR_LAYOUT, JSON.stringify( sizes ) );
    } catch ( error ) {
        console.error( "[Layout] Error saving layout to local storage:", error );
    }
};

// Function to load layout sizes from local storage
export const loadLayoutFromLocalStorage = (): number[] | null => {
    try {
        const savedLayout = localStorage.getItem( STORAGE_KEYS.FLOW_EDITOR_LAYOUT );
        if ( savedLayout ) {
            const parsedSizes = JSON.parse( savedLayout );
            if ( isValidLayoutSizes( parsedSizes ) ) {
                return parsedSizes;
            }
            localStorage.removeItem( STORAGE_KEYS.FLOW_EDITOR_LAYOUT ); // Clear invalid data
        }
    } catch ( error ) {
        console.error( "[Layout] Error loading layout from local storage:", error );
    }
    return null;
};
