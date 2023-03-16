import {
    ChannelType,
    EmbedBuilder,
    ModalSubmitInteraction
} from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import { guiManager } from "@dynamico/managers";

import { GenericInputNumberUIModal } from "@dynamico/ui/base/generic/generic-input-number-ui-modal";

const MIN_USER_LIMIT = 0,
    MAX_USER_LIMIT = 99,
    MAX_USER_LIMIT_LENGTH = 2,
    MIN_USER_LIMIT_LENGTH = 1;

export default class UserlimitModal extends GenericInputNumberUIModal {
    public static getName() {
        return "Dynamico/UI/EditDynamicChannel/Modal/Userlimit";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getInputLabel(): string {
        return "Set user limit (0 for unlimited)";
    }

    protected getInputPlaceholder(): string {
        return "0 - 99";
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
        const embed = new EmbedBuilder()
            .setTitle( `🙅 User limit must be between ${ MIN_USER_LIMIT } and ${ MAX_USER_LIMIT }`)
            .setColor(0xFF8C00);

        await guiManager.sendContinuesMessage( interaction, {
            embeds: [ embed ],
        } );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction, input: string ) {
        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            const parsedInput = parseInt( input );

            await interaction.channel.setUserLimit( parsedInput );

            const limitValue = parsedInput === 0 ? "Unlimited" : parsedInput,
                embed = new EmbedBuilder()
                    .setTitle( `✋ Your channel's user limit has changed to ${ limitValue }` )
                    .setColor(0x32CD32);

            await guiManager.sendContinuesMessage( interaction, {
                embeds: [ embed ]
            } );
        }
    }
}
