import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelClearChatComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-component";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { UIDefaultButtonChannelVoiceInteraction, UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

const CLEAR_CHAT_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelClearChatButtonGroup"
    },
    "VertixBot/UI-V3/DynamicChannelClearChatSuccess": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelClearChatSuccessEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelClearChatNothingToClear": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelClearChatNothingToClearEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelClearChatError": {
        embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
    }
} as const;

const DynamicChannelClearChatAdapter = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelClearChatAdapter"
)
    .setComponent( DynamicChannelClearChatComponent )
    .setExecutionSteps( CLEAR_CHAT_STEPS )
    .getStartArgs( async( _context, _channel, argsFromManager ) => ( {
        ownerDisplayName: argsFromManager?.ownerDisplayName ?? "",
        totalMessages: argsFromManager?.totalMessages ?? 0
    } ) )
    .getReplyArgs( async() => ( {} ) )
    .onEntityMap( async( { bindButton } ) => {
        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelClearChatButton",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultButtonChannelVoiceInteraction;
                const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                const result = await dynamicChannelService.clearChat( voiceInteraction, voiceInteraction.channel );

                switch ( result?.code ) {
                    case "success":
                        context.getComponent().switchEmbedsGroup(
                            "VertixBot/UI-V3/DynamicChannelClearChatSuccessEmbedGroup"
                        );

                        const messages = await voiceInteraction.channel.messages.fetch();
                        for ( const message of messages.values() ) {
                            if ( message.embeds.length === 0 ) continue;
                            const embed = message.embeds[ 0 ];
                            if ( embed?.title?.includes( "🧹" ) ) {
                                await message.delete();
                            }
                        }

                        const component = context.getComponent();
                        await component.build( {
                            ownerDisplayName: await guildGetMemberDisplayName( voiceInteraction.channel.guild, voiceInteraction.user.id ),
                            totalMessages: result.deletedCount
                        } );
                        const schema = await component.toSchema();
                        if ( schema.entities?.embeds ) {
                            await voiceInteraction.channel.send( {
                                embeds: schema.entities.embeds
                            } );
                        }
                        return;

                    case "nothing-to-delete":
                        context.getComponent().switchEmbedsGroup(
                            "VertixBot/UI-V3/DynamicChannelClearChatNothingToClearEmbedGroup"
                        );
                        break;

                    default:
                        context.getComponent().switchEmbedsGroup(
                            "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
                        );
                }

                await context.ephemeral( voiceInteraction );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelClearChatFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearSuccess",
                        mutations: [
                            { type: "set", path: [ "ownerDisplayName" ] },
                            { type: "set", path: [ "totalMessages" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Success",
                            executionStep: "VertixBot/UI-V3/DynamicChannelClearChatSuccess"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelClearChatFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearNothing",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/NothingToClear",
                            executionStep: "VertixBot/UI-V3/DynamicChannelClearChatNothingToClear"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelClearChatFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearError",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Error",
                            executionStep: "VertixBot/UI-V3/DynamicChannelClearChatError"
                        }
                    }
                ]
            }
        );
    } )
    .build();

export { DynamicChannelClearChatAdapter };
