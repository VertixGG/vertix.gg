import process from "process";

import fetch from "cross-fetch";

import { ChannelType, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { Routes } from "discord-api-types/v10";

import MasterChannelManager from "@dynamico/managers/master-channel";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import { GenericInputTextboxUIModal } from "@dynamico/ui/base/generic/generic-input-textbox-ui-modal";

import { guiManager } from "@dynamico/managers";
import { guildUsedSomeBadword } from "@dynamico/utils/guild";
import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

const MIN_INPUT_LENGTH = 1,
    MAX_INPUT_LENGTH = 100;

export default class RenameModal extends GenericInputTextboxUIModal {

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
        await guiManager
            .sendContinuesMessage( interaction, "The channel name must be between 1 and 100 characters long" );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction ) {
        const input = this.getInputFieldValue( interaction );

        if ( ! interaction.channel ) {
            await guiManager.sendContinuesMessage( interaction, "An error has occurred" );
            return;
        }

        switch ( interaction.channel.type ) {
            case ChannelType.GuildText:
            case ChannelType.GuildVoice:
                const usedBadword = await guildUsedSomeBadword( interaction.guildId as string, input );

                if ( usedBadword ) {
                    const embed = new EmbedBuilder()
                        .setTitle( "🙅 Failed to rename your channel" )
                        .setDescription(
                            `The word "${ usedBadword }" has been classified as inappropriate by the server administrator.`
                        )
                        .setColor( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );

                    await guiManager.sendContinuesMessage( interaction, {
                        embeds: [ embed ]
                    } );
                    return;
                }

                const result = await fetch( "https://discord.com/api/v10/" + Routes.channel( interaction.channel.id ), {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bot ${ process.env.DISCORD_BOT_TOKEN }`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify( {
                        name: input
                    } )
                } ).then( ( response ) => response.json() );

                if ( result.retry_after ) {
                    await this.onBeingRateLimited( interaction, result.retry_after );
                    break;
                }

                await this.onSuccessfulRename( interaction, input );
        }
    }

    private async onBeingRateLimited( interaction: ModalSubmitInteraction, retryAfter: number ) {
        const masterChannel = await MasterChannelManager.getInstance().getByDynamicChannel( interaction );

        let message = ".\n";

        if ( masterChannel ) {
            message = `\n\n<#${ masterChannel.id }>\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle( "🙅 You renamed your channel too fast!" )
            .setDescription(
                `Please wait **${ retryAfter.toFixed( 0 ) } seconds** until the next rename or open a new channel:` +
                `${ message }`
            )
            .setColor( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );

        await guiManager.sendContinuesMessage( interaction, {
            embeds: [ embed ]
        } );
    }

    private async onSuccessfulRename( interaction: ModalSubmitInteraction, channelName: string ) {
        const embed = new EmbedBuilder()
            .setTitle( `✏️ Your channel's name has changed to '${ channelName }'` )
            .setColor( 0x32CD32 );

        await guiManager.sendContinuesMessage( interaction, {
            embeds: [ embed ]
        } );
    }
}
