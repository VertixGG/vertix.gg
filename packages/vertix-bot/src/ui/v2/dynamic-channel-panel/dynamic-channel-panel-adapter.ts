import { VoiceChannel } from "discord.js";

import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { DynamicChannelAdapterBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-adapter-base";

import { DynamicChannelPanelComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel-panel/dynamic-channel-panel-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { Message } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

export class DynamicChannelPanelAdapter extends DynamicChannelAdapterBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPanelAdapter";
    }

    public static getComponent() {
        return DynamicChannelPanelComponent;
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        if ( !this.getArgsManager().getArgsById( this, message.id ) ) {
            await this.awakeInternal( message, newArgs || {} );
        }

        return super.editMessage( message, newArgs );
    }

    protected async getStartArgs( channel: UIAdapterStartContext, argsFromManager?: UIArgs ) {
        const resolvedChannel = await this.resolveChannelFromContext( channel, argsFromManager );

        if ( !resolvedChannel ) {
            return {
                dynamicChannelButtonsTemplate: argsFromManager?.dynamicChannelButtonsTemplate
            };
        }

        return this.getAllArgs( resolvedChannel );
    }

    protected async getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager?: UIArgs ): Promise<UIArgs> {
        const args = argsFromManager || {};

        const resolvedChannel = await this.resolveChannelFromContext(
            interaction.channel,
            args
        );

        if ( !resolvedChannel ) {
            return {
                dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
            };
        }

        return this.getAllArgs( resolvedChannel );
    }

    protected async getEditMessageArgs( message: Message<true>, argsFromManager?: UIArgs ) {
        const args = argsFromManager || {};

        const resolvedChannel = await this.resolveChannelFromContext(
            message.channel as UIAdapterStartContext,
            args
        );

        if ( !resolvedChannel ) {
            return {
                dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
            };
        }

        return this.getAllArgs( resolvedChannel );
    }

    protected onEntityMap() {
        this.bindButton( "VertixBot/UI-V2/DynamicChannelMetaRenameButton", this.onRenameButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelMetaClearChatButton", this.onClearChatButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelMetaLimitButton", this.onLimitButtonClicked );

        this.bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsStateButton", this.onToggleStateButtonClicked );
        this.bindButton(
            "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton",
            this.onToggleVisibilityStateButtonClicked
        );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton", this.onAccessButtonClicked );

        this.bindButton( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton", this.onResetChannelButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton", this.onClaimButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelTransferOwnerButton", this.onTransferOwnerButtonClicked );
    }

    private async onRenameButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService
            .get( "VertixBot/UI-V2/DynamicChannelMetaRenameAdapter" )
            ?.showModal( "VertixBot/UI-V2/DynamicChannelMetaRenameModal", interaction );
    }

    private async onClearChatButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "VertixBot/UI-V2/DynamicChannelMetaClearChatAdapter" )?.runInitial( interaction );
    }

    private async onLimitButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService
            .get( "VertixBot/UI-V2/DynamicChannelMetaLimitAdapter" )
            ?.showModal( "VertixBot/UI-V2/DynamicChannelMetaLimitModal", interaction );
    }

    private async onToggleStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onToggleVisibilityStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onAccessButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onResetChannelButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelAdapter" )?.runInitial( interaction );
    }

    private async onClaimButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const messages = this.uiService.get( "VertixBot/UI-V2/ClaimStartAdapter" )?.getStartedMessages( interaction.channel ),
            message = Object.values( messages || {} )[ 0 ];

        if ( !message ) {
            return DynamicChannelPanelAdapter.logger.error(
                this.onClaimButtonClicked,
                `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - No message found`
            );
        }

        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        switch ( state ) {
            case "idle":
            case "active":
                await DynamicChannelClaimManager.get( "VertixBot/UI-V2/DynamicChannelClaimManager" ).handleVoteRequest(
                    interaction,
                    message
                );

                return;
        }

        DynamicChannelPanelAdapter.logger.error(
            this.onClaimButtonClicked,
            `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - Invalid state: ${ DynamicChannelVoteManager.$.getState( interaction.channelId ) }`
        );
    }

    private async onTransferOwnerButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "VertixBot/UI-V2/DynamicChannelTransferOwnerAdapter" )?.runInitial( interaction );
    }

    private async resolveChannelFromContext( context: UIAdapterStartContext, argsFromManager?: UIArgs ): Promise<VoiceChannel | null> {
        if ( context instanceof VoiceChannel ) {
            return context;
        }

        const channelId = typeof argsFromManager?.channelId === "string" ? argsFromManager.channelId : null;

        if ( !channelId ) {
            return null;
        }

        const cached = context.guild.channels.cache.get( channelId );

        if ( cached instanceof VoiceChannel ) {
            return cached;
        }

        const fetched = await context.guild.channels.fetch( channelId ).catch( () => null );

        if ( fetched instanceof VoiceChannel ) {
            return fetched;
        }

        return null;
    }

    private async getAllArgs( channel: VoiceChannel ) {
        const args: UIArgs = {
                channelName: channel.name,
                userLimit: channel.userLimit,

                isPrivate: ( await this.dynamicChannelService.getChannelState( channel ) ) === "private",
                isHidden: ( await this.dynamicChannelService.getChannelVisibilityState( channel ) ) === "hidden",

                channelId: channel.id,

                region: channel.rtcRegion
            },
            masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

        if ( masterChannelDB ) {
            args.dynamicChannelButtonsTemplate =
                await MasterChannelDataManager.$.getChannelButtonsTemplate( masterChannelDB );
        }

        return args;
    }
}
