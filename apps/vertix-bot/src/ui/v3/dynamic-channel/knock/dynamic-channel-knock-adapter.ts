import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType } from "discord.js";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelKnockComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-component";
import { DynamicChannelKnockButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-button";
import {
    getJoinableChannels,
    getKnockableChannels,
    isPressedFromControlPanel
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-channel-lists";

import { DynamicChannelKnockManager } from "@vertix.gg/bot/src/managers/dynamic-channel-knock-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { IKnockableChannelOption } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-channel-menu";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

type DefaultInteraction = UIDefaultStringSelectMenuChannelTextInteraction | UIDefaultButtonChannelVoiceInteraction;

type KnockContext = IExecutionAdapterContext<DefaultInteraction, UIArgs>;

/**
 * The transitions a knock ends on, which differ by where it was asked from.
 *
 * Pressing the button inside the channel answers everything in one step, so its outcome opens an
 * ephemeral of its own. Coming through the picker there is already an ephemeral on screen, and the
 * outcome replaces it.
 */
interface KnockOutcomeTransitions {
    sent: string;
    waiting: string;
    error: string;
}

/**
 * Function requestKnock() :: Records the knock and puts it in front of the channel's owner.
 *
 * Shared by both ways in - pressing the button inside the channel, and picking one from the
 * control panel - so that a knock means the same thing however it was asked.
 */
async function requestKnock(
    context: KnockContext,
    interaction: DefaultInteraction,
    targetChannel: VoiceChannel,
    transitions: KnockOutcomeTransitions
) {
    const knockResult = DynamicChannelKnockManager.$.request( targetChannel.id, interaction.user.id );

    if ( "accepted" !== knockResult ) {
        await context.triggerTransition( transitions.waiting, interaction );
        return;
    }

    const requestAdapter = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-V3/DynamicChannelKnockRequestAdapter" );

    if ( ! requestAdapter ) {
        DynamicChannelKnockManager.$.resolve( targetChannel.id, interaction.user.id );

        await context.triggerTransition( transitions.error, interaction );
        return;
    }

    const knocker = interaction.guild.members.cache.get( interaction.user.id );

    await requestAdapter.send( targetChannel, {
        knockerId: interaction.user.id,
        knockerDisplayName: knocker?.displayName ?? interaction.user.username
    } );

    await context.triggerTransition( transitions.sent, interaction, {
        knockedChannelName: targetChannel.name
    } );
}

const DynamicChannelKnockAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelKnockAdapter"
)
    .setComponent( DynamicChannelKnockComponent )
    .setExcludedElements( [ DynamicChannelKnockButton ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
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
            .addState( "SentDirect", {
                executionStep: "VertixBot/UI-V3/DynamicChannelKnockSentDirect",
                navigationType: "ephemeral",
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
            .addState( "WaitingDirect", {
                executionStep: "VertixBot/UI-V3/DynamicChannelKnockWaitingDirect",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelKnockWaitingEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelKnockError",
                navigationType: "editReply",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
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
            .addTransition( "Sent", {
                from: "SelectChannel",
                to: "Sent",
                mutations: [ { type: "set", path: [ "knockedChannelName" ] } ]
            } )
            .addTransition( "SentDirect", {
                from: "Default",
                to: "SentDirect",
                mutations: [ { type: "set", path: [ "knockedChannelName" ] } ]
            } )
            .addTransition( "Waiting", { from: "SelectChannel", to: "Waiting" } )
            .addTransition( "WaitingDirect", { from: "Default", to: "WaitingDirect" } )
            .addTransition( "Error", { from: "SelectChannel", to: "Error" } )
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
                        // Only worth saying from the control panel: pressed inside a channel the
                        // member is already in one, and does not need to be shown the way to it.
                        const joinable = isPressedFromControlPanel( interaction )
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
                        await requestKnock( context, interaction, standingIn, {
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
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelKnockChannelMenu",
                "Sent",
                async( context, interaction ) => {
                    const targetChannelId = interaction.values.at( 0 );

                    const knockable = await getKnockableChannels( interaction, interaction.member );

                    // Re-read rather than trust the submitted value: the list is what the member
                    // may ask about, and it can have changed since it was drawn.
                    const targetChannel = knockable.find( ( channel ) => channel.id === targetChannelId );

                    if ( ChannelType.GuildVoice !== targetChannel?.type ) {
                        await context.triggerTransition( "Error", interaction );
                        return;
                    }

                    await requestKnock( context, interaction, targetChannel, {
                        sent: "Sent",
                        waiting: "Waiting",
                        error: "Error"
                    } );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => context.getArgs( interaction ) )
    .build();

export { DynamicChannelKnockAdapter };
