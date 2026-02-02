import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { DynamicChannelPermissionsComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-component";

import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/elements";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

const PERMISSIONS_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup"
    },

    "VertixBot/UI-V2/DynamicChannelPermissionsStatePublic": {
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsPublicEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPermissionsStatePrivate": {
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsPrivateEmbedGroup"
    },

    "VertixBot/UI-V2/DynamicChannelPermissionsStateHidden": {
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsHiddenEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPermissionsStateShown": {
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsShownEmbedGroup"
    },

    "VertixBot/UI-V2/DynamicChannelPermissionsGranted": {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsGrantedEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPermissionsDenied": {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsDeniedEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPermissionsBlocked": {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsBlockedEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPermissionsUnBlocked": {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsUnblockedEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPermissionsKick": {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsKickEmbedGroup"
    },

    "VertixBot/UI-V2/DynamicChannelPermissionsAccess": {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessEmbedGroup"
    },

    "VertixBot/UI-V2/DynamicChannelPermissionsStateError": {
        embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged": {
        embedsGroup: "VertixBot/UI-General/NothingChangedEmbedGroup"
    }
} as const;

async function onStateButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    switch ( await dynamicChannelService.getChannelState( interaction.channel ) ) {
        case "public":
            if ( !( await dynamicChannelService.editChannelState( interaction, interaction.channel, "private" ) ) ) {
                return await context.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                    {}
                );
            }

            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStatePrivate",
                {}
            );

        case "private":
            if ( !( await dynamicChannelService.editChannelState( interaction, interaction.channel, "public" ) ) ) {
                return await context.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                    {}
                );
            }

            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStatePublic",
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

async function onStateVisibilityClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    switch ( await dynamicChannelService.getChannelVisibilityState( interaction.channel ) ) {
        case "shown":
            if (
                !( await dynamicChannelService.editChannelVisibilityState(
                    interaction,
                    interaction.channel,
                    "hidden"
                ) )
            ) {
                return await context.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                    {}
                );
            }

            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateHidden",
                {}
            );

        case "hidden":
            if (
                !( await dynamicChannelService.editChannelVisibilityState(
                    interaction,
                    interaction.channel,
                    "shown"
                ) )
            ) {
                return await context.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                    {}
                );
            }

            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateShown",
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

async function onAccessButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    return await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsAccess", {} );
}

async function onGrantSelected(
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

async function onDenySelected(
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

async function onBlockSelected(
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

async function onUnBlockSelected(
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

async function onKickSelected(
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

const DynamicChannelPermissionsAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelPermissionsAdapter"
)
    .setComponent( DynamicChannelPermissionsComponent )
    .setExcludedElements( [
        DynamicChannelPermissionsAccessButton,
        DynamicChannelPermissionsStateButton,
        DynamicChannelPermissionsVisibilityButton
    ] )
    .setExecutionSteps( PERMISSIONS_STEPS )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { state: "public" }
            } )
            .addState( "Private", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStatePrivate",
                navigationType: "ephemeral"
            } )
            .addState( "Public", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStatePublic",
                navigationType: "ephemeral"
            } )
            .addState( "Hidden", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateHidden",
                navigationType: "ephemeral"
            } )
            .addState( "Shown", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateShown",
                navigationType: "ephemeral"
            } )
            .addState( "Granted", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsGranted",
                navigationType: "ephemeral",
                previewDefaultVars: { userGrantedDisplayName: "User" }
            } )
            .addState( "Denied", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsDenied",
                navigationType: "ephemeral",
                previewDefaultVars: { userDeniedDisplayName: "User" }
            } )
            .addState( "Blocked", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsBlocked",
                navigationType: "ephemeral",
                previewDefaultVars: { userBlockedDisplayName: "User" }
            } )
            .addState( "Unblocked", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsUnBlocked",
                navigationType: "ephemeral",
                previewDefaultVars: { userUnBlockedDisplayName: "User" }
            } )
            .addState( "Kicked", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsKick",
                navigationType: "ephemeral",
                previewDefaultVars: { userKickedDisplayName: "User" }
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                navigationType: "ephemeral"
            } )
            .addState( "NothingChanged", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged",
                navigationType: "ephemeral"
            } )
            .addTransition( "SetPrivate", { from: "Default", to: "Private" } )
            .addTransition( "SetPublic", { from: "Default", to: "Public" } )
            .addTransition( "SetHidden", { from: "Default", to: "Hidden" } )
            .addTransition( "SetShown", { from: "Default", to: "Shown" } )
            .addTransition( "GrantAccess", {
                from: "Default",
                to: "Granted",
                mutations: [ { type: "set", path: [ "userGrantedDisplayName" ] } ]
            } )
            .addTransition( "DenyAccess", {
                from: "Default",
                to: "Denied",
                mutations: [ { type: "set", path: [ "userDeniedDisplayName" ] } ]
            } )
            .addTransition( "BlockUser", {
                from: "Default",
                to: "Blocked",
                mutations: [ { type: "set", path: [ "userBlockedDisplayName" ] } ]
            } )
            .addTransition( "UnblockUser", {
                from: "Default",
                to: "Unblocked",
                mutations: [ { type: "set", path: [ "userUnBlockedDisplayName" ] } ]
            } )
            .addTransition( "KickUser", {
                from: "Default",
                to: "Kicked",
                mutations: [ { type: "set", path: [ "userKickedDisplayName" ] } ]
            } )
            .addTransition( "Error", { from: "Default", to: "Error" } )
            .addTransition( "NothingChanged", { from: "Default", to: "NothingChanged" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsStateButton",
                "SetPrivate",
                onStateButtonClicked
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton",
                "SetHidden",
                onStateVisibilityClicked
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton",
                "GrantAccess",
                onAccessButtonClicked
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsGrantMenu",
                "GrantAccess",
                onGrantSelected
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsDenyMenu",
                "DenyAccess",
                onDenySelected
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsBlockMenu",
                "BlockUser",
                onBlockSelected
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsUnblockMenu",
                "UnblockUser",
                onUnBlockSelected
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsKickMenu",
                "KickUser",
                onKickSelected
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
        const args: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/DynamicChannelPermissionsGranted":
                args.userGrantedDisplayName = argsFromManager?.userGrantedDisplayName;
                break;

            case "VertixBot/UI-V2/DynamicChannelPermissionsDenied":
                args.userDeniedDisplayName = argsFromManager?.userDeniedDisplayName;
                break;

            case "VertixBot/UI-V2/DynamicChannelPermissionsBlocked":
                args.userBlockedDisplayName = argsFromManager?.userBlockedDisplayName;
                break;

            case "VertixBot/UI-V2/DynamicChannelPermissionsUnBlocked":
                args.userUnBlockedDisplayName = argsFromManager?.userUnBlockedDisplayName;
                break;

            case "VertixBot/UI-V2/DynamicChannelPermissionsKick":
                args.userKickedDisplayName = argsFromManager?.userKickedDisplayName;
                break;
        }

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

        if ( masterChannelDB ) {
            args.dynamicChannelButtonsTemplate = await MasterChannelDataManager.$.getChannelButtonsTemplate(
                masterChannelDB,
                false
            );

            // Runs over all dynamic-channel buttons that are configured by the user(Master Channel)
            // And determine if accessButtonId is enabled , since all other "permissions" buttons are depends on the access button
            // TODO: This mechanism is broken, and it should be reworked.
            // Keep in mind that is only for version V2, and consider the effort to rework it.
            const accessButtonId = DynamicChannelElementsGroup.getByName(
                "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton"
            )?.getId();

            args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
                ( buttonId: number ) => buttonId.toString() === accessButtonId?.toString()
            );
        }

        args.allowedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
            interaction.channel,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            true
        );
        args.blockedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
            interaction.channel,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            false
        );

        return args;
    } )
    .build();

export { DynamicChannelPermissionsAdapter };
