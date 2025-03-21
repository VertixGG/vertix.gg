import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";

import { DynamicChannelMetaRenameComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-component";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | UIDefaultModalChannelVoiceInteraction;

export class DynamicChannelMetaRenameAdapter extends DynamicChannelAdapterExuBase<DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaRenameAdapter";
    }

    public static getComponent() {
        return DynamicChannelMetaRenameComponent;
    }

    protected static getExecutionSteps() {
        return {
            default: {},
            "Vertix/UI-V2/DynamicChannelMetaRenameBadword": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelMetaRenameBadwordEmbedGroup"
            },
            "Vertix/UI-V2/DynamicChannelMetaRenameSuccess": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelMetaRenameSuccessEmbedGroup"
            },
            "Vertix/UI-V2/DynamicChannelMetaRenameRateLimited": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelMetaRenameLimitedEmbedGroup"
            }
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async getStartArgs( channel: VoiceChannel ) {
        return {};
    }

    protected async getReplyArgs( interaction: DefaultInteraction, argsFromManager: UIArgs ) {
        const args: UIArgs = {};

        // noinspection FallThroughInSwitchStatementJS
        switch ( this.getCurrentExecutionStep()?.name ) {
            case "Vertix/UI-V2/DynamicChannelMetaRenameBadword":
                args.badword = argsFromManager.badword;
                break;

            case "Vertix/UI-V2/DynamicChannelMetaRenameRateLimited":
                args.masterChannelId = argsFromManager.masterChannelId;
                args.retryAfter = argsFromManager.retryAfter;
                break;

            default:
                const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

                if ( masterChannelDB ) {
                    args.defaultChannelName = await MasterChannelDataManager.$.getChannelNameTemplate( masterChannelDB, true );
                } else {
                    args.defaultChannelName =  ConfigManager.$
                        .get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 )
                        .get( "settings" ).dynamicChannelNameTemplate;

                }

            case "Vertix/UI-V2/DynamicChannelMetaRenameSuccess":
                args.channelName = interaction.channel.name;
                break;
        }

        return args;
    }

    protected onEntityMap() {
        this.bindModal<UIDefaultModalChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelMetaRenameModal",
            this.onModalSubmit
        );
    }

    protected shouldDeletePreviousReply() {
        return true;
    }

    private async onModalSubmit( interaction: UIDefaultModalChannelVoiceInteraction ) {
        // Defer the interaction immediately unless it's already deferred
        if ( !interaction.deferred && !interaction.replied ) {
            try {
                await interaction.deferUpdate();
            } catch {
            }
        }

        const renameButtonId = this.customIdStrategy.generateId(
            "Vertix/UI-V2/DynamicChannelMetaRenameAdapter:Vertix/UI-V2/DynamicChannelMetaRenameInput"
        );

        let newChannelName = interaction.fields.getTextInputValue( renameButtonId ),
            masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

        newChannelName =
            ( await this.dynamicChannelService.getAssembledChannelNameTemplate(
                interaction.channel,
                interaction.user.id,
                newChannelName
            ) );

        const result = await this.dynamicChannelService.editChannelName(
            interaction,
            interaction.channel,
            newChannelName
        );

        switch ( result.code ) {
            case "success":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaRenameSuccess", {} );
                break;

            case "badword":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaRenameBadword", {
                    badword: result.badword
                } );
                break;

            case "rate-limit":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaRenameRateLimited", {
                    retryAfter: result.retryAfter,
                    masterChannelId: masterChannelDB?.channelId // No worries embed handles this situation.
                } );
                break;
        }
    }
}
