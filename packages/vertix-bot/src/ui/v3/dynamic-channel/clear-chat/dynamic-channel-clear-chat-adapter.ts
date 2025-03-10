import { DynamicChannelClearChatComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-component";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import { DynamicChannelAdapterBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { VoiceChannel } from "discord.js";

export class DynamicChannelClearChatAdapter extends DynamicChannelAdapterBase {
    public static getName () {
        return "Vertix/UI-V3/DynamicChannelClearChatAdapter";
    }

    public static getComponent () {
        return DynamicChannelClearChatComponent;
    }

    protected getStartArgs ( channel: VoiceChannel, argsFromManager: UIArgs ) {
        return {
            ownerDisplayName: argsFromManager.ownerDisplayName,
            totalMessages: argsFromManager.totalMessages
        };
    }

    protected getReplyArgs () {
        return {};
    }

    protected onEntityMap () {
        this.bindButton( "Vertix/UI-V3/DynamicChannelClearChatButton", this.onClearChatButtonClicked );
    }

    private async onClearChatButtonClicked ( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const result = await this.dynamicChannelService.clearChat( interaction, interaction.channel );

        switch ( result?.code ) {
            case "success":
                await interaction.deferUpdate();

                this.getComponent().switchEmbedsGroup( "Vertix/UI-V3/DynamicChannelClearChatSuccessEmbedGroup" );

                // Search embeds with "🧹" in title and delete them.
                const messages = await interaction.channel.messages.fetch();

                for ( const message of messages.values() ) {
                    if ( message.embeds.length === 0 ) {
                        continue;
                    }

                    const embed = message.embeds[ 0 ];

                    // TODO: Find a better way to do this.
                    if ( embed?.title?.includes( "🧹" ) ) {
                        await message.delete();
                    }
                }

                await this.send( interaction.channel, {
                    ownerDisplayName: await guildGetMemberDisplayName( interaction.channel.guild, interaction.user.id ),
                    totalMessages: result.deletedCount
                } );

                return; // # NOTE: return is required here, otherwise the code below will be executed.

            case "nothing-to-delete":
                this.getComponent().switchEmbedsGroup( "Vertix/UI-V3/DynamicChannelClearChatNothingToClearEmbedGroup" );
                break;

            default:
                this.getComponent().switchEmbedsGroup( "VertixBot/UI-General/SomethingWentWrongEmbedGroup" );
        }

        await this.ephemeral( interaction );
    }
}
