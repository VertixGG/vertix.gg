import { ChannelType, ModalSubmitInteraction, TextInputStyle } from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import { GenericInputNumberUIModal } from "@dynamico/ui/generic/generic-input-number-ui-modal";

const MIN_USER_LIMIT = 0,
    MAX_USER_LIMIT = 99,
    MAX_USER_LIMIT_LENGTH = 2,
    MIN_USER_LIMIT_LENGTH = 1;

export default class UserlimitChannelModalUI extends GenericInputNumberUIModal {
    public static getName() {
        return "Dynamico/UI/EditChannel/Modals/UserlimitChannelModal";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getInputLabel(): string {
        return "How much?";
    }

    protected getInputPlaceholder(): string {
        return "Place limit";
    }

    protected getModalTitle(): string {
        return "Set user limit";
    }

    protected getMinLength(): number {
        return MIN_USER_LIMIT_LENGTH;
    }

    protected getMaxLength(): number {
        return MAX_USER_LIMIT_LENGTH;
    }

    protected getMinValue(): number {
        return MIN_USER_LIMIT;
    }

    protected getMaxValue(): number {
        return MAX_USER_LIMIT;
    }

    protected async onInputValueInvalid( interaction: ModalSubmitInteraction ) {
        await interaction.reply( {
            content: `User limit must be between ${ MIN_USER_LIMIT } and ${ MAX_USER_LIMIT }`,
            ephemeral: true,
        } );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction, input: string ) {
        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            const parsedInput = parseInt( input );

            await interaction.channel.setUserLimit( parsedInput );

            if ( parsedInput === 0 ) {
                await interaction.reply( {
                    content: "Set user limit to Unlimited",
                    ephemeral: true,
                } );
            } else {
                await interaction.reply( {
                    content: `Set user limit to ${ parsedInput }`,
                    ephemeral: true,
                } );
            }
        }
    }
}
