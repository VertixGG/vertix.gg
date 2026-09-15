import { ChannelType } from "discord.js";

import {
    getKnockableChannels
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-channel-lists";

import {
    requestKnock
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-request";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";

type KnockInteraction =
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultButtonChannelVoiceInteraction;

type KnockTransactions = TransactionBuilder<IExecutionAdapterContext<KnockInteraction, UIArgs>>;

/**
 * Function defineKnockStates() :: The screens asking to be let in can end on, and the picker that
 * leads to them.
 *
 * Shared by the interface the knock button opens and the one `/knock` opens. Less of it is common
 * than for the other features, and deliberately so: the button's interface needs each outcome twice
 * over - once as a fresh reply for a press answered in one step, once as a replacement for the
 * picker already on screen - while a command never has a picker up when it answers directly. So
 * what is shared is the picker and the outcomes it leads to, and each adapter adds the rest.
 */
export function defineKnockStates( tx: KnockTransactions ) {
    tx
        .addState( "SelectChannel", {
            executionStep: "VertixBot/UI-V3/DynamicChannelKnockSelectChannel",
            navigationType: "ephemeral",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockEmbedGroup",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelKnockChannelMenuGroup"
        } )
        .addState( "Sent", {
            executionStep: "VertixBot/UI-V3/DynamicChannelKnockSent",
            navigationType: "editReply",
            previewDefaultVars: { knockedChannelName: "Example Channel" },
            embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockSentEmbedGroup"
        } )
        .addState( "Nothing", {
            executionStep: "VertixBot/UI-V3/DynamicChannelKnockNothing",
            navigationType: "ephemeral",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockNoneEmbedGroup"
        } )
        .addState( "Waiting", {
            executionStep: "VertixBot/UI-V3/DynamicChannelKnockWaiting",
            navigationType: "editReply",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockWaitingEmbedGroup"
        } )
        .addState( "Error", {
            executionStep: "VertixBot/UI-V3/DynamicChannelKnockError",
            navigationType: "editReply",
            embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
        } )
        .addTransition( "Sent", {
            from: "SelectChannel",
            to: "Sent",
            mutations: [ { type: "set", path: [ "knockedChannelName" ] } ]
        } )
        .addTransition( "Waiting", { from: "SelectChannel", to: "Waiting" } )
        .addTransition( "Error", { from: "SelectChannel", to: "Error" } )
        .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelKnockChannelMenu",
            "Sent",
            async( context, interaction ) => {
                const targetChannelId = interaction.values.at( 0 );

                const knockable = await getKnockableChannels( interaction, interaction.member );

                // Re-read rather than trust the submitted value: the list is what the member may
                // ask about, and it can have changed since it was drawn.
                const targetChannel = knockable.find( ( channel ) => channel.id === targetChannelId );

                if ( ChannelType.GuildVoice !== targetChannel?.type ) {
                    await context.triggerTransition( "Error", interaction );
                    return;
                }

                const result = await requestKnock(
                    {
                        user: interaction.user,
                        member: interaction.guild.members.cache.get( interaction.user.id ) ?? null
                    },
                    targetChannel
                );

                switch ( result.outcome ) {
                    case "sent":
                        await context.triggerTransition( "Sent", interaction, {
                            knockedChannelName: result.knockedChannelName
                        } );
                        break;

                    case "waiting":
                        await context.triggerTransition( "Waiting", interaction );
                        break;

                    case "error":
                        await context.triggerTransition( "Error", interaction );
                        break;
                }
            }
        );

    return tx;
}

/**
 * Function getKnockReplyArgs() :: What the screen was opened with, over what was already stored.
 *
 * The two doors put the channel list somewhere different. A press stores it and then navigates, so
 * the store is where it is; a command has nothing stored yet and hands it in with the opening, so
 * the handed-in half is where it is. Reading only the store drew the picker with no channels in it
 * - an embed asking which channel, above nothing to pick from.
 *
 * Handed-in wins, because it is the newer of the two: an outcome naming the channel just knocked on
 * is answering about this press, not the last one.
 */
export async function getKnockReplyArgs(
    context: IExecutionAdapterContext<KnockInteraction, UIArgs>,
    interaction: KnockInteraction,
    argsFromManager?: UIArgs
) {
    return Object.assign( {}, context.getArgs( interaction ) ?? {}, argsFromManager ?? {} );
}
