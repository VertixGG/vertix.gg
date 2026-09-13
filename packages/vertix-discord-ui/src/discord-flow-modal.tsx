import React from "react";

import { DiscordModal, DiscordInput } from "./discord-modal";

import { getUIModalByName } from "./ui-definitions";

import type { UIModalDefinition } from "./ui-definitions";

export interface DiscordFlowModalProps {
    /** The modal the bot would open, by the name it is exported under. */
    modalName: string;
    /** What each field starts out holding, keyed by the input's name. */
    initialValues?: Readonly<Record<string, string>>;
    /**
     * The hint an empty field carries, keyed by the input's name, where the exported one will not do.
     *
     * Some of them are only decided once a guild is behind them - the rename field offers that
     * guild's name template back - so the bot works them out per reply and the export carries
     * nothing. Given here, this wins; left out, the field keeps whatever was exported with it.
     */
    placeholders?: Readonly<Record<string, string>>;
    /** What was typed, keyed by the input's name. */
    onSubmit: ( values: Readonly<Record<string, string>> ) => void;
    onCancel?: () => void;
    cancelLabel?: string;
    noticeBotName?: string;
}

/**
 * Function DiscordFlowModal() :: The modal the bot would open, drawn from what the bot exported.
 *
 * A flow says a modal is what carries you out of a state and stops there, but the modal itself is
 * exported alongside its component - its title, its fields, their labels, placeholders and bounds.
 * So a demonstration asks for it by name rather than retyping it, and a label that changes in the
 * bot changes here without anybody editing a page.
 */
export function DiscordFlowModal( {
    modalName,
    initialValues,
    placeholders,
    onSubmit,
    onCancel,
    cancelLabel = "Cancel",
    noticeBotName
}: DiscordFlowModalProps ) {
    const [ definition, setDefinition ] = React.useState<UIModalDefinition | null>( null );

    const [ values, setValues ] = React.useState<Readonly<Record<string, string>>>( initialValues ?? {} );

    React.useEffect( () => {
        let cancelled = false;

        void getUIModalByName( modalName ).then( ( loaded ) => {
            if ( !cancelled ) {
                setDefinition( loaded );
            }
        } );

        return () => {
            cancelled = true;
        };
    }, [ modalName ] );

    if ( !definition ) {
        return null;
    }

    return (
        <div className="flex justify-start">
            <DiscordModal
                title={ definition.title }
                cancelLabel={ cancelLabel }
                showNotice={ true }
                noticeBotName={ noticeBotName }
                onSubmit={ () => onSubmit( values ) }
                onCancel={ onCancel }
            >
                { definition.inputs.map( ( input ) => (
                    <DiscordInput
                        key={ input.name }
                        label={ input.label }
                        placeholder={ placeholders?.[ input.name ] ?? input.placeholder }
                        style={ input.style }
                        maxLength={ input.maxLength }
                        value={ values[ input.name ] ?? "" }
                        onChange={ ( value ) => setValues(
                            ( previous ) => ( { ...previous, [ input.name ]: value } )
                        ) }
                    />
                ) ) }
            </DiscordModal>
        </div>
    );
}
