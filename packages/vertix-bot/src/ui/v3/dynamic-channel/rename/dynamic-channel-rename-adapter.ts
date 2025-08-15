import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { MasterChannelDataDynamicManager } from "@vertix.gg/base/src/managers/master-channel-data-dynamic-manager";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { DynamicChannelRenameComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-component";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";

import type { MasterChannelDynamicConfig } from "@vertix.gg/base/src/interfaces/master-channel-config";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | UIDefaultModalChannelVoiceInteraction;

export class DynamicChannelRenameAdapter extends DynamicChannelAdapterExuBase<DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRenameAdapter";
    }

    public static getComponent() {
        return DynamicChannelRenameComponent;
    }

    protected static getExecutionSteps() {
        return {
            default: {},
            "Vertix/UI-V3/DynamicChannelRenameBadword": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelRenameBadwordEmbedGroup"
            },
            "Vertix/UI-V3/DynamicChannelRenameSuccess": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelRenameSuccessEmbedGroup"
            },
            "Vertix/UI-V3/DynamicChannelRenameRateLimited": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelRenameLimitedEmbedGroup"
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
            case "Vertix/UI-V3/DynamicChannelRenameBadword":
                args.badword = argsFromManager.badword;
                break;

            case "Vertix/UI-V3/DynamicChannelRenameRateLimited":
                args.masterChannelId = argsFromManager.masterChannelId;
                args.retryAfter = argsFromManager.retryAfter;
                break;

            default:
                const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

                if ( masterChannelDB ) {
                    args.defaultChannelName = await MasterChannelDataDynamicManager.$.getChannelNameTemplate( masterChannelDB, true );
                } else {
                    args.defaultChannelName =  ConfigManager.$
                        .get<MasterChannelDynamicConfig>( "Vertix/Config/MasterChannelDynamic", VERSION_UI_V3 )
                        .get( "settings" ).dynamicChannelNameTemplate;

                }
            case "Vertix/UI-V3/DynamicChannelRenameSuccess":
                args.channelName = interaction.channel.name;
                break;
        }

        return args;
    }

    protected onEntityMap() {
        this.bindModal<UIDefaultModalChannelVoiceInteraction>(
            "Vertix/UI-V3/DynamicChannelRenameModal",
            this.onModalSubmit
        );
    }

    private async onModalSubmit( interaction: UIDefaultModalChannelVoiceInteraction ) {
        if ( !interaction.deferred && !interaction.replied ) {
            try {
                await interaction.deferUpdate();
            } catch {
            }
        }

        const renameButtonId = this.customIdStrategy.generateId(
            "Vertix/UI-V3/DynamicChannelRenameAdapter:Vertix/UI-V3/DynamicChannelRenameInput"
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
                await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelRenameSuccess", {} );
                break;

            case "badword":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelRenameBadword", {
                    badword: result.badword
                } );
                break;

            case "rate-limit":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelRenameRateLimited", {
                    retryAfter: result.retryAfter,
                    masterChannelId: masterChannelDB?.channelId // No worries embed handles this situation.
                } );
                break;
        }
    }
}
