
import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import {
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE
} from "@vertix.gg/base/src/definitions/master-channel-data-keys";

import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/dynamic-channel-component";
import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";
import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelAdapterBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-adapter-base";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";
import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { BaseMessageOptions, Message, VoiceChannel } from "discord.js";

export class DynamicChannelAdapter extends DynamicChannelAdapterBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelAdapter";
    }

    public static getComponent() {
        return DynamicChannelComponent;
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        if ( ! this.getArgsManager().getArgsById( this, message.id ) ) {
            await this.awakeInternal( message, {} );
        }

        return super.editMessage( message, newArgs );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async getStartArgs( channel: VoiceChannel, argsFromManager: UIArgs ) {
        return this.getAllArgs( channel );
    }

    protected async getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction ): Promise<UIArgs> {
        return this.getAllArgs( interaction.channel );
    }

    protected async getEditMessageArgs( message: Message<true> ) {
        return this.getAllArgs( message.channel as VoiceChannel );
    }

    protected onEntityMap() {
        this.bindButton( "VertixBot/UI-V2/DynamicChannelMetaRenameButton", this.onRenameButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelMetaClearChatButton", this.onClearChatButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelMetaLimitButton", this.onLimitButtonClicked );

        this.bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsStateButton", this.onToggleStateButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton", this.onToggleVisibilityStateButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton", this.onAccessButtonClicked );

        this.bindButton( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton", this.onResetChannelButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton", this.onClaimButtonClicked );
        this.bindButton( "VertixBot/UI-V2/DynamicChannelTransferOwnerButton", this.onTransferOwnerButtonClicked );
    }

    protected getMessage( from: UIAdapterBuildSource, context: VoiceChannel | UIDefaultButtonChannelVoiceInteraction, argsFromManager: UIArgs ): BaseMessageOptions {
        const result = super.getMessage();

        if ( "send" === from || "edit" === from || "edit-message" === from ) {
            if ( argsFromManager.dynamicChannelMentionable ) {
                result.content = "<@" + argsFromManager.ownerId + ">";
            }
        }

        return result;
    }

    private async onRenameButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiAdapterService.get( "VertixBot/UI-V2/DynamicChannelMetaRenameAdapter" )?.showModal( "VertixBot/UI-V2/DynamicChannelMetaRenameModal", interaction );
    }

    private async onClearChatButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiAdapterService.get( "VertixBot/UI-V2/DynamicChannelMetaClearChatAdapter" )?.runInitial( interaction );
    }

    private async onLimitButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiAdapterService.get( "VertixBot/UI-V2/DynamicChannelMetaLimitAdapter" )?.showModal( "VertixBot/UI-V2/DynamicChannelMetaLimitModal", interaction );
    }

    private async onToggleStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiAdapterService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onToggleVisibilityStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiAdapterService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onAccessButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiAdapterService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onResetChannelButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiAdapterService.get( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelAdapter" )?.runInitial( interaction );
    }

    private async onClaimButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const messages = this.uiAdapterService.get( "VertixBot/UI-V2/ClaimStartAdapter" )?.getStartedMessages( interaction.channel ),
            message = Object.values( messages || {} )[ 0 ];

        if ( ! message ) {
            return DynamicChannelAdapter.logger.error( this.onClaimButtonClicked,
                `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - No message found` );
        }

        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        switch ( state ) {
            case "idle":
            case "active":
                await DynamicChannelClaimManager.$.handleVoteRequest( interaction, message );
                return;
        }

        DynamicChannelAdapter.logger.error( this.onClaimButtonClicked,
            `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - Invalid state: ${ DynamicChannelVoteManager.$.getState( interaction.channelId ) }` );
    }

    private async onTransferOwnerButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiAdapterService.get( "VertixBot/UI-V2/DynamicChannelTransferOwnerAdapter" )?.runInitial( interaction );
    }

    private async getAllArgs( channel: VoiceChannel ) {
        const args: UIArgs = {
                channelName: channel.name,
                userLimit: ( channel as VoiceChannel ).userLimit,

                isPrivate: await this.dynamicChannelService.getChannelState( channel ) === "private",
                isHidden: await this.dynamicChannelService.getChannelVisibilityState( channel ) === "hidden",

                channelId: channel.id,

                region: channel.rtcRegion,
            },
            masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        if ( masterChannelDB ) {
            const masterChannelData =
                await ChannelDataManager.$.getSettingsData( masterChannelDB.id, false, true );

            args.dynamicChannelButtonsTemplate = masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ];
        }

        return args;
    }
}
