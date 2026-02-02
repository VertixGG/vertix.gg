import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelClearChatComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-component";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { APIEmbed } from "discord.js";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
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
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatSuccess",
                navigationType: "silent", // Success uses custom channel.send(), not ephemeral
                previewDefaultVars: { ownerDisplayName: "Owner", totalMessages: "5" }
            } )
            .addState( "NothingToClear", {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatNothingToClear",
                navigationType: "ephemeral"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatError",
                navigationType: "ephemeral"
            } )
            .addTransition( "ClearSuccess", {
                from: "Default",
                to: "Success",
                mutations: [
                    { type: "set", path: [ "ownerDisplayName" ] },
                    { type: "set", path: [ "totalMessages" ] }
                ]
            } )
            .addTransition( "ClearNothing", { from: "Default", to: "NothingToClear" } )
            .addTransition( "ClearError", { from: "Default", to: "Error" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelClearChatButton",
                "ClearSuccess",
                async( context, interaction ) => {
                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.clearChat( interaction, interaction.channel );

                    switch ( result?.code ) {
                        case "success":
                            // Custom success handling - sends message to channel
                            const messages = await interaction.channel.messages.fetch();
                            for ( const message of messages.values() ) {
                                if ( message.embeds.length === 0 ) continue;
                                const embed = message.embeds[ 0 ];
                                if ( embed?.title?.includes( "🧹" ) ) {
                                    await message.delete();
                                }
                            }

                            context.getComponent().switchEmbedsGroup(
                                "VertixBot/UI-V3/DynamicChannelClearChatSuccessEmbedGroup"
                            );
                            const component = context.getComponent();
                            await component.build( {
                                ownerDisplayName: await guildGetMemberDisplayName( interaction.channel.guild, interaction.user.id ),
                                totalMessages: result.deletedCount
                            } );
                            const schema = await component.toSchema();
                            if ( schema.entities?.embeds ) {
                                await interaction.channel.send( {
                                    embeds: schema.entities.embeds as unknown as APIEmbed[]
                                } );
                            }
                            // Silent transition - just for tracking
                            await context.triggerTransition( "ClearSuccess", interaction, {
                                ownerDisplayName: await guildGetMemberDisplayName( interaction.channel.guild, interaction.user.id ),
                                totalMessages: result.deletedCount
                            } );
                            return;

                        case "nothing-to-delete":
                            context.getComponent().switchEmbedsGroup(
                                "VertixBot/UI-V3/DynamicChannelClearChatNothingToClearEmbedGroup"
                            );
                            await context.triggerTransition( "ClearNothing", interaction );
                            break;

                        default:
                            context.getComponent().switchEmbedsGroup(
                                "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
                            );
                            await context.triggerTransition( "ClearError", interaction );
                    }
                }
            );
    } )
    .getStartArgs( async( _context, _channel, argsFromManager ) => ( {
        ownerDisplayName: argsFromManager?.ownerDisplayName ?? "",
        totalMessages: argsFromManager?.totalMessages ?? 0
    } ) )
    .getReplyArgs( async() => ( {} ) )
    .build();

export { DynamicChannelClearChatAdapter };
