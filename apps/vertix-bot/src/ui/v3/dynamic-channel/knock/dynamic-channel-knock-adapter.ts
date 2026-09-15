import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelKnockComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-component";
import { DynamicChannelKnockButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-button";
import {
    getJoinableChannels,
    getKnockableChannels
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-channel-lists";
import {
    getInteractionChannelContext,
    interactionNamesAChannel
} from "@vertix.gg/bot/src/ui/general/misc/interaction-channel-context";

import {
    requestKnock
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-request";

import {
    defineKnockStates,
    getKnockReplyArgs
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-states";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type {
    TKnockOutcome
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-request";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { IKnockableChannelOption } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-channel-menu";
import type { VoiceChannel } from "discord.js";

type DefaultInteraction = UIDefaultStringSelectMenuChannelTextInteraction | UIDefaultButtonChannelVoiceInteraction;

/**
 * Which transition each outcome takes, which differs by where the knock was asked from: answering
 * in one step opens an ephemeral of its own, while coming through the picker replaces the one
 * already on screen.
 */
type KnockOutcomeTransitions = Record<TKnockOutcome, string>;

/**
 * Function knockAndNavigate() :: Asks for the knock, then goes wherever that outcome leads.
 */
async function knockAndNavigate(
    context: { triggerTransition: ( name: string, interaction: DefaultInteraction, args?: Record<string, unknown> ) => Promise<void> },
    interaction: DefaultInteraction,
    targetChannel: VoiceChannel,
    transitions: KnockOutcomeTransitions
) {
    const result = await requestKnock(
        { user: interaction.user, member: interaction.guild.members.cache.get( interaction.user.id ) ?? null },
        targetChannel
    );

    await context.triggerTransition(
        transitions[ result.outcome ],
        interaction,
        result.knockedChannelName ? { knockedChannelName: result.knockedChannelName } : undefined
    );
}

const DynamicChannelKnockAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelKnockAdapter"
)
    .setComponent( DynamicChannelKnockComponent )
    .setExcludedElements( [ DynamicChannelKnockButton ] )
    .defineTransactions( ( tx ) => {
        defineKnockStates( tx )
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
            // Answering in one step needs its own reply, where coming through the picker replaces
            // the one already on screen - so each outcome a direct press can reach exists twice.
            .addState( "SentDirect", {
                executionStep: "VertixBot/UI-V3/DynamicChannelKnockSentDirect",
                navigationType: "ephemeral",
                previewDefaultVars: { knockedChannelName: "Example Channel" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockSentEmbedGroup"
            } )
            .addState( "WaitingDirect", {
                executionStep: "VertixBot/UI-V3/DynamicChannelKnockWaitingDirect",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockWaitingEmbedGroup"
            } )
            .addState( "ErrorDirect", {
                executionStep: "VertixBot/UI-V3/DynamicChannelKnockErrorDirect",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } )
            .addTransition( "Open", { from: "Default", to: "SelectChannel" } )
            .addTransition( "Nothing", {
                from: "Default",
                to: "Nothing",
                mutations: [ { type: "set", path: [ "openChannels" ] } ]
            } )
            .addTransition( "SentDirect", {
                from: "Default",
                to: "SentDirect",
                mutations: [ { type: "set", path: [ "knockedChannelName" ] } ]
            } )
            .addTransition( "WaitingDirect", { from: "Default", to: "WaitingDirect" } )
            .addTransition( "ErrorDirect", { from: "Default", to: "ErrorDirect" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelKnockButton",
                "Open",
                async( context, interaction ) => {
                    const knockable = await getKnockableChannels( interaction, interaction.member );

                    if ( ! knockable.length ) {
                        // Nothing to ask about does not mean nowhere to go - if every channel is
                        // already open, point at them rather than answering with a dead end.
                        //
                        // Only worth saying to someone who is choosing: already standing in a
                        // channel, the member does not need to be shown the way to one.
                        const joinable = ! interactionNamesAChannel( getInteractionChannelContext( interaction ) )
                            ? await getJoinableChannels( interaction, interaction.member )
                            : [];

                        const openChannels = joinable.map( ( channel ) => channel.id );

                        context.setArgs( interaction, { openChannels } );

                        await context.triggerTransition( "Nothing", interaction, { openChannels } );
                        return;
                    }

                    // Pressed from inside the channel being asked about, which names it already.
                    // Only a control panel leaves the channel open to question.
                    const standingIn = knockable.find( ( channel ) => channel.id === interaction.channelId );

                    if ( standingIn ) {
                        await knockAndNavigate( context, interaction, standingIn, {
                            sent: "SentDirect",
                            waiting: "WaitingDirect",
                            error: "ErrorDirect"
                        } );

                        return;
                    }

                    const knockableChannels: IKnockableChannelOption[] = await Promise.all(
                        knockable.map( async( channel ) => {
                            const channelDB = await ChannelModel.$.getByChannelId( channel.id );

                            return {
                                id: channel.id,
                                name: channel.name,
                                ownerDisplayName: await guildGetMemberDisplayName(
                                    interaction.guild,
                                    channelDB?.userOwnerId ?? ""
                                )
                            };
                        } )
                    );

                    context.setArgs( interaction, { knockableChannels } );

                    await context.triggerTransition( "Open", interaction, { knockableChannels } );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( getKnockReplyArgs )
    .build();

export { DynamicChannelKnockAdapter };
