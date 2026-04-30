import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelMetaClearChatComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-component";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

async function onClearChatButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const result = await dynamicChannelService.clearChat( interaction, interaction.channel );

    switch ( result?.code ) {
        case "success":
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

            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaClearChatSuccess", {
                ownerDisplayName: await guildGetMemberDisplayName( interaction.channel.guild, interaction.user.id ),
                totalMessages: result.deletedCount
            } );

            return;

        case "nothing-to-delete":
            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaClearChatNothingToClear", {} );
            break;

        default:
            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaClearChatError", {} );
    }
}

const DynamicChannelMetaClearChatAdapter = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V2/DynamicChannelMetaClearChatAdapter"
)
    .setComponent( DynamicChannelMetaClearChatComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelMetaClearChatButtonGroup"
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaClearChatSuccess",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaClearChatSuccessEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { ownerDisplayName: "Owner", totalMessages: "5" }
            } )
            .addState( "NothingToClear", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaClearChatNothingToClear",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaClearChatNothingToClearEmbedGroup",
                navigationType: "ephemeral"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaClearChatError",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup",
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
            .bindButton( "VertixBot/UI-V2/DynamicChannelMetaClearChatButton", "ClearSuccess", onClearChatButtonClicked );
    } )
    .getStartArgs( async( context, channel, argsFromManager ) => {
        return {
            ownerDisplayName: argsFromManager?.ownerDisplayName,
            totalMessages: argsFromManager?.totalMessages
        };
    } )
    .getReplyArgs( async() => ( {} ) )
    .build();

export { DynamicChannelMetaClearChatAdapter };
