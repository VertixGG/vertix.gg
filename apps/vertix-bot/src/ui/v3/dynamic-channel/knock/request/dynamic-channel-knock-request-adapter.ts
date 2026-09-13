import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelKnockRequestComponent
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/request/dynamic-channel-knock-request-component";

import { DynamicChannelKnockManager } from "@vertix.gg/bot/src/managers/dynamic-channel-knock-manager";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { GuildMember, VoiceChannel } from "discord.js";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type DirectMessageService from "@vertix.gg/bot/src/services/direct-message-service";

/**
 * Function notifyKnocker() :: Tells whoever knocked how the owner answered.
 *
 * Silence would leave them waiting on a channel they may never be let into, so a denial is
 * reported as plainly as an acceptance - without saying who denied it, since that is the owner's
 * business rather than an invitation to argue.
 */
async function notifyKnocker( channel: VoiceChannel, knockerId: string, isAllowed: boolean ) {
    const directMessageService =
        ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage", { silent: true } );

    if ( ! directMessageService ) {
        return;
    }

    const content = isAllowed
        ? `🚪 You were let into **${ channel.name }** in **${ channel.guild.name }**.\n${ channel.url }`
        : `🚪 Your request to join **${ channel.name }** in **${ channel.guild.name }** was not accepted.`;

    await directMessageService.sendToUser( knockerId, { content } );
}

function getKnocker( interaction: UIDefaultButtonChannelVoiceInteraction, knockerId: string | undefined ) {
    if ( ! knockerId ) {
        return null;
    }

    return interaction.guild.members.cache.get( knockerId ) ?? null;
}

async function answer(
    interaction: UIDefaultButtonChannelVoiceInteraction,
    knocker: GuildMember,
    isAllowed: boolean
) {
    DynamicChannelKnockManager.$.resolve( interaction.channel.id, knocker.id );

    if ( isAllowed ) {
        const dynamicChannelService =
            ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        await dynamicChannelService.addUserAccess(
            interaction,
            interaction.channel,
            knocker,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS
        );
    }

    await notifyKnocker( interaction.channel, knocker.id, isAllowed );
}

const DynamicChannelKnockRequestAdapter = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelKnockRequestAdapter"
)
    .setComponent( DynamicChannelKnockRequestComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { knockerId: "123456789", knockerDisplayName: "User" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockRequestEmbedGroup",
                elementsGroup: "VertixBot/UI-General/YesNoElementsGroup"
            } )
            .addState( "Answered", {
                executionStep: "VertixBot/UI-V3/DynamicChannelKnockAnswered",
                navigationType: "editReply",
                // `answerDisplay` is one of the embed's own two sentences, named by the token it
                // maps: which one applies is a function of the answer, and a preview says which
                // rather than repeating the words.
                previewDefaultVars: { knockerDisplayName: "User", answerDisplay: "{answerAllowed}" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockAnsweredEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelKnockRequestError",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } )
            // Both answers land on the same message; which button was pressed is what tells them
            // apart, and `answerDisplay` is the sentence that says which it was.
            .addTransition( "Allow", {
                from: "Default",
                to: "Answered",
                mutations: [
                    { type: "set", path: [ "knockerDisplayName" ] },
                    { type: "set", path: [ "answerDisplay" ] }
                ]
            } )
            .addTransition( "Deny", {
                from: "Default",
                to: "Answered",
                mutations: [
                    { type: "set", path: [ "knockerDisplayName" ] },
                    { type: "set", path: [ "answerDisplay" ] }
                ]
            } )
            .addTransition( "Error", { from: "Default", to: "Error" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/YesButton",
                "Allow",
                async( context, interaction ) => {
                    const knocker = getKnocker( interaction, context.getArgs( interaction ).knockerId as string );

                    if ( ! knocker ) {
                        await context.triggerTransition( "Error", interaction );
                        return;
                    }

                    await answer( interaction, knocker, true );

                    await context.triggerTransition( "Allow", interaction, {
                        knockerDisplayName: knocker.displayName,
                        isKnockAllowed: true
                    } );
                }
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/NoButton",
                "Deny",
                async( context, interaction ) => {
                    const knocker = getKnocker( interaction, context.getArgs( interaction ).knockerId as string );

                    if ( ! knocker ) {
                        await context.triggerTransition( "Error", interaction );
                        return;
                    }

                    await answer( interaction, knocker, false );

                    await context.triggerTransition( "Deny", interaction, {
                        knockerDisplayName: knocker.displayName,
                        isKnockAllowed: false
                    } );
                }
            );
    } )
    .getStartArgs( async( _context, _channel, sendArgs ) => ( {
        knockerId: sendArgs?.knockerId,
        knockerDisplayName: sendArgs?.knockerDisplayName
    } ) )
    .getReplyArgs( async( context, interaction ) => context.getArgs( interaction ) )
    .build();

export { DynamicChannelKnockRequestAdapter };
