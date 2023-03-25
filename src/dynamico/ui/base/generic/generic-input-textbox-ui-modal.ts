import { Interaction, ModalSubmitInteraction } from "discord.js";
import { Mixin, settings } from "ts-mixer";

import InputUIBase from "../elements/input-ui-base";
import ModalUIBase from "../elements/modal-ui-base";
import UIElement from "../ui-element";

settings.initFunction = "initialize";

export abstract class GenericInputTextboxUIModal extends Mixin( UIElement, ModalUIBase, InputUIBase ) {
    protected async getBuilders( interaction?: Interaction, args?: any ) {
        return [ await this.createInputBuilder( interaction, args ) ];
    }

    protected abstract getMinLength(): number;

    protected abstract getMaxLength(): number;

    protected async getValue( interaction?: Interaction, args?: any ): Promise<string | null> {
        return null;
    }

    protected getSubmitCondition( input: string ): boolean {
        const minLength = this.getMinLength(),
            maxLength = this.getMaxLength();

        if ( ! minLength && ! maxLength ) {
            return false;
        }

        const inputLength = input.length;

        return inputLength < this.getMinLength() ||
            inputLength > this.getMaxLength();
    }

    protected async createInputBuilder( interaction?: Interaction, args?: any ) {
        const inputBuilder = this.getInputBuilder(),
            minLength = this.getMinLength(),
            maxLength = this.getMaxLength(),
            value = await this.getValue( interaction, args );

        inputBuilder.setPlaceholder( this.getInputPlaceholder() );
        inputBuilder.setLabel( this.getInputLabel() );
        inputBuilder.setStyle( this.getInputStyle() );
        inputBuilder.setCustomId( this.getInputFieldId() );

        if ( minLength ) {
            inputBuilder.setMinLength( minLength );
        }

        if ( maxLength ) {
            inputBuilder.setMaxLength( maxLength );
        }

        if ( ! minLength && ! maxLength ) {
            inputBuilder.setRequired( false );
        }

        if ( value ) {
            inputBuilder.setValue( value );
        }

        return inputBuilder;
    }

    protected abstract onInputValueInvalid( interaction: ModalSubmitInteraction ): Promise<void>;

    protected abstract onModalSafeSubmit( interaction: ModalSubmitInteraction, input: string ): Promise<void>;

    protected async onModalSubmit( interaction: ModalSubmitInteraction ) {
        const userInput = this.getInputFieldValue( interaction );

        if ( this.getSubmitCondition( userInput ) ) {
            await this.onInputValueInvalid( interaction );
            return;
        }

        await this.onModalSafeSubmit( interaction, userInput );
    }
}
