import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import {
    CommandExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/command-execution-adapter-builder";

import { ClaimCommandComponent } from "@vertix.gg/bot/src/ui/v3/claim/command/claim-command-component";

import { findClaimableChannel } from "@vertix.gg/bot/src/ui/v3/claim/command/claim-command-channels";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { VoiceChannel } from "discord.js";

type DefaultInteraction =
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultButtonChannelVoiceInteraction;

/**
 * Function claimMessageUrlOf() :: The message carrying the claim, for a channel that has one.
 *
 * A claimable channel has had the claim prompt sent into it, and that message is where the vote is
 * drawn - so pointing at it puts a member on the vote rather than merely in the room.
 *
 * Asked of the version's own adapter, because each sent its own prompt into its own channels: ask
 * v3 about a channel a v2 generator made and the answer is that there is no such message, which
 * reads as the channel having no claim rather than as having asked the wrong one.
 *
 * The channel is the fallback, because the two can come apart: the manager marks a channel
 * claimable, and the prompt is sent separately.
 */
function claimMessageUrlOf( channel: VoiceChannel, version: "v2" | "v3" ): string {
    const started = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "v2" === version
            ? "VertixBot/UI-V2/ClaimStartAdapter"
            : "VertixBot/UI-V3/ClaimStartAdapter" )
        ?.getStartedMessages( channel );

    const message = Object.values( started ?? {} )[ 0 ];

    return message?.url ?? channel.url;
}

/**
 * The interface `/voice claim` opens.
 *
 * Its own adapter rather than the claim button's, and for a reason the others do not share: the
 * claim interfaces are about one channel's vote, drawn by editing the message they sit on. This is
 * about which channel - a question only somebody standing outside all of them has.
 */
const ClaimCommandAdapter = new CommandExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/ClaimCommandAdapter"
)
    .setComponent( ClaimCommandComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "SelectChannel" )
            .addState( "SelectChannel", {
                executionStep: "VertixBot/UI-V3/ClaimCommandSelectChannel",
                navigationType: "ephemeral",
                previewDefaultVars: { claimableCount: "is **one channel**" },
                embedsGroup: "VertixBot/UI-V3/ClaimCommandSelectEmbedGroup",
                elementsGroup: "VertixBot/UI-V3/ClaimCommandChannelMenuGroup"
            } )
            .addState( "PointedAt", {
                executionStep: "VertixBot/UI-V3/ClaimCommandPointedAt",
                navigationType: "editReply",
                previewDefaultVars: {
                    claimedChannelName: "Example Channel",
                    claimMessageUrl: "https://discord.com/channels/1/2/3"
                },
                embedsGroup: "VertixBot/UI-V3/ClaimCommandPointedAtEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/ClaimCommandError",
                navigationType: "editReply",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } )
            .addTransition( "PointAt", {
                from: "SelectChannel",
                to: "PointedAt",
                mutations: [
                    { type: "set", path: [ "claimedChannelName" ] },
                    { type: "set", path: [ "claimMessageUrl" ] }
                ]
            } )
            .addTransition( "Error", { from: "SelectChannel", to: "Error" } )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/ClaimCommandChannelMenu",
                "PointAt",
                async( context, interaction ) => {
                    const claimable = findClaimableChannel( interaction.guildId, interaction.values.at( 0 ) );

                    if ( ! claimable ) {
                        await context.triggerTransition( "Error", interaction );
                        return;
                    }

                    const { channel, version } = claimable;

                    await context.triggerTransition( "PointAt", interaction, {
                        claimedChannelName: channel.name,
                        claimMessageUrl: claimMessageUrlOf( channel, version )
                    } );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) =>
        Object.assign( {}, context.getArgs( interaction ) ?? {}, argsFromManager ?? {} )
    )
    .build();

export { ClaimCommandAdapter };
