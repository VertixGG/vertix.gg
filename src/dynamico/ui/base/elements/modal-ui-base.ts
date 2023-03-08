import {
    ActionRowBuilder,
    ComponentBuilder,
    Interaction,
    ModalBuilder,
    ModalSubmitInteraction,
} from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIBase from "@dynamico/ui/base/ui-base";

/**
 * @extends {UIBase}
 */
export default abstract class ModalUIBase {
    protected modalBuilder: ModalBuilder | null = null;

    public interaction?: Interaction;

    private type: E_UI_TYPES = E_UI_TYPES.UNKNOWN;

    public static getName() {
        return "Dynamico/UI/Elements/ModalUIBase";
    }

    initialize() {
        this.type = ( this.constructor as typeof UIBase ).getType();

        if ( this.type === E_UI_TYPES.STATIC ) {
            this.buildModal();
        }
    }

    protected abstract getModalTitle(): string;

    protected abstract onModalSubmit( interaction: ModalSubmitInteraction ): Promise<void>;

    protected abstract build( interaction?: Interaction ): void;

    protected abstract getModalBuilder( callback: ( interaction: ModalSubmitInteraction ) => Promise<void> ): ModalBuilder;

    protected abstract getBuiltRows(): ActionRowBuilder<any>[];

    protected abstract getBuilders( interaction?: Interaction ): ComponentBuilder[] | ComponentBuilder[][] | ModalBuilder[]

    protected buildModal( interaction?: Interaction ) {
        if ( interaction ) {
            this.interaction = interaction;
        }

        this.modalBuilder = this.getModalBuilder( this.onModalSubmit.bind( this ) );

        this.modalBuilder.setTitle( this.getModalTitle() );

        this.build( interaction );

        this.modalBuilder.addComponents( this.getBuiltRows() );
    }

    protected getModal( interaction?: Interaction ): ModalBuilder {
        if( this.type === E_UI_TYPES.DYNAMIC ) {
            this.buildModal( interaction );
        }

        if ( ! this.modalBuilder ) {
            throw new Error( "ModalBuilder is invalid" );
        }

        return this.modalBuilder;
    }
}
