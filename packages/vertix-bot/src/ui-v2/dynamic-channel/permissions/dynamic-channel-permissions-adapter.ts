import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { DynamicChannelPermissionsComponent } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/dynamic-channel-permissions-component";

import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton,
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/elements";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";
import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

type DefaultInteraction =
    | UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultButtonChannelVoiceInteraction

export class DynamicChannelPermissionsAdapter extends DynamicChannelAdapterExuBase<DefaultInteraction> {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsAdapter";
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

            "VertixBot/UI-V2/DynamicChannelPermissionsStatePublic": {
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsPublicEmbedGroup"
            },
            "VertixBot/UI-V2/DynamicChannelPermissionsStatePrivate": {
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsPrivateEmbedGroup",
            },

            "VertixBot/UI-V2/DynamicChannelPermissionsStateHidden": {
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsHiddenEmbedGroup",
            },
            "VertixBot/UI-V2/DynamicChannelPermissionsStateShown": {
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsShownEmbedGroup",
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
                embedsGroup: "VertixBot/UI-V2/SomethingWentWrongEmbedGroup"
            },
            "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged": {
                embedsGroup: "VertixBot/UI-V2/NothingChangedEmbedGroup"
            },
        };
    }

    protected getStartArgs() {
        return {};
    }

    protected async getReplyArgs( interaction: DefaultInteraction, argsFromManager: UIArgs ) {
        const args: UIArgs = {};

        switch ( this.getCurrentExecutionStep()?.name ) {
            case "VertixBot/UI-V2/DynamicChannelPermissionsGranted":
                args.userGrantedDisplayName = argsFromManager.userGrantedDisplayName;
                break;

            case "VertixBot/UI-V2/DynamicChannelPermissionsDenied":
                args.userDeniedDisplayName = argsFromManager.userDeniedDisplayName;
                break;

            case "VertixBot/UI-V2/DynamicChannelPermissionsBlocked":
                args.userBlockedDisplayName = argsFromManager.userBlockedDisplayName;
                break;

            case "VertixBot/UI-V2/DynamicChannelPermissionsUnBlocked":
                args.userUnBlockedDisplayName = argsFromManager.userUnBlockedDisplayName;
                break;

            case "VertixBot/UI-V2/DynamicChannelPermissionsKick":
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

        args.allowedUsers = await this.dynamicChannelService.getChannelUsersWithPermissionState(
            interaction.channel,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            true,
        );
        args.blockedUsers = await this.dynamicChannelService.getChannelUsersWithPermissionState(
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
            "VertixBot/UI-V2/DynamicChannelPermissionsStateButton",
            this.onStateButtonClicked
        );

        // Hidden/Shown.
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton",
            this.onStateVisibilityClicked
        );

        // Access Button.
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton",
            this.onAccessButtonClicked
        );

        // Grant user access.
        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsGrantMenu",
            this.onGrantSelected
        );

        // Deny user access.
        this.bindSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsDenyMenu",
            this.onDenySelected,
        );

        // Block user.
        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsBlockMenu",
            this.onBlockSelected
        );

        // Unblock user.
        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsUnblockMenu",
            this.onUnBlockSelected
        );

        // Kick user.
        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsKickMenu",
            this.onKickSelected
        );
    }

    protected shouldDeletePreviousReply() {
        return true;
    }

    private async onStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        switch ( await this.dynamicChannelService.getChannelState( interaction.channel ) ) {
            case "public":
                /*
                 DynamicChannelManager.$.run( "edit/channel/state", {
                        initiator: interaction,
                        channel: interaction.channel,
                        state: "private",
                 } );
                 */

                if ( ! await this.dynamicChannelService.editChannelState( interaction, interaction.channel, "private" ) ) {
                    return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStatePrivate", {} );

            case "private":
                if ( ! await this.dynamicChannelService.editChannelState( interaction, interaction.channel, "public" ) ) {
                    return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStatePublic", {} );

            default:
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onStateVisibilityClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        switch ( await this.dynamicChannelService.getChannelVisibilityState( interaction.channel ) ) {
            case "shown":
                if ( ! await this.dynamicChannelService.editChannelVisibilityState( interaction, interaction.channel, "hidden" ) ) {
                    return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateHidden", {} );

            case "hidden":
                if ( ! await this.dynamicChannelService.editChannelVisibilityState( interaction, interaction.channel, "shown" ) ) {
                    return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateShown", {} );

            default:
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onAccessButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsAccess", {} );
    }

    private async onGrantSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( ! target ) {
            await interaction.deferUpdate().catch( () => {} );
            return;
        }

        switch ( await this.dynamicChannelService.addUserAccess( interaction, interaction.channel, target, DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsGranted", {
                    userGrantedDisplayName: target.displayName,
                } );
                break;

            case "action-on-bot-user":
            case "self-grant":
            case "already-granted":
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
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

        switch ( await this.dynamicChannelService.removeUserAccess( interaction, interaction.channel, target ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsDenied", {
                    userDeniedDisplayName: target.displayName,
                } );
                break;

            case "action-on-bot-user":
            case "self-deny":
            case "not-in-the-list":
            case "user-blocked":
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
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

        switch ( await this.dynamicChannelService.editUserAccess( interaction, interaction.channel, target, DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS, false ) ) {
            case "success":
                // Check if target is in the channel.
                if ( interaction.channel.members.has( target.id ) ) {
                    // Kick it.
                    await target.voice.setChannel( null ).catch( () => {} );
                }

                await this.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsBlocked", {
                    userBlockedDisplayName: target.displayName,
                } );
                break;

            case "action-on-bot-user":
            case "self-edit":
            case "already-have":
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
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

        switch ( await this.dynamicChannelService.removeUserAccess( interaction, interaction.channel, target, true ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsUnBlocked", {
                    userUnBlockedDisplayName: target.displayName,
                } );
                break;

            case "action-on-bot-user":
            case "not-in-the-list":
            case "self-deny":
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }

    private async onKickSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( ! target ) {
            await interaction.deferUpdate().catch( () => {} );
            return;
        }

        switch ( await this.dynamicChannelService.kickUser( interaction, interaction.channel, target ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsKick", {
                    userKickedDisplayName: target.displayName,
                } );
                break;

            case "not-in-the-list":
            case "action-on-bot-user":
            case "self-action":
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged", {} );

            default:
                return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }
}
