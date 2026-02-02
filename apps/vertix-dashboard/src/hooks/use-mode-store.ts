import zCore from "@zenflux/core";
import { create } from "zustand";

const logger = zCore.modules.createLogger( "use-mode-store" );

export const enum AppMode {
    NEUTRAL = 0, // 0000
    DEBUG_MODE = 1 << 0,
    EDIT_NODE = 1 << 1,
}

interface ModeStore {
    modes : number;
    setMode : ( mode : AppMode ) => void;
    addMode : ( mode : AppMode ) => void;
    removeMode : ( mode : AppMode ) => void;
    toggleMode : ( mode : AppMode ) => void;
    clearModes : () => void;
    isMode : ( mode : AppMode ) => boolean;
    isOnlyMode : ( mode : AppMode ) => boolean;
    isModes : ( modes : AppMode[] ) => boolean;
    hasAnyMode : ( modes : AppMode[] ) => boolean;
}

const onAfterSet = ( _modes : number ) => {
};

// Helper function to log mode changes when in debug mode
function logModeChange( oldModes : number, newModes : number ) {
    if ( import.meta.env.MODE === "development" ) {
        if ( newModes & AppMode.DEBUG_MODE ) {
            const getActiveModesNames = ( modes : number ) => {
                const activeNames : string[] = [];
                if ( modes & AppMode.EDIT_NODE ) activeNames.push( "EDIT_NODE" );
                if ( modes & AppMode.DEBUG_MODE ) activeNames.push( "DEBUG_MODE" );
                return activeNames.length ? activeNames.join( " | " ) : "NEUTRAL";
            };

            logger.debug( logModeChange, `Mode Change: ${ getActiveModesNames( oldModes ) } -> ${ getActiveModesNames( newModes ) }` );
        }
    }
}

export const useModeStore = create<ModeStore>( ( set, get ) => {
    return {
        modes: AppMode.DEBUG_MODE,

        setMode: ( mode : AppMode ) => {
            const oldModes = get().modes;
            set( { modes: mode } );
            onAfterSet( mode );
            logModeChange( oldModes, mode );
        },

        addMode: ( mode : AppMode ) => {
            const oldModes = get().modes;
            const newModes = oldModes | mode;
            set( { modes: newModes } );
            onAfterSet( newModes );
            logModeChange( oldModes, newModes );
        },

        removeMode: ( mode : AppMode ) => {
            const oldModes = get().modes;
            const newModes = oldModes & ~mode;
            set( { modes: newModes } );
            onAfterSet( newModes );
            logModeChange( oldModes, newModes );
        },

        toggleMode: ( mode : AppMode ) => {
            const oldModes = get().modes;
            const newModes = oldModes ^ mode;
            set( { modes: newModes } );
            onAfterSet( newModes );
            logModeChange( oldModes, newModes );
        },

        clearModes: () => {
            const oldModes = get().modes;
            set( { modes: AppMode.NEUTRAL } );
            onAfterSet( AppMode.NEUTRAL );
            logModeChange( oldModes, AppMode.NEUTRAL );
        },

        // Check if a specific mode is active (can be along with others)
        isMode: ( mode : AppMode ) => {
            return ( get().modes & mode ) === mode;
        },

        // Check if ONLY this mode is active (no other modes)
        isOnlyMode: ( mode : AppMode ) => {
            return get().modes === mode;
        },

        // Check if ALL specified modes are active (can have additional modes)
        isModes: ( modes : AppMode[] ) => {
            const combinedModes = modes.reduce( ( acc, mode ) => acc | mode, 0 );
            return ( get().modes & combinedModes ) === combinedModes;
        },

        // Check if ANY of the specified modes are active
        hasAnyMode: ( modes : AppMode[] ) => {
            const combinedModes = modes.reduce( ( acc, mode ) => acc | mode, 0 );
            return ( get().modes & combinedModes ) !== 0;
        },
    };
} );
