import { ChannelType, Interaction, ModalSubmitInteraction } from "discord.js";

import { Mixin, settings } from "ts-mixer";

import UIBase from "../base/ui-base";

import InputUIBase from "../base/elements/input-ui-base";
import ModalUIBase from "../base/elements/modal-ui-base";

settings.initFunction = "initialize";

export abstract class GenericInputUIModal extends Mixin( UIBase, ModalUIBase, InputUIBase ) {
    public getBuilders( interaction?: Interaction ) {
        return [ this.createInputBuilder() ];
    }

    protected abstract getMinLength(): number;

    protected abstract getMaxLength(): number;

    protected getSubmitCondition( input: string ): boolean {
        const inputLength = input.length;

        return inputLength < this.getMinLength() ||
            inputLength > this.getMaxLength();
    }

    protected createInputBuilder() {
        const inputBuilder = this.getInputBuilder();

        inputBuilder.setPlaceholder( this.getInputPlaceholder() );
        inputBuilder.setLabel( this.getInputLabel() );
        inputBuilder.setStyle( this.getInputStyle() );
        inputBuilder.setCustomId( this.getInputFieldId() );
        inputBuilder.setMinLength( this.getMinLength() );
        inputBuilder.setMaxLength( this.getMaxLength() );

        return inputBuilder;
    }

    protected abstract onInputValueInvalid( interaction: ModalSubmitInteraction ): Promise<void>;

    protected abstract onModalSafeSubmit( interaction: ModalSubmitInteraction, input: string ): Promise<void>;

    protected async onModalSubmit( interaction: ModalSubmitInteraction ) {
        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            const userInput = this.getInputFieldValue( interaction );

            if ( this.getSubmitCondition( userInput ) ) {
                await this.onInputValueInvalid( interaction );
                return;
            }

            await this.onModalSafeSubmit( interaction, userInput );
        }
    }
}
