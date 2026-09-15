import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import type {
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

/**
 * What each of the access menus does, shared by the interface the permissions button opens and the
 * one `/voice access` opens.
 *
 * These name the screens they end on as execution steps rather than as transitions, so the two
 * adapters that use them declare the same step names - which is the point rather than an accident.
 * Granting somebody access is one act with one set of answers, and a second copy of it worded
 * separately is how the two doors start telling members different things.
 */

export async function onGrantSelected(
    context: IExecutionAdapterContext<UIDefaultUserSelectMenuChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const targetId = interaction.values.at( 0 ) as string,
        target = interaction.guild.members.cache.get( targetId );

    if ( !target ) {
        await context.updateInteractionDefer( interaction );
        return;
    }

    switch (
        await dynamicChannelService.addUserAccess(
            interaction,
            interaction.channel,
            target,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS
        )
    ) {
        case "success":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsGranted", {
                userGrantedDisplayName: target.displayName
            } );
            break;

        case "action-on-bot-user":
        case "self-grant":
        case "already-granted":
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged",
                {}
            );

        default:
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                {}
            );
    }
}

export async function onDenySelected(
    context: IExecutionAdapterContext<UIDefaultUserSelectMenuChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const targetId = interaction.values.at( 0 ) as string,
        target = interaction.guild.members.cache.get( targetId );

    if ( !target ) {
        await context.updateInteractionDefer( interaction );
        return;
    }

    switch ( await dynamicChannelService.removeUserAccess( interaction, interaction.channel, target ) ) {
        case "success":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsDenied", {
                userDeniedDisplayName: target.displayName
            } );
            break;

        case "action-on-bot-user":
        case "self-deny":
        case "not-in-the-list":
        case "user-blocked":
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged",
                {}
            );

        default:
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                {}
            );
    }
}

export async function onBlockSelected(
    context: IExecutionAdapterContext<UIDefaultUserSelectMenuChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const targetId = interaction.values.at( 0 ) as string,
        target = interaction.guild.members.cache.get( targetId );

    if ( !target ) {
        await context.updateInteractionDefer( interaction );
        return;
    }

    switch (
        await dynamicChannelService.editUserAccess(
            interaction,
            interaction.channel,
            target,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            false
        )
    ) {
        case "success":
            // Check if target is in the channel.
            if ( interaction.channel.members.has( target.id ) ) {
                // Kick it.
                await target.voice.setChannel( null ).catch( () => {} );
            }

            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsBlocked", {
                userBlockedDisplayName: target.displayName
            } );
            break;

        case "action-on-staff-user":
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateStaffMember",
                { staffMemberDisplayName: target.displayName }
            );

        case "action-on-bot-user":
        case "self-edit":
        case "already-have":
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged",
                {}
            );

        default:
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                {}
            );
    }
}

export async function onUnBlockSelected(
    context: IExecutionAdapterContext<UIDefaultUserSelectMenuChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const targetId = interaction.values.at( 0 ) as string,
        target = interaction.guild.members.cache.get( targetId );

    if ( !target ) {
        await context.updateInteractionDefer( interaction );
        return;
    }

    switch ( await dynamicChannelService.removeUserAccess( interaction, interaction.channel, target, true ) ) {
        case "success":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsUnBlocked", {
                userUnBlockedDisplayName: target.displayName
            } );
            break;

        case "action-on-bot-user":
        case "not-in-the-list":
        case "self-deny":
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged",
                {}
            );

        default:
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                {}
            );
    }
}

export async function onKickSelected(
    context: IExecutionAdapterContext<UIDefaultUserSelectMenuChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const targetId = interaction.values.at( 0 ) as string,
        target = interaction.guild.members.cache.get( targetId );

    if ( !target ) {
        await context.updateInteractionDefer( interaction );
        return;
    }

    switch ( await dynamicChannelService.kickUser( interaction, interaction.channel, target ) ) {
        case "success":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsKick", {
                userKickedDisplayName: target.displayName
            } );
            break;

        case "not-in-the-list":
        case "action-on-staff-user":
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateStaffMember",
                { staffMemberDisplayName: target.displayName }
            );

        case "action-on-bot-user":
        case "self-action":
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged",
                {}
            );

        default:
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                {}
            );
    }
}
