import { ChannelType, EmbedBuilder, ModalSubmitInteraction } from "discord.js";

import { GenericInputTextboxNumberUIModal } from "@dynamico/ui/_base/generic/generic-input-textbox-number-ui-modal";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { GUIManager } from "@dynamico/managers/gui";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

import Logger from "@internal/modules/logger";

const MIN_USER_LIMIT = 0,
    MAX_USER_LIMIT = 99,
    MAX_USER_LIMIT_LENGTH = 2,
    MIN_USER_LIMIT_LENGTH = 1;

export default class UserlimitModal extends GenericInputTextboxNumberUIModal {
    protected static dedicatedLogger = new Logger( this );

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
            .setTitle( `🙅 User limit must be between ${ MIN_USER_LIMIT } and ${ MAX_USER_LIMIT }` )
            .setColor( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );

        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            UserlimitModal.dedicatedLogger.admin( this.onModalSubmit,
                `🤷 User Limit input is incorrect - "${ (interaction).channel?.name }" (${ interaction.guild?.name })`
            );
        }

        await GUIManager.$.sendContinuesMessage( interaction, {
            embeds: [ embed ],
        } );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction, input: string ) {
        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            const parsedInput = parseInt( input );

            UserlimitModal.dedicatedLogger.admin( this.onModalSubmit,
                `✋ Dynamic Channel user limit has been changed from ${ interaction.channel.userLimit } to ${ parsedInput } - "${ interaction.channel.name }" (${ interaction.guild?.name })`
            );

            await interaction.channel.setUserLimit( parsedInput );

            const limitValue = parsedInput === 0 ? "Unlimited" : parsedInput,
                embed = new EmbedBuilder()
                    .setTitle( `✋ Your channel's user limit has changed to ${ limitValue }` )
                    .setColor( 0x32CD32 );

            await GUIManager.$.sendContinuesMessage( interaction, {
                embeds: [ embed ]
            } );
        }
    }
}
