import { DynamicChannelPermissionsComponent } from "./dynamic-channel-permissions-component";

import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton,
} from "./elements";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";
import {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";

import { DynamicChannelAdapterExuBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";
import { ChannelManager } from "@vertix/managers/channel-manager";
import { MasterChannelManager } from "@vertix/managers/master-channel-manager";

type DefaultInteraction =
    | UIDefaultStringSelectMenuChannelVoiceInteraction
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
                elementsGroup: "Vertix/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
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
        }

        const masterChannelDB = await ChannelManager.$
            .getMasterChannelDBByDynamicChannelId( interaction.channel.id );

        if ( masterChannelDB ) {
            args.dynamicChannelButtonsTemplate = await MasterChannelManager.$.getChannelButtonsTemplate( masterChannelDB.id, false );
            args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
                ( buttonId: number ) => buttonId === DynamicChannelPermissionsAccessButton.getId()
            );
        }

        args.allowedUsers = await DynamicChannelManager.$.getAllowedUsersTags( interaction.channel );

        return args;
    }

    protected onEntityMap() {
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
        this.bindUserSelectMenu<UIDefaultStringSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsGrantMenu",
            this.onGrantSelected
        );

        // Deny user access.
        this.bindSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelPermissionsDenyMenu",
            this.onDenySelected,
        );
    }

    protected shouldDeletePreviousReply() {
        return true;
    }

    private async onStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        switch ( await DynamicChannelManager.$.getChannelState( interaction.channel ) ) {
            case "public":
                if ( ! await DynamicChannelManager.$.editChannelState( interaction.channel, "private" ) ) {
                    return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStatePrivate", {} );

            case "private":
                if ( ! await DynamicChannelManager.$.editChannelState( interaction.channel, "public" ) ) {
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
                if ( ! await DynamicChannelManager.$.editChannelVisibilityState( interaction.channel, "hidden" ) ) {
                    return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
                }

                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateHidden", {} );

            case "hidden":
                if ( ! await DynamicChannelManager.$.editChannelVisibilityState( interaction.channel, "shown" ) ) {
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

    private async onGrantSelected( interaction: UIDefaultStringSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( ! target ) {
            return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }

        switch ( await DynamicChannelManager.$.grantUserAccess( interaction.channel, target ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsGranted", {
                    userGrantedDisplayName: target.displayName,
                } );
                break;

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
            return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }

        switch ( await DynamicChannelManager.$.denyUserAccess( interaction.channel, target ) ) {
            case "success":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsDenied", {
                    userDeniedDisplayName: target.displayName,
                } );
                break;

            default:
                return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelPermissionsStateError", {} );
        }
    }
}
