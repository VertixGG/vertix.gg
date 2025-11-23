import { MessageFlags } from "discord.js";

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
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

const PERMISSIONS_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsAccess": {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsStatePublic": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsPublicEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsStatePrivate": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsPrivateEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsStateHidden": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsHiddenEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsStateShown": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsShownEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsGranted": {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsGrantedEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsDenied": {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsDeniedEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsBlocked": {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsBlockedEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked": {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsUnblockedEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsKick": {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsKickEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsStateError": {
        embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged": {
        embedsGroup: "VertixBot/UI-General/NothingChangedEmbedGroup"
    }
} as const;

const DynamicChannelPermissionsAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelPermissionsAdapter"
)
    .setComponent( DynamicChannelPermissionsComponent )
    .setExcludedElements( [
        DynamicChannelPermissionsStateButton,
        DynamicChannelPermissionsVisibilityButton
    ] )
    .setExecutionSteps( PERMISSIONS_STEPS )
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
    .onEntityMap( async( { bindButton, bindSelectMenu } ) => {
        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsStateButton",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultButtonChannelVoiceInteraction;
                const state = voiceInteraction.customId.split( ":" )[ 2 ];
                if ( state === "public" || state === "private" ) {
                    await onStateChanged( context, voiceInteraction, state );
                }
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetPublic",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Public",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePublic"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetPrivate",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Private",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePrivate"
                        }
                    }
                ]
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsVisibilityButton",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultButtonChannelVoiceInteraction;
                const visibility = voiceInteraction.customId.split( ":" )[ 2 ];
                if ( visibility === "hidden" || visibility === "shown" ) {
                    await onVisibilityChanged( context, voiceInteraction, visibility );
                }
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetHidden",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Hidden",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateHidden"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetShown",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Shown",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateShown"
                        }
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                const userId = voiceInteraction.values[ 0 ];
                const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );
                if ( !member ) {
                    await context.editReplyWithStep( voiceInteraction, "default" );
                    try {
                        await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                    } catch {
                        await voiceInteraction.followUp( {
                            flags: MessageFlags.Ephemeral,
                            content: "Oops, an issue has occurred"
                        } ).catch( () => {} );
                    }
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
                switch ( result ) {
                    case "success":
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        try {
                            await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsGranted", {
                                userGrantedDisplayName: member.displayName
                            } );
                        } catch {
                            await voiceInteraction.followUp( {
                                flags: MessageFlags.Ephemeral,
                                content: `${ member.displayName } successfully granted access!`
                            } ).catch( () => {} );
                        }
                        break;
                    default:
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        try {
                            await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        } catch {
                            await voiceInteraction.followUp( {
                                flags: MessageFlags.Ephemeral,
                                content: "Oops, an issue has occurred"
                            } ).catch( () => {} );
                        }
                        break;
                }
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantAccessSuccess",
                        mutations: [
                            { type: "set", path: [ "userGrantedDisplayName" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Granted",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsGranted"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantAccessError",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                        }
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                const userId = voiceInteraction.values[ 0 ];
                const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );
                if ( !member ) {
                    await context.editReplyWithStep( voiceInteraction, "default" );
                    try {
                        await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                    } catch {
                        await voiceInteraction.followUp( {
                            flags: MessageFlags.Ephemeral,
                            content: "Oops, an issue has occurred"
                        } ).catch( () => {} );
                    }
                    return;
                }
                const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                const result = await dynamicChannelService.removeUserAccess(
                    voiceInteraction,
                    voiceInteraction.channel,
                    member
                );
                switch ( result ) {
                    case "success":
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        try {
                            await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsDenied", {
                                userDeniedDisplayName: member.displayName
                            } );
                        } catch {
                            await voiceInteraction.followUp( {
                                flags: MessageFlags.Ephemeral,
                                content: `${ member.displayName } successfully denied access!`
                            } ).catch( () => {} );
                        }
                        break;
                    case "not-in-the-list":
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        try {
                            await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged" );
                        } catch {
                            await voiceInteraction.followUp( {
                                flags: MessageFlags.Ephemeral,
                                content: "Nothing changed"
                            } ).catch( () => {} );
                        }
                        break;
                    default:
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        try {
                            await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        } catch {
                            await voiceInteraction.followUp( {
                                flags: MessageFlags.Ephemeral,
                                content: "Oops, an issue has occurred"
                            } ).catch( () => {} );
                        }
                        break;
                }
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessSuccess",
                        mutations: [
                            { type: "set", path: [ "userDeniedDisplayName" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Denied",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsDenied"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessNothingChanged",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/NothingChanged",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessError",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                        }
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                await onBlockChanged( context, voiceInteraction, true, voiceInteraction.values[ 0 ] );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserSuccess",
                        mutations: [
                            { type: "set", path: [ "userBlockedDisplayName" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Blocked",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsBlocked"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserNothingChanged",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/NothingChanged",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserError",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                        }
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                await onBlockChanged( context, voiceInteraction, false, voiceInteraction.values[ 0 ] );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserSuccess",
                        mutations: [
                            { type: "set", path: [ "userUnBlockedDisplayName" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Unblocked",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserNothingChanged",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/NothingChanged",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserError",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                        }
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                const userId = voiceInteraction.values[ 0 ];
                const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );
                if ( !member ) {
                    await context.editReplyWithStep( voiceInteraction, "default" );
                    try {
                        await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                    } catch {
                        await voiceInteraction.followUp( {
                            flags: MessageFlags.Ephemeral,
                            content: "Oops, an issue has occurred"
                        } ).catch( () => {} );
                    }
                    return;
                }
                const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                const result = await dynamicChannelService.kickUser( voiceInteraction, voiceInteraction.channel, member );
                switch ( result ) {
                    case "success":
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        try {
                            await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsKick", {
                                userKickedDisplayName: member.displayName
                            } );
                        } catch {
                            await voiceInteraction.followUp( {
                                flags: MessageFlags.Ephemeral,
                                content: `${ member.displayName } successfully kicked!`
                            } ).catch( () => {} );
                        }
                        break;
                    default:
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        try {
                            await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        } catch {
                            await voiceInteraction.followUp( {
                                flags: MessageFlags.Ephemeral,
                                content: "Oops, an issue has occurred"
                            } ).catch( () => {} );
                        }
                        break;
                }
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickUserSuccess",
                        mutations: [
                            { type: "set", path: [ "userKickedDisplayName" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Kicked",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsKick"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickUserError",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
                            executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                        }
                    }
                ]
            }
        );
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

async function onStateChanged(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction,
    state: "public" | "private"
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const result = await dynamicChannelService.editChannelPrivacyState( interaction, interaction.channel, state );
    if ( result ) {
        await context.editReplyWithStep(
            interaction,
            "VertixBot/UI-V3/DynamicChannelPermissionsState" + state[ 0 ].toUpperCase() + state.substring( 1 )
        );
    } else {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
    }
}

async function onVisibilityChanged(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction,
    visibility: "hidden" | "shown"
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const result = await dynamicChannelService.editChannelVisibilityState(
        interaction,
        interaction.channel,
        visibility
    );
    if ( result ) {
        await context.editReplyWithStep(
            interaction,
            "VertixBot/UI-V3/DynamicChannelPermissionsState" + visibility[ 0 ].toUpperCase() + visibility.substring( 1 )
        );
    } else {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
    }
}

async function onBlockChanged(
    context: IExecutionAdapterContext<UIDefaultUserSelectMenuChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction,
    isBlockMode: boolean,
    userId: string
) {
    const member = interaction.guild.members.cache.get( userId ) || await interaction.guild.members.fetch( userId );
    if ( !member ) {
        await context.editReplyWithStep( interaction, "default" );
        try {
            await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
        } catch {
            await interaction.followUp( {
                flags: MessageFlags.Ephemeral,
                content: "Oops, an issue has occurred"
            } ).catch( () => {} );
        }
        return;
    }
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    if ( isBlockMode ) {
        const result = await dynamicChannelService.editUserAccess(
            interaction,
            interaction.channel,
            member,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            false
        );

        switch ( result ) {
            case "success":
                await context.editReplyWithStep( interaction, "default" );
                try {
                    await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsBlocked", {
                        userBlockedDisplayName: member.displayName
                    } );
                } catch {
                    await interaction.followUp( {
                        flags: MessageFlags.Ephemeral,
                        content: `${ member.displayName } successfully blocked!`
                    } ).catch( () => {} );
                }
                break;
            case "already-have":
                await context.editReplyWithStep( interaction, "default" );
                try {
                    await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged" );
                } catch {
                    await interaction.followUp( {
                        flags: MessageFlags.Ephemeral,
                        content: "Nothing changed"
                    } ).catch( () => {} );
                }
                break;
            case "error":
            case "action-on-bot-user":
            case "self-edit":
            default:
                await context.editReplyWithStep( interaction, "default" );
                try {
                    await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                } catch {
                    await interaction.followUp( {
                        flags: MessageFlags.Ephemeral,
                        content: "Oops, an issue has occurred"
                    } ).catch( () => {} );
                }
                break;
        }
    } else {
        const result = await dynamicChannelService.removeUserAccess(
            interaction,
            interaction.channel,
            member,
            true
        );

        switch ( result ) {
            case "success":
                await context.editReplyWithStep( interaction, "default" );
                try {
                    await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked", {
                        userUnBlockedDisplayName: member.displayName
                    } );
                } catch {
                    await interaction.followUp( {
                        flags: MessageFlags.Ephemeral,
                        content: `${ member.displayName } successfully un-blocked!`
                    } ).catch( () => {} );
                }
                break;
            case "not-in-the-list":
                await context.editReplyWithStep( interaction, "default" );
                try {
                    await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged" );
                } catch {
                    await interaction.followUp( {
                        flags: MessageFlags.Ephemeral,
                        content: "Nothing changed"
                    } ).catch( () => {} );
                }
                break;
            case "error":
            case "action-on-bot-user":
            case "self-deny":
            case "user-blocked":
            default:
                await context.editReplyWithStep( interaction, "default" );
                try {
                    await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                } catch {
                    await interaction.followUp( {
                        flags: MessageFlags.Ephemeral,
                        content: "Oops, an issue has occurred"
                    } ).catch( () => {} );
                }
                break;
        }
    }
}

export { DynamicChannelPermissionsAdapter };
