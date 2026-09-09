import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelInviteComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-component";
import { DynamicChannelInviteButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-button";
import { getOwnedChannels } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-channel-lists";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { IOwnedChannelOption } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-channel-menu";

import type { GuildMember, VoiceChannel } from "discord.js";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type DirectMessageService from "@vertix.gg/bot/src/services/direct-message-service";

type DefaultInteraction =
    | UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultButtonChannelVoiceInteraction;

/**
 * Function notifyInvited() :: Tells the invited member where the channel they were let into is.
 *
 * The access is already theirs by the time this runs, so a closed inbox costs them nothing but the
 * link - which is why the outcome is reported back to the owner rather than treated as a failure.
 */
async function notifyInvited( channel: VoiceChannel, invited: GuildMember, invitedBy: GuildMember ): Promise<boolean> {
    const directMessageService =
        ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage", { silent: true } );

    if ( ! directMessageService ) {
        return false;
    }

    return directMessageService.sendToUser( invited.id, {
        content:
            `📨 **${ invitedBy.displayName }** invited you to **${ channel.name }** in **${ channel.guild.name }**.\n` +
            `${ channel.url }`
    } );
}

const DynamicChannelInviteAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelInviteAdapter"
)
    .setComponent( DynamicChannelInviteComponent )
    .setExcludedElements( [ DynamicChannelInviteButton ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
            .addState( "SelectChannel", {
                executionStep: "VertixBot/UI-V3/DynamicChannelInviteSelectChannel",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelInviteSelectChannelEmbedGroup",
                elementsGroup: "VertixBot/UI-V3/DynamicChannelInviteChannelMenuGroup"
            } )
            .addState( "NoChannel", {
                executionStep: "VertixBot/UI-V3/DynamicChannelInviteNoChannel",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelInviteNoChannelEmbedGroup"
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
                previewDefaultVars: { invitedDisplayName: "User" },
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
            .addTransition( "Open", { from: "Default", to: "SelectUser" } )
            .addTransition( "OpenChannels", { from: "Default", to: "SelectChannel" } )
            .addTransition( "NoChannel", { from: "Default", to: "NoChannel" } )
            .addTransition( "ChannelSelected", { from: "SelectChannel", to: "SelectUser" } )
            .addTransition( "Sent", {
                from: "SelectUser",
                to: "Sent",
                mutations: [ { type: "set", path: [ "invitedDisplayName" ] } ]
            } )
            .addTransition( "NothingChanged", { from: "SelectUser", to: "NothingChanged" } )
            .addTransition( "Error", { from: [ "SelectUser", "SelectChannel" ], to: "Error" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelInviteButton",
                "Open",
                async( context, interaction ) => {
                    const owned = await getOwnedChannels( interaction, interaction.member );

                    if ( ! owned.length ) {
                        await context.triggerTransition( "NoChannel", interaction );
                        return;
                    }

                    const standingIn = owned.find( ( channel ) => channel.id === interaction.channelId );

                    const resolved = standingIn ?? ( 1 === owned.length ? owned[ 0 ] : null );

                    if ( resolved ) {
                        context.setArgs( interaction, { channelId: resolved.id } );

                        await context.triggerTransition( "Open", interaction );
                        return;
                    }

                    const ownedChannels: IOwnedChannelOption[] = owned.map( ( channel ) => ( {
                        id: channel.id,
                        name: channel.name
                    } ) );

                    context.setArgs( interaction, { ownedChannels } );

                    await context.triggerTransition( "OpenChannels", interaction, { ownedChannels } );
                }
            )
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

                    const dynamicChannelService =
                        ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

                    const result = await dynamicChannelService.addUserAccess(
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
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => context.getArgs( interaction ) )
    .build();

export { DynamicChannelInviteAdapter };
