import { ChannelModel } from "@vertix-base/models/channel-model";

import { MasterChannelDataManager } from "@vertix-base/managers/master-channel-data-manager";

import { DynamicChannelPermissionsComponent } from "./dynamic-channel-permissions-component";

import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton,
} from "./elements";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";
import {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";

import { DynamicChannelAdapterExuBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";
import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix/definitions/dynamic-channel";

type DefaultInteraction =
    | UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultButtonChannelVoiceInteraction

export class DynamicChannelPermissionsAdapter extends DynamicChannelAdapterExuBase<DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsAdapter";
    }

    public static getComponent() {
        return DynamicChannelPermissionsComponent;
    }

    protected static getExcludedElements() {
        return [
            DynamicChannelPermissionsAccessButton,
            DynamicChannelPermissionsStateButton,
            DynamicChannelPermissionsVisibilityButton,
        ];
    }

    protected static getExecutionSteps() {
        return {
            default: {},

            "Vertix/UI-V2/DynamicChannelPermissionsStatePublic": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsPublicEmbedGroup"
            },
            "Vertix/UI-V2/DynamicChannelPermissionsStatePrivate": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsPrivateEmbedGroup",
            },

            "Vertix/UI-V2/DynamicChannelPermissionsStateHidden": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsHiddenEmbedGroup",
            },
            "Vertix/UI-V2/DynamicChannelPermissionsStateShown": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsShownEmbedGroup",
            },

            "Vertix/UI-V2/DynamicChannelPermissionsGranted": {
                elementsGroup: "Vertix/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsGrantedEmbedGroup"
            },
            "Vertix/UI-V2/DynamicChannelPermissionsDenied": {
                elementsGroup: "Vertix/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsDeniedEmbedGroup"
            },
            "Vertix/UI-V2/DynamicChannelPermissionsBlocked": {
                elementsGroup: "Vertix/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsBlockedEmbedGroup"
            },
            "Vertix/UI-V2/DynamicChannelPermissionsUnBlocked": {
                elementsGroup: "Vertix/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsUnblockedEmbedGroup"
            },
            "Vertix/UI-V2/DynamicChannelPermissionsKick": {
                elementsGroup: "Vertix/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsKickEmbedGroup"
            },

            "Vertix/UI-V2/DynamicChannelPermissionsAccess": {
                elementsGroup: "Vertix/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "Vertix/UI-V2/DynamicChannelPermissionsAccessEmbedGroup"
            },

            "Vertix/UI-V2/DynamicChannelPermissionsStateError": {
                embedsGroup: "Vertix/UI-V2/SomethingWentWrongEmbedGroup"
            },
            "Vertix/UI-V2/DynamicChannelPermissionsStateNothingChanged": {
                embedsGroup: "Vertix/UI-V2/NothingChangedEmbedGroup"
            },
        };
    }

    protected getStartArgs() {
        return {};
    }

    protected async getReplyArgs( interaction: DefaultInteraction, argsFromManager: UIArgs ) {
        const args: UIArgs = {};

        switch ( this.getCurrentExecutionStep()?.name ) {
            case "Vertix/UI-V2/DynamicChannelPermissionsGranted":
                args.userGrantedDisplayName = argsFromManager.userGrantedDisplayName;
                break;

            case "Vertix/UI-V2/DynamicChannelPermissionsDenied":
                args.userDeniedDisplayName = argsFromManager.userDeniedDisplayName;
                break;

            case "Vertix/UI-V2/DynamicChannelPermissionsBlocked":
                args.userBlockedDisplayName = argsFromManager.userBlockedDisplayName;
                break;

            case "Vertix/UI-V2/DynamicChannelPermissionsUnBlocked":
                args.userUnBlockedDisplayName = argsFromManager.userUnBlockedDisplayName;
                break;

            case "Vertix/UI-V2/DynamicChannelPermissionsKick":
                args.userKickedDisplayName = argsFromManager.userKickedDisplayName;
                break;
        }

        const masterChannelDB = await ChannelModel.$
            .getMasterChannelDBByDynamicChannelId( interaction.channel.id );

        if ( masterChannelDB ) {
            args.dynamicChannelButtonsTemplate = await MasterChannelDataManager.$.getChannelButtonsTemplate( masterChannelDB.id, false );
            args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
                ( buttonId: number ) => buttonId === DynamicChannelPermissionsAccessButton.getId()
            );
        }

        args.allowedUsers = await DynamicChannelManager.$.getChannelUsersWithPermissionState(
            interaction.channel,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            true,
        );
        args.blockedUsers = await DynamicChannelManager.$.getChannelUsersWithPermissionState(
            interaction.channel,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            false,
        );

        return args;
    }

    protected onEntityMap() {
        // TODO: Check if state buttons needed to move out from component, since they are non-visible.
        // Private/Public.
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsStateButton",
            this.onStateButtonClicked
        );

        // Hidden/Shown.
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsVisibilityButton",
            this.onStateVisibilityClicked
        );

        // Access Button.
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsAccessButton",
            this.onAccessButtonClicked
        );

        // Grant user access.
        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsGrantMenu",
            this.onGrantSelected
        );

        // Deny user access.
        this.bindSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsDenyMenu",
            this.onDenySelected,
        );

        // Block user.
        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsBlockMenu",
            this.onBlockSelected
        );

        // Unblock user.
        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsUnblockMenu",
            this.onUnBlockSelected
        );

        // Kick user.
        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsKickMenu",
            this.onKickSelected
        );
    }

    protected shouldDeletePreviousReply() {
        return true;
    }

    private async onStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        switch ( await DynamicChannelManager.$.getChannelState( interaction.channel ) ) {
            case "public":
                if ( ! await DynamicChannelManager.$.editChannelState( interaction, interaction.channel, "private" ) ) {
                    return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStatePrivate", {} );

            case "private":
                if ( ! await DynamicChannelManager.$.editChannelState( interaction, interaction.channel, "public" ) ) {
                    return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStatePublic", {} );

            default:
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onStateVisibilityClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        switch ( await DynamicChannelManager.$.getChannelVisibilityState( interaction.channel ) ) {
            case "shown":
                if ( ! await DynamicChannelManager.$.editChannelVisibilityState( interaction, interaction.channel, "hidden" ) ) {
                    return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateHidden", {} );

            case "hidden":
                if ( ! await DynamicChannelManager.$.editChannelVisibilityState( interaction, interaction.channel, "shown" ) ) {
                    return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateShown", {} );

            default:
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onAccessButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsAccess", {} );
    }

    private async onGrantSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( ! target ) {
            await interaction.deferUpdate().catch( () => {} );
            return;
        }

        switch ( await DynamicChannelManager.$.addUserAccess( interaction, interaction.channel, target, DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsGranted", {
                    userGrantedDisplayName: target.displayName,
                } );
                break;

            case "action-on-bot-user":
            case "self-grant":
            case "already-granted":
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onDenySelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( ! target ) {
            await interaction.deferUpdate().catch( () => {
            } );
            return;
        }

        switch ( await DynamicChannelManager.$.removeUserAccess( interaction, interaction.channel, target ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsDenied", {
                    userDeniedDisplayName: target.displayName,
                } );
                break;

            case "action-on-bot-user":
            case "self-deny":
            case "not-in-the-list":
            case "user-blocked":
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onBlockSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( ! target ) {
            await interaction.deferUpdate().catch( () => {
            } );
            return;
        }

        switch ( await DynamicChannelManager.$.editUserAccess( interaction, interaction.channel, target, DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS, false ) ) {
            case "success":
                // Check if target is in the channel.
                if ( interaction.channel.members.has( target.id ) ) {
                    // Kick it.
                    await target.voice.setChannel( null ).catch( () => {} );
                }

                await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsBlocked", {
                    userBlockedDisplayName: target.displayName,
                } );
                break;

            case "action-on-bot-user":
            case "self-edit":
            case "already-have":
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onUnBlockSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( ! target ) {
            await interaction.deferUpdate().catch( () => {
            } );
            return;
        }

        switch ( await DynamicChannelManager.$.removeUserAccess( interaction, interaction.channel, target, true ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsUnBlocked", {
                    userUnBlockedDisplayName: target.displayName,
                } );
                break;

            case "action-on-bot-user":
            case "not-in-the-list":
            case "self-deny":
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onKickSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( ! target ) {
            await interaction.deferUpdate().catch( () => {} );
            return;
        }

        switch ( await DynamicChannelManager.$.kickUser( interaction, interaction.channel, target ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsKick", {
                    userKickedDisplayName: target.displayName,
                } );
                break;

            case "not-in-the-list":
            case "action-on-bot-user":
            case "self-action":
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }
}
