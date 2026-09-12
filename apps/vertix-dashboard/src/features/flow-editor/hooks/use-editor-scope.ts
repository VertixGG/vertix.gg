import { useEffect } from "react";
import { create } from "zustand";

import { UI_VERSION } from "@vertix.gg/utils/src/button-ids";

import { useEditorGenerator } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-editor-generator";

import type { DynamicMasterChannelInfo } from "@vertix.gg/dashboard/src/features/generators/types";

/**
 * What an edit in the interface editor is being written about.
 *
 * Wording and artwork used to be the whole server's, which is right until a guild runs more than
 * one generator: the same component draws the channels of all of them, and an admin who worded a
 * gaming generator does not mean it about the study one beside it. So an edit can now name a
 * generator, and the one it names is held here for the screen - the canvas that previews it, the
 * sidebar that edits it and the command that saves it all have to mean the same one.
 *
 * Null is the whole server, which is what every edit was before this and what the editor still
 * opens on.
 */
interface EditorScopeState {
    /** The generator's discord id, which is what an override is stored against. Null is the guild. */
    masterChannelId: string | null;
    /**
     * Whether the scope above is something the admin said, as opposed to where the screen started.
     *
     * Kept apart from the value because "server wide" is a real choice and looks identical to
     * never having chosen. Without the distinction, an admin who deliberately widened an edit back
     * to the whole server would have the link they arrived by narrow it again underneath them.
     */
    isChosen: boolean;
    setMasterChannelId: ( masterChannelId: string | null ) => void;
    /** The scope a link arrived with, which a later choice overrides. */
    suggestMasterChannelId: ( masterChannelId: string | null ) => void;
    forget: () => void;
}

export const useEditorScopeStore = create<EditorScopeState>( ( set ) => ( {
    masterChannelId: null,
    isChosen: false,
    setMasterChannelId: ( masterChannelId ) => set( { masterChannelId, isChosen: true } ),
    suggestMasterChannelId: ( masterChannelId ) => set( { masterChannelId } ),
    forget: () => set( { masterChannelId: null, isChosen: false } )
} ) );

/**
 * Function moduleVersion() :: The interface version a module is, or null when it is neither.
 *
 * `UI-General` is the null case and is meant to be: its components are the ones shared by both
 * versions and drawn outside any generator - a setup wizard, a yes/no confirmation, the notice
 * shown when there is no dynamic channel to manage. Nothing there belongs to a generator, so there
 * is nothing to narrow an override to and the whole server is the only honest answer.
 */
export function moduleVersion( moduleName: string | null | undefined ): string | null {
    if ( ! moduleName ) {
        return null;
    }

    if ( moduleName.includes( "UI-V2" ) ) {
        return UI_VERSION.V2;
    }

    return moduleName.includes( "UI-V3" ) ? UI_VERSION.V3 : null;
}

/**
 * Function useEditorScope() :: Which generators this module can be edited for, and which is chosen.
 *
 * Only the generators of the module's own interface version are offered. A v2 generator's channels
 * are not drawn by the v3 components, so an override written about one from the other module would
 * name a pairing that never renders - it would simply never appear, with nothing to say why.
 *
 * A module that is neither version - `UI-General` - has no generators to offer, and the editor
 * stays as it was: server wide, with no scope control drawn at all.
 */
export function useEditorScope( selectedModule: string | null | undefined ) {
    // `linked` is the generator the url names - which is how the editor is reached from a
    // generator's own settings, rather than from the module list. `selectGenerator` writes that
    // same url param, which is what the arrangement and the preview read.
    const { generators, selected: linked, select: selectGenerator } = useEditorGenerator();

    const masterChannelId = useEditorScopeStore( ( state ) => state.masterChannelId );
    const isChosen = useEditorScopeStore( ( state ) => state.isChosen );
    const setMasterChannelId = useEditorScopeStore( ( state ) => state.setMasterChannelId );
    const suggestMasterChannelId = useEditorScopeStore( ( state ) => state.suggestMasterChannelId );
    const forget = useEditorScopeStore( ( state ) => state.forget );

    const version = moduleVersion( selectedModule );

    const available: DynamicMasterChannelInfo[] = version
        ? generators.filter( ( generator ) => generator.version === version )
        : [];

    const selected = available.find( ( generator ) => generator.channelId === masterChannelId ) ?? null;

    // A generator chosen under one module is not a choice under the next - switching to the other
    // version, or away from both, would otherwise leave an edit being written about a generator
    // the screen is no longer showing. Forgotten rather than cleared, so the next module can take
    // its own default from the link.
    useEffect( () => {
        if ( masterChannelId && ! available.some( ( generator ) => generator.channelId === masterChannelId ) ) {
            forget();
            selectGenerator( null );
        }
    }, [ masterChannelId, available, forget, selectGenerator ] );

    // Arriving from a generator's settings, that generator is what the admin came here about - so
    // the editor opens on it rather than on the whole server, which is a wider thing than they
    // asked for and would quietly reword every other generator too. Only until they say otherwise.
    const linkedChannelId = linked && available.some( ( generator ) => generator.id === linked.id )
        ? linked.channelId
        : null;

    useEffect( () => {
        if ( ! isChosen && linkedChannelId && linkedChannelId !== masterChannelId ) {
            suggestMasterChannelId( linkedChannelId );
        }
    }, [ isChosen, linkedChannelId, masterChannelId, suggestMasterChannelId ] );

    /**
     * Function select() :: Look at the whole server, or at one generator.
     *
     * The one act, because they were never two questions. A generator's buttons and a generator's
     * wording are the same generator's, and letting them be chosen apart meant the screen could
     * show one generator's buttons underneath another scope's words - a channel that exists
     * nowhere, presented as a preview of what a member will see.
     */
    const select = ( channelId: string | null ) => {
        setMasterChannelId( channelId );

        const generator = channelId
            ? available.find( ( candidate ) => candidate.channelId === channelId )
            : null;

        selectGenerator( generator?.id ?? null );
    };

    return {
        /** Whether this module is one an edit can be narrowed on at all. */
        isScopable: Boolean( version ) && available.length > 0,
        version,
        available,
        selected,
        masterChannelId: selected ? masterChannelId : null,
        select
    };
}
