import { VoiceChannel } from "discord.js";

import { UIDefaultButtonChannelVoiceInteraction } from "@vertix/ui-v2/_base/ui-interaction-interfaces";
import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import { DynamicChannelAdapterBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-adapter-base";

import {
    DynamicChannelMetaClearChatComponent
} from "@vertix/ui-v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-component";

import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";

import { guildGetMemberDisplayName } from "@vertix/utils/guild";

export class DynamicChannelMetaClearChatAdapter extends DynamicChannelAdapterBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaClearChatAdapter";
    }

    public static getComponent() {
        return DynamicChannelMetaClearChatComponent;
    }

    protected getStartArgs( channel: VoiceChannel, argsFromManager: UIArgs ) {
        return {
            ownerDisplayName: argsFromManager.ownerDisplayName,
            totalMessages: argsFromManager.totalMessages,
        };
    }

    protected getReplyArgs() {
        return {};
    }

    protected onEntityMap() {
        this.bindButton( "Vertix/UI-V2/DynamicChannelMetaClearChatButton", this.onClearChatButtonClicked );
    }

    private async onClearChatButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const result = await DynamicChannelManager.$.clearChat( interaction.channel );

        switch ( result?.code ) {
            case "success":
                await interaction.deferUpdate();

                this.getComponent().switchEmbedsGroup( "Vertix/UI-V2/DynamicChannelMetaClearChatSuccessEmbedGroup" );

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
                    totalMessages: result.deletedCount,
                } );

                return; // # NOTE: return is required here, otherwise the code below will be executed.

            case "nothing-to-delete":
                this.getComponent().switchEmbedsGroup( "Vertix/UI-V2/DynamicChannelMetaClearChatNothingToClearEmbedGroup" );
                break;

            default:
                this.getComponent().switchEmbedsGroup( "Vertix/UI-V2/SomethingWentWrongEmbedGroup" );
        }

        await this.ephemeral( interaction );
    }
}

