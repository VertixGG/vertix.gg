import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelClearChatComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-component";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const CLEAR_CHAT_STEPS = {
    default: {}
} as const;

const DynamicChannelClearChatAdapter = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelClearChatAdapter"
)
    .setComponent( DynamicChannelClearChatComponent )
    .setExecutionSteps( CLEAR_CHAT_STEPS )
    .getStartArgs( async( _context, _channel, argsFromManager ) => ( {
        ownerDisplayName: argsFromManager.ownerDisplayName,
        totalMessages: argsFromManager.totalMessages
    } ) )
    .getReplyArgs( async() => ( {} ) )
    .onEntityMap( async( { bindButton } ) => {
        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelClearChatButton",
            async( context, interaction ) => {
                const dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );
                const result = await dynamicChannelService.clearChat( interaction, interaction.channel );

                switch ( result?.code ) {
                    case "success":
                        DynamicChannelClearChatComponent.switchEmbedsGroup(
                            "VertixBot/UI-V3/DynamicChannelClearChatSuccessEmbedGroup"
                        );

                        const messages = await interaction.channel.messages.fetch();
                        for ( const message of messages.values() ) {
                            if ( message.embeds.length === 0 ) continue;
                            const embed = message.embeds[ 0 ];
                            if ( embed?.title?.includes( "🧹" ) ) {
                                await message.delete();
                            }
                        }

                        await context.send( interaction.channel, {
                            ownerDisplayName: await guildGetMemberDisplayName( interaction.channel.guild, interaction.user.id ),
                            totalMessages: result.deletedCount
                        } );
                        return;

                    case "nothing-to-delete":
                        DynamicChannelClearChatComponent.switchEmbedsGroup(
                            "VertixBot/UI-V3/DynamicChannelClearChatNothingToClearEmbedGroup"
                        );
                        break;

                    default:
                        DynamicChannelClearChatComponent.switchEmbedsGroup(
                            "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
                        );
                }

                await context.ephemeral( interaction );
            }
        );
    } )
    .build();

export { DynamicChannelClearChatAdapter };
