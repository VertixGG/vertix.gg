import fetch from "cross-fetch";

import { ChannelType, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { Routes } from "discord-api-types/v10";

import { GUIManager } from "@dynamico/managers/gui";
import { MasterChannelManager } from "@dynamico/managers/master-channel";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";
import { GenericInputTextboxUIModal } from "@dynamico/ui/_base/generic/generic-input-textbox-ui-modal";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

import { gToken } from "@dynamico/login";

import { guildUsedSomeBadword } from "@dynamico/utils/badwords";

import Logger from "@internal/modules/logger";

const MIN_INPUT_LENGTH = 1,
    MAX_INPUT_LENGTH = 100;

export default class RenameModal extends GenericInputTextboxUIModal {
    protected static dedicatedLogger = new Logger( this );

    public static getName() {
        return "Dynamico/UI/EditDynamicChannel/Modal/Rename";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getInputLabel(): string {
        return "Pick a name for your channel";
    }

    protected getInputPlaceholder(): string {
        if ( this.interaction?.channel?.type === ChannelType.GuildVoice ) {
            return this.interaction?.channel.name;
        }

        return "Channel name";
    }

    protected getModalTitle(): string {
        return "Rename Channel";
    }

    protected getMinLength(): number {
        return MIN_INPUT_LENGTH;
    }

    protected getMaxLength(): number {
        return MAX_INPUT_LENGTH;
    }

    protected async onInputValueInvalid( interaction: ModalSubmitInteraction ) {
        await GUIManager.$
            .sendContinuesMessage( interaction, "The channel name must be between 1 and 100 characters long" );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction ) {
        const input = this.getInputFieldValue( interaction );

        if ( ! interaction.channel ) {
            await GUIManager.$.sendContinuesMessage( interaction, "An error has occurred" );
            return;
        }

        switch ( interaction.channel.type ) {
            case ChannelType.GuildText:
            case ChannelType.GuildVoice:
                const currentChannelName = interaction.channel.name,
                    usedBadword = await guildUsedSomeBadword( interaction.guildId as string, input );

                if ( usedBadword ) {
                    RenameModal.dedicatedLogger.admin( this.onSuccessfulRename,
                        `🙅 Bad words function has been activated  - "${ currentChannelName }" (${ interaction.guild?.name }) (${ interaction.guild?.memberCount })`
                    );

                    const embed = new EmbedBuilder()
                        .setTitle( "🙅 Failed to rename your channel" )
                        .setDescription(
                            `The word "${ usedBadword }" has been classified as inappropriate by the server administrator.`
                        )
                        .setColor( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );

                    await GUIManager.$.sendContinuesMessage( interaction, {
                        embeds: [ embed ]
                    } );
                    return;
                }

                const result = await fetch( "https://discord.com/api/v10/" + Routes.channel( interaction.channel.id ), {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bot ${ gToken }`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify( {
                        name: input
                    } )
                } )
                    .then( ( response ) => response.json() )
                    .catch( ( error ) => RenameModal.dedicatedLogger.error( this.onSuccessfulRename, error ) );

                if ( result.retry_after ) {
                    await this.onBeingRateLimited( interaction, result.retry_after );
                    break;
                }

                await this.onSuccessfulRename( interaction, currentChannelName, input );
        }
    }

    private async onBeingRateLimited( interaction: ModalSubmitInteraction, retryAfter: number ) {
        if ( interaction.channel?.type !== ChannelType.GuildVoice ) {
            return;
        }

        const masterChannel = await MasterChannelManager.$.getByDynamicChannelId( interaction.channel.guildId, interaction.channel.id, false );

        let message = ".\n";

        if ( masterChannel ) {
            message = `\n\n<#${ masterChannel.id }>\n`;
        }

        RenameModal.dedicatedLogger.admin( this.onBeingRateLimited,
            `🙅 Channel rename rate limit has been activated - "${ interaction.channel?.name }" (${ interaction.guild?.name }) (${ interaction.guild?.memberCount })`
        );

        const embed = new EmbedBuilder()
            .setTitle( "🙅 You renamed your channel too fast!" )
            .setDescription(
                `Please wait **${ retryAfter.toFixed( 0 ) } seconds** until the next rename or open a new channel:` +
                `${ message }`
            )
            .setColor( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );

        await GUIManager.$.sendContinuesMessage( interaction, {
            embeds: [ embed ]
        } );
    }

    private async onSuccessfulRename( interaction: ModalSubmitInteraction, oldChannelName: string, newChannelName: string ) {
        RenameModal.dedicatedLogger.admin( this.onSuccessfulRename,
            `✏️ Dynamic Channel name has been changed - "${ oldChannelName } -> "${ newChannelName }" (${ interaction.guild?.name }) (${ interaction.guild?.memberCount })`
        );

        const embed = new EmbedBuilder()
            .setTitle( `✏️ Your channel's name has changed to '${ newChannelName }'` )
            .setColor( 0x32CD32 );

        await GUIManager.$.sendContinuesMessage( interaction, {
            embeds: [ embed ]
        } );
    }
}
