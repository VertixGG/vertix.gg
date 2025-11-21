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
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { VoiceChannel } from "discord.js";

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
    .onEntityMap( async( { bindButton, bindSelectMenu, bindUserSelectMenu } ) => {
        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsStateButton",
            async( context, interaction ) => {
                const state = interaction.customId.split( ":" )[ 2 ];
                if ( state === "public" || state === "private" ) {
                    await onStateChanged( context, interaction, state );
                }
            }
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsVisibilityButton",
            async( context, interaction ) => {
                const visibility = interaction.customId.split( ":" )[ 2 ];
                if ( visibility === "hidden" || visibility === "shown" ) {
                    await onVisibilityChanged( context, interaction, visibility );
                }
            }
        );

        bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu",
            async( context, interaction ) => {
                const userId = interaction.values[ 0 ];
                const result = await ServiceLocator.$
                    .get( "VertixBot/Services/DynamicChannel" )
                    .editUserPermissions(
                        interaction,
                        interaction.channel,
                        userId,
                        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS
                    );
                switch ( result.code ) {
                    case "success":
                        await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsGranted", {
                            userGrantedDisplayName: interaction.users.first()?.displayName
                        } );
                        break;
                    case "not-found":
                        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        break;
                }
            }
        );

        bindSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu",
            async( context, interaction ) => {
                const result = await ServiceLocator.$
                    .get( "VertixBot/Services/DynamicChannel" )
                    .editUserPermissions(
                        interaction,
                        interaction.channel,
                        interaction.values[ 0 ],
                        []
                    );
                switch ( result.code ) {
                    case "success":
                        await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsDenied", {
                            userDeniedDisplayName: interaction.users.first()?.displayName
                        } );
                        break;
                    case "not-found":
                        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        break;
                }
            }
        );

        bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu",
            async( context, interaction ) => {
                await onBlockChanged( context, interaction, true, interaction.values[ 0 ] );
            }
        );

        bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu",
            async( context, interaction ) => {
                await onBlockChanged( context, interaction, false, interaction.values[ 0 ] );
            }
        );

        bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu",
            async( context, interaction ) => {
                const userId = interaction.values[ 0 ];
                const result = await ServiceLocator.$
                    .get( "VertixBot/Services/DynamicChannel" )
                    .kickUser( interaction, interaction.channel, userId );
                switch ( result.code ) {
                    case "success":
                        await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsKick", {
                            userKickedDisplayName: interaction.users.first()?.displayName
                        } );
                        break;
                    case "not-found":
                        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
                        break;
                }
            }
        );
    } )
    .build();

async function getUsersWithPermissions( channel: VoiceChannel ) {
    const dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );
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
        allowedUsers: allowed.allowedUsers,
        blockedUsers: blocked.blockedUsers
    };
}

async function onStateChanged(
    context: IExecutionAdapterContext<any, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction,
    state: "public" | "private"
) {
    const result = await ServiceLocator.$
        .get( "VertixBot/Services/DynamicChannel" )
        .editChannelPrivacyState( interaction, interaction.channel, state );

    switch ( result.code ) {
        case "success":
            await context.editReplyWithStep(
                interaction,
                "VertixBot/UI-V3/DynamicChannelPermissionsState" + state[ 0 ].toUpperCase() + state.substring( 1 )
            );
            break;
        case "bad-state":
            await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
            break;
    }
}

async function onVisibilityChanged(
    context: IExecutionAdapterContext<any, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction,
    visibility: "hidden" | "shown"
) {
    const result = await ServiceLocator.$
        .get( "VertixBot/Services/DynamicChannel" )
        .editChannelVisibilityState(
            interaction,
            interaction.channel,
            visibility
        );
    switch ( result.code ) {
        case "success":
            await context.editReplyWithStep(
                interaction,
                "VertixBot/UI-V3/DynamicChannelPermissionsState" + visibility[ 0 ].toUpperCase() + visibility.substring( 1 )
            );
            break;
        case "bad-state":
            await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPermissionsStateError" );
            break;
    }
}

async function onBlockChanged(
    context: IExecutionAdapterContext<any, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction,
    isBlockMode: boolean,
    userId: string
) {
    const result = await ServiceLocator.$
        .get( "VertixBot/Services/DynamicChannel" )
        .setUserAccess(
            interaction,
            interaction.channel,
            userId,
            !isBlockMode
        );

    switch ( result.code ) {
        case "success":
            await context.editReplyWithStep(
                interaction,
                isBlockMode
                    ? "VertixBot/UI-V3/DynamicChannelPermissionsBlocked"
                    : "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked"
            );
            break;
        case "not-found":
            await context.ephemeralWithStep( interaction, "VertixBot/UI-General/NothingChangedEmbedGroup" );
            break;
    }
}

export { DynamicChannelPermissionsAdapter };
