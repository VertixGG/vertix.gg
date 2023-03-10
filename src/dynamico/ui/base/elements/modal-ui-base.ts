import {
    ActionRowBuilder,
    ComponentBuilder,
    Interaction,
    ModalBuilder,
    ModalSubmitInteraction,
} from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIElement from "@dynamico/ui/base/ui-element";

/**
 * @extends {UIElement}
 */
export default abstract class ModalUIBase {
    protected modalBuilder: ModalBuilder | null = null;

    public interaction?: Interaction;

    private type: E_UI_TYPES = E_UI_TYPES.UNKNOWN;

    public static getName() {
        return "Dynamico/UI/Base/Elements/Modal";
    }

    public async initialize() {
        this.type = ( this.constructor as typeof UIElement ).getType();

        if ( this.type === E_UI_TYPES.STATIC ) {
           await this.buildModal();
        }
    }

    protected abstract getModalTitle(): string;

    protected abstract onModalSubmit( interaction: ModalSubmitInteraction ): Promise<void>;

    protected abstract build( interaction?: Interaction ): Promise<void>;

    protected abstract getModalBuilder( callback: ( interaction: ModalSubmitInteraction ) => Promise<void> ): ModalBuilder;

    protected abstract getBuiltRows(): ActionRowBuilder<any>[];

    protected abstract getBuilders( interaction?: Interaction ): Promise<ComponentBuilder[] | ComponentBuilder[][] | ModalBuilder[]>

    protected async buildModal( interaction?: Interaction ) {
        if ( interaction ) {
            this.interaction = interaction;
        }

        this.modalBuilder = this.getModalBuilder( this.onModalSubmit.bind( this ) );

        this.modalBuilder.setTitle( this.getModalTitle() );

        await this.build( interaction );

        this.modalBuilder.addComponents( this.getBuiltRows() );
    }

    protected async getModal( interaction?: Interaction ): Promise<ModalBuilder> {
        if( this.type === E_UI_TYPES.DYNAMIC ) {
            await this.buildModal( interaction );
        }

        if ( ! this.modalBuilder ) {
            throw new Error( "ModalBuilder is invalid" );
        }

        return this.modalBuilder;
    }
}
