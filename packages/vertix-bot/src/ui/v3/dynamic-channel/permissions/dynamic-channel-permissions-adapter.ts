import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";
import { DynamicChannelPermissionsComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/dynamic-channel-permissions-component";
import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/elements";
import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction,
    UIDefaultButtonChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

const DynamicChannelPermissionsAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelPermissionsAdapter"
)
    .setComponent( DynamicChannelPermissionsComponent )
    .setExcludedElements( [
        DynamicChannelPermissionsStateButton,
        DynamicChannelPermissionsVisibilityButton
    ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            // States
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { state: "public" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
            } )
            .addState( "Granted", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsGranted",
                navigationType: "ephemeral",
                previewDefaultVars: { userGrantedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsGrantedEmbedGroup"
            } )
            .addState( "Denied", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsDenied",
                navigationType: "ephemeral",
                previewDefaultVars: { userDeniedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsDeniedEmbedGroup"
            } )
            .addState( "Blocked", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsBlocked",
                navigationType: "ephemeral",
                previewDefaultVars: { userBlockedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsBlockedEmbedGroup"
            } )
            .addState( "Unblocked", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked",
                navigationType: "ephemeral",
                previewDefaultVars: { userUnBlockedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsUnblockedEmbedGroup"
            } )
            .addState( "Kicked", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsKick",
                navigationType: "ephemeral",
                previewDefaultVars: { userKickedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsKickEmbedGroup"
            } )
            .addState( "Public", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePublic",
                navigationType: "editReply",
                previewDefaultVars: { state: "public" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
            } )
            .addState( "Private", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePrivate",
                navigationType: "editReply",
                previewDefaultVars: { state: "private" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
            } )
            .addState( "Hidden", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateHidden",
                navigationType: "editReply",
                previewDefaultVars: { state: "hidden" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
            } )
            .addState( "Shown", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateShown",
                navigationType: "editReply",
                previewDefaultVars: { state: "shown" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } )
            .addState( "NothingChanged", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/NothingChangedEmbedGroup"
            } )
            // Transitions - State changes
            .addTransition( "SetPublic", { from: [ "Default", "Private" ], to: "Public" } )
            .addTransition( "SetPrivate", { from: [ "Default", "Public" ], to: "Private" } )
            .addTransition( "SetHidden", { from: [ "Default", "Shown" ], to: "Hidden" } )
            .addTransition( "SetShown", { from: [ "Default", "Hidden" ], to: "Shown" } )
            // Transitions - User access
            .addTransition( "GrantSuccess", {
                from: "Default",
                to: "Granted",
                mutations: [ { type: "set", path: [ "userGrantedDisplayName" ] } ]
            } )
            .addTransition( "DenySuccess", {
                from: "Default",
                to: "Denied",
                mutations: [ { type: "set", path: [ "userDeniedDisplayName" ] } ]
            } )
            .addTransition( "BlockSuccess", {
                from: "Default",
                to: "Blocked",
                mutations: [ { type: "set", path: [ "userBlockedDisplayName" ] } ]
            } )
            .addTransition( "UnblockSuccess", {
                from: "Default",
                to: "Unblocked",
                mutations: [ { type: "set", path: [ "userUnBlockedDisplayName" ] } ]
            } )
            .addTransition( "KickSuccess", {
                from: "Default",
                to: "Kicked",
                mutations: [ { type: "set", path: [ "userKickedDisplayName" ] } ]
            } )
            // Error transitions
            .addTransition( "Error", { from: "Default", to: "Error" } )
            .addTransition( "NothingChanged", { from: "Default", to: "NothingChanged" } )
            // Handler bindings (combines element-to-transition binding with handler)
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsStateButton",
                "SetPublic",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultButtonChannelVoiceInteraction;
                    const state = voiceInteraction.customId.split( ":" )[ 2 ];

                    if ( state !== "public" && state !== "private" ) {
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.editChannelPrivacyState( voiceInteraction, voiceInteraction.channel, state );

                    if ( result ) {
                        const transitionName = state === "public" ? "SetPublic" : "SetPrivate";
                        await context.triggerTransition( transitionName, voiceInteraction );
                    } else {
                        await context.triggerTransition( "Error", voiceInteraction );
                    }
                }
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsVisibilityButton",
                "SetHidden",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultButtonChannelVoiceInteraction;
                    const visibility = voiceInteraction.customId.split( ":" )[ 2 ];

                    if ( visibility !== "hidden" && visibility !== "shown" ) {
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.editChannelVisibilityState(
                        voiceInteraction,
                        voiceInteraction.channel,
                        visibility
                    );

                    if ( result ) {
                        const transitionName = visibility === "hidden" ? "SetHidden" : "SetShown";
                        await context.triggerTransition( transitionName, voiceInteraction );
                    } else {
                        await context.triggerTransition( "Error", voiceInteraction );
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu",
                "GrantSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.editUserAccess(
                        voiceInteraction,
                        voiceInteraction.channel,
                        member,
                        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                        true
                    );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    if ( result === "success" ) {
                        await context.triggerTransition( "GrantSuccess", voiceInteraction, {
                            userGrantedDisplayName: member.displayName
                        } );
                    } else {
                        await context.triggerTransition( "Error", voiceInteraction );
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu",
                "DenySuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.removeUserAccess(
                        voiceInteraction,
                        voiceInteraction.channel,
                        member
                    );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    switch ( result ) {
                        case "success":
                            await context.triggerTransition( "DenySuccess", voiceInteraction, {
                                userDeniedDisplayName: member.displayName
                            } );
                            break;
                        case "not-in-the-list":
                            await context.triggerTransition( "NothingChanged", voiceInteraction );
                            break;
                        default:
                            await context.triggerTransition( "Error", voiceInteraction );
                            break;
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu",
                "BlockSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.editUserAccess(
                        voiceInteraction,
                        voiceInteraction.channel,
                        member,
                        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                        false
                    );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    switch ( result ) {
                        case "success":
                            await context.triggerTransition( "BlockSuccess", voiceInteraction, {
                                userBlockedDisplayName: member.displayName
                            } );
                            break;
                        case "already-have":
                            await context.triggerTransition( "NothingChanged", voiceInteraction );
                            break;
                        default:
                            await context.triggerTransition( "Error", voiceInteraction );
                            break;
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu",
                "UnblockSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.removeUserAccess(
                        voiceInteraction,
                        voiceInteraction.channel,
                        member,
                        true
                    );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    switch ( result ) {
                        case "success":
                            await context.triggerTransition( "UnblockSuccess", voiceInteraction, {
                                userUnBlockedDisplayName: member.displayName
                            } );
                            break;
                        case "not-in-the-list":
                            await context.triggerTransition( "NothingChanged", voiceInteraction );
                            break;
                        default:
                            await context.triggerTransition( "Error", voiceInteraction );
                            break;
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu",
                "KickSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.kickUser( voiceInteraction, voiceInteraction.channel, member );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    if ( result === "success" ) {
                        await context.triggerTransition( "KickSuccess", voiceInteraction, {
                            userKickedDisplayName: member.displayName
                        } );
                    } else {
                        await context.triggerTransition( "Error", voiceInteraction );
                    }
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const channel = interaction.channel as VoiceChannel;
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        const args: UIArgs = {
            channelName: channel.name,
            userLimit: channel.userLimit,
            state: await dynamicChannelService.getChannelPrivacyState( channel ),
            channelId: channel.id,
            region: channel.rtcRegion
        };

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V3/DynamicChannelPermissionsGranted":
                args.userGrantedDisplayName = argsFromManager.userGrantedDisplayName;
                break;
            case "VertixBot/UI-V3/DynamicChannelPermissionsDenied":
                args.userDeniedDisplayName = argsFromManager.userDeniedDisplayName;
                break;
            case "VertixBot/UI-V3/DynamicChannelPermissionsBlocked":
                args.userBlockedDisplayName = argsFromManager.userBlockedDisplayName;
                break;
            case "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked":
                args.userUnBlockedDisplayName = argsFromManager.userUnBlockedDisplayName;
                break;
            case "VertixBot/UI-V3/DynamicChannelPermissionsKick":
                args.userKickedDisplayName = argsFromManager.userKickedDisplayName;
                break;
        }

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );
        if ( masterChannelDB ) {
            const templateButtons = await MasterChannelDataManager.$.getChannelButtonsTemplate(
                masterChannelDB,
                false
            );

            args.dynamicChannelButtonsTemplate = templateButtons?.length
                ? DynamicChannelPrimaryMessageElementsGroup.sortIds( templateButtons )
                : DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() );

            const accessButtonId = DynamicChannelPrimaryMessageElementsGroup.getByName(
                DynamicChannelPermissionsAccessButton.getName()
            )?.getId();
            args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
                ( buttonId: string ) => buttonId === accessButtonId
            );
        } else {
            args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() );
            const accessButtonId = DynamicChannelPrimaryMessageElementsGroup.getByName(
                DynamicChannelPermissionsAccessButton.getName()
            )?.getId();
            args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
                ( buttonId: string ) => buttonId === accessButtonId
            );
        }

        Object.assign( args, await getUsersWithPermissions( channel ) );
        return args;
    } )
    .build();

async function getUsersWithPermissions( channel: VoiceChannel ) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const allowed = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        true
    );
    const blocked = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        false
    );

    return {
        allowedUsers: allowed,
        blockedUsers: blocked
    };
}

export { DynamicChannelPermissionsAdapter };
