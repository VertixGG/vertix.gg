/**
 * Links into the interface editor, built in one place.
 *
 * The editor restores itself from the query string - `module` picks the module and `edit` opens a
 * flow for editing - so a link from elsewhere in the dashboard can land on the exact screen it is
 * talking about rather than on an empty editor the admin has to navigate themselves.
 */

/** The flow a generator's channels are drawn by, which is what its settings link across to. */
export const DYNAMIC_CHANNEL_FLOW = {
    MODULE: "VertixBot/UI-V3/Module",
    FLOW: "VertixBot/UI-V3/DynamicChannelFlow",
    /** The component inside that flow whose elements a generator's buttons are. */
    COMPONENT: "VertixBot/UI-V3/DynamicChannel"
} as const;

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
 */
export function dynamicChannelEditorLink( generatorId?: string ): string {
    return interfaceEditorLink( {
        module: DYNAMIC_CHANNEL_FLOW.MODULE,
        flow: DYNAMIC_CHANNEL_FLOW.FLOW,
        generatorId
    } );
}
