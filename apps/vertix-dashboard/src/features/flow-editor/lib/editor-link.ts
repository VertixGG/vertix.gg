import { DYNAMIC_CHANNEL_COMPONENT, isV2Version } from "@vertix.gg/definitions/src/button-ids";

/**
 * Links into the interface editor, built in one place.
 *
 * The editor restores itself from the query string - `module` picks the module and `edit` opens a
 * flow for editing - so a link from elsewhere in the dashboard can land on the exact screen it is
 * talking about rather than on an empty editor the admin has to navigate themselves.
 */

/**
 * The flow a generator's channels are drawn by, which is what its settings link across to.
 *
 * One set per interface version, because a generator keeps the one it was set up with and the two
 * are separate flows in the editor - linking a v2 generator at the v3 flow opened an interface its
 * channels do not draw, and offered buttons it cannot carry.
 */
export const DYNAMIC_CHANNEL_FLOW_V3 = {
    MODULE: "VertixBot/UI-V3/Module",
    FLOW: "VertixBot/UI-V3/DynamicChannelFlow",
    /**
     * The component inside that flow whose elements a generator's buttons are.
     *
     * Taken from the shared map rather than spelled again: it is the name an override is stored
     * against, so a copy of it here that drifted would write overrides nothing ever reads.
     */
    COMPONENT: DYNAMIC_CHANNEL_COMPONENT.V3
} as const;

export const DYNAMIC_CHANNEL_FLOW_V2 = {
    MODULE: "VertixBot/UI-V2/Module",
    FLOW: "VertixBot/UI-V2/DynamicChannelFlow",
    COMPONENT: DYNAMIC_CHANNEL_COMPONENT.V2
} as const;

/** Kept as the v3 name so existing readers that only ever meant v3 go on meaning it. */
export const DYNAMIC_CHANNEL_FLOW = DYNAMIC_CHANNEL_FLOW_V3;

/**
 * Function dynamicChannelFlowFor() :: The flow a generator of this version is drawn by.
 */
export function dynamicChannelFlowFor( version?: string | null ) {
    return isV2Version( version ) ? DYNAMIC_CHANNEL_FLOW_V2 : DYNAMIC_CHANNEL_FLOW_V3;
}

export const INTERFACE_EDITOR_PATH = "/interface-editor";

export interface InterfaceEditorLinkArgs {
    module: string;
    /** The flow to open for editing. Omitted, the editor opens the module and waits. */
    flow?: string;
    /**
     * The generator whose set the editor should arrange. Customization itself is guild wide, so
     * this says which generator's buttons and rows are the ones being looked at.
     */
    generatorId?: string;
}

/**
 * Function interfaceEditorLink() :: The editor, open on a particular flow.
 */
export function interfaceEditorLink( { module, flow, generatorId }: InterfaceEditorLinkArgs ): string {
    const params = new URLSearchParams( { module } );

    if ( flow ) {
        params.set( "edit", flow );
    }

    if ( generatorId ) {
        params.set( "generator", generatorId );
    }

    return `${ INTERFACE_EDITOR_PATH }?${ params.toString() }`;
}

/**
 * Function dynamicChannelEditorLink() :: The interface editor, open on a generator's own channels.
 *
 * `version` is the one stored on the generator - omitted, the link goes to v3, which is what every
 * generator set up since is.
 */
export function dynamicChannelEditorLink( generatorId?: string, version?: string | null ): string {
    const flow = dynamicChannelFlowFor( version );

    return interfaceEditorLink( {
        module: flow.MODULE,
        flow: flow.FLOW,
        generatorId
    } );
}
