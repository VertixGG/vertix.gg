import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import { getOwnedChannels } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-channel-lists";

import { notifyInvited } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-notify";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type InviteInteraction =
    | UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultButtonChannelVoiceInteraction;

type InviteTransactions = TransactionBuilder<IExecutionAdapterContext<InviteInteraction, UIArgs>>;

/**
 * Function defineInviteStates() :: Every screen letting somebody in can end on, and what leads
 * between them.
 *
 * Declared once and handed the builder. The two interfaces that use it differ only in how a member
 * arrives at the first screen - the button's handler decides and navigates, the command decides and
 * opens - and past that point they are one exchange: pick a channel if there is a choice, pick a
 * member, and hear whether the invitation reached them.
 */
export function defineInviteStates( tx: InviteTransactions ) {
    tx
        .addState( "SelectChannel", {
            executionStep: "VertixBot/UI-V3/DynamicChannelInviteSelectChannel",
            navigationType: "ephemeral",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelInviteSelectChannelEmbedGroup",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelInviteChannelMenuGroup"
        } )
        .addState( "NoChannel", {
            executionStep: "VertixBot/UI-V3/DynamicChannelInviteNoChannel",
            navigationType: "ephemeral",
            previewDefaultVars: { masterChannelId: "123456789" },
            embedsGroup: "VertixBot/UI-General/NoActiveDynamicChannelEmbedGroup"
        } )
        .addState( "SelectUser", {
            executionStep: "VertixBot/UI-V3/DynamicChannelInviteSelectUser",
            navigationType: "ephemeral",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelInviteEmbedGroup",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelInviteUserMenuGroup"
        } )
        .addState( "Sent", {
            executionStep: "VertixBot/UI-V3/DynamicChannelInviteSent",
            navigationType: "editReply",
            // `deliveryDisplay` is one of the embed's own two answers, named by the token it maps:
            // a preview cannot run the logic that picks between them, but it can say which was
            // picked and let the embed supply the words.
            previewDefaultVars: { invitedDisplayName: "User", deliveryDisplay: "{deliveryDelivered}" },
            embedsGroup: "VertixBot/UI-V3/DynamicChannelInviteSentEmbedGroup"
        } )
        .addState( "NothingChanged", {
            executionStep: "VertixBot/UI-V3/DynamicChannelInviteNothingChanged",
            navigationType: "editReply",
            embedsGroup: "VertixBot/UI-General/NothingChangedEmbedGroup"
        } )
        .addState( "Error", {
            executionStep: "VertixBot/UI-V3/DynamicChannelInviteError",
            navigationType: "editReply",
            embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
        } )
        .addTransition( "ChannelSelected", { from: "SelectChannel", to: "SelectUser" } )
        .addTransition( "Sent", {
            from: "SelectUser",
            to: "Sent",
            mutations: [
                { type: "set", path: [ "invitedDisplayName" ] },
                // Whether the link reached them, which the invite message reports back.
                { type: "set", path: [ "deliveryDisplay" ] }
            ]
        } )
        // Somebody who can already get in - or the owner picking themselves - is nothing to do. The
        // preview condition restates the answer the service gives back; the bot never reads it.
        .addTransition( "NothingChanged", {
            from: "SelectUser",
            to: "NothingChanged",
            previewCondition: { field: "alreadyHasAccess", operator: "equals", value: "yes" }
        } )
        .addTransition( "Error", { from: [ "SelectUser", "SelectChannel" ], to: "Error" } )
        .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelInviteChannelMenu",
            "ChannelSelected",
            async( context, interaction ) => {
                const selectedId = interaction.values.at( 0 );

                const owned = await getOwnedChannels( interaction, interaction.member );

                if ( ! selectedId || ! owned.some( ( channel ) => channel.id === selectedId ) ) {
                    await context.triggerTransition( "Error", interaction );
                    return;
                }

                context.setArgs( interaction, { channelId: selectedId } );

                await context.triggerTransition( "ChannelSelected", interaction );
            }
        )
        .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelInviteUserMenu",
            "Sent",
            async( context, interaction ) => {
                const targetId = interaction.values.at( 0 );

                if ( ! targetId ) {
                    await context.updateInteractionDefer( interaction );
                    return;
                }

                const target = interaction.guild.members.cache.get( targetId ) ??
                    await interaction.guild.members.fetch( targetId ).catch( () => null );

                if ( ! target ) {
                    await context.triggerTransition( "Error", interaction );
                    return;
                }

                const result = await ServiceLocator.$
                    .get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
                    .addUserAccess(
                        interaction,
                        interaction.channel,
                        target,
                        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS
                    );

                if ( "already-granted" === result || "self-grant" === result ) {
                    await context.triggerTransition( "NothingChanged", interaction );
                    return;
                }

                if ( "success" !== result ) {
                    await context.triggerTransition( "Error", interaction );
                    return;
                }

                const isInviteDelivered = await notifyInvited( interaction.channel, target, interaction.member );

                context.setArgs( interaction, {
                    invitedDisplayName: target.displayName,
                    isInviteDelivered
                } );

                await context.triggerTransition( "Sent", interaction, {
                    invitedDisplayName: target.displayName,
                    isInviteDelivered
                } );
            }
        );

    return tx;
}

/**
 * Function getInviteReplyArgs() :: Hands the sent message what it needs to name who was invited.
 *
 * Args live against the message they were written on, and SelectUser answers on a new one, so the
 * write that records the invited member has no store to land in and is dropped with only a line in
 * the log to show for it. `argsFromManager` is the same args the render was called with, which is
 * where they still are.
 */
export async function getInviteReplyArgs(
    context: IExecutionAdapterContext<InviteInteraction, UIArgs>,
    interaction: InviteInteraction,
    argsFromManager?: UIArgs
) {
    const storedArgs = context.getArgs( interaction ) ?? {};

    if ( "VertixBot/UI-V3/DynamicChannelInviteSent"
        === context.getCurrentExecutionStep( interaction )?.name ) {
        return {
            invitedDisplayName: storedArgs.invitedDisplayName ?? argsFromManager?.invitedDisplayName,
            isInviteDelivered: storedArgs.isInviteDelivered ?? argsFromManager?.isInviteDelivered
        };
    }

    // Merged rather than read from the store alone. A press stores what the next screen needs and
    // then navigates; a command hands it in with the opening, having nothing stored yet - so the
    // channel it resolved, the list to pick from, or the generator to point at would all be
    // dropped, and the screen drawn without them.
    return Object.assign( {}, storedArgs, argsFromManager ?? {} );
}
