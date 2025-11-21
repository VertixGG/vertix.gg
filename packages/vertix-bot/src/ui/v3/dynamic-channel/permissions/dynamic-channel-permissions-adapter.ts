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
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsEmbedGroup"
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
    .setInitiatorElement( DynamicChannelPermissionsAccessButton )
    .setExcludedElements( [
        DynamicChannelPermissionsStateButton,
        DynamicChannelPermissionsVisibilityButton
    ] )
    .setExecutionSteps( PERMISSIONS_STEPS )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args: UIArgs = {};

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

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );
        if ( masterChannelDB ) {
            args.dynamicChannelButtonsTemplate = await MasterChannelDataManager.$.getChannelButtonsTemplate(
                masterChannelDB,
                false
            );
            const accessButtonId = DynamicChannelPrimaryMessageElementsGroup.getByName(
                "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton"
            )?.getId();
            args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
                ( buttonId: string ) => buttonId === accessButtonId
            );
        }

        Object.assign( args, await getUsersWithPermissions( interaction.channel ) );
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
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                const userId = voiceInteraction.values[ 0 ];
                const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );
                if ( !member ) {
                    await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
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
                        await context.editReplyWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsGranted", {
                            userGrantedDisplayName: member.displayName
                        } );
                        break;
                    default:
                        await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        break;
                }
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                const userId = voiceInteraction.values[ 0 ];
                const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );
                if ( !member ) {
                    await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
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
                switch ( result ) {
                    case "success":
                        await context.editReplyWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsDenied", {
                            userDeniedDisplayName: member.displayName
                        } );
                        break;
                    default:
                        await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        break;
                }
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                await onBlockChanged( context, voiceInteraction, true, voiceInteraction.values[ 0 ] );
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                await onBlockChanged( context, voiceInteraction, false, voiceInteraction.values[ 0 ] );
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                const userId = voiceInteraction.values[ 0 ];
                const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );
                if ( !member ) {
                    await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                    return;
                }
                const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                const result = await dynamicChannelService.kickUser( voiceInteraction, voiceInteraction.channel, member );
                switch ( result ) {
                    case "success":
                        await context.editReplyWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsKick", {
                            userKickedDisplayName: member.displayName
                        } );
                        break;
                    default:
                        await context.ephemeralWithStep( voiceInteraction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        break;
                }
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
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
        return;
    }
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const result = await dynamicChannelService.editUserAccess(
        interaction,
        interaction.channel,
        member,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        !isBlockMode
    );

    switch ( result ) {
        case "success":
            await context.editReplyWithStep(
                interaction,
                isBlockMode
                    ? "VertixBot/UI-V3/DynamicChannelPermissionsBlocked"
                    : "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked",
                {
                    userBlockedDisplayName: member.displayName
                }
            );
            break;
        default:
            await context.ephemeralWithStep( interaction, "VertixBot/UI-General/NothingChangedEmbedGroup" );
            break;
    }
}

export { DynamicChannelPermissionsAdapter };
