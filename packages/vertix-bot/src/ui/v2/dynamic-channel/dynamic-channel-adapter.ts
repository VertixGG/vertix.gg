import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { DynamicChannelAdapterBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-adapter-base";

import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/dynamic-channel-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { BaseMessageOptions, Message, VoiceChannel } from "discord.js";

export class DynamicChannelAdapter extends DynamicChannelAdapterBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelAdapter";
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
        this.bindButton( "Vertix/UI-V2/DynamicChannelMetaRenameButton", this.onRenameButtonClicked );
        this.bindButton( "Vertix/UI-V2/DynamicChannelMetaClearChatButton", this.onClearChatButtonClicked );
        this.bindButton( "Vertix/UI-V2/DynamicChannelMetaLimitButton", this.onLimitButtonClicked );

        this.bindButton( "Vertix/UI-V2/DynamicChannelPermissionsStateButton", this.onToggleStateButtonClicked );
        this.bindButton( "Vertix/UI-V2/DynamicChannelPermissionsVisibilityButton", this.onToggleVisibilityStateButtonClicked );
        this.bindButton( "Vertix/UI-V2/DynamicChannelPermissionsAccessButton", this.onAccessButtonClicked );

        this.bindButton( "Vertix/UI-V2/DynamicChannelPremiumResetChannelButton", this.onResetChannelButtonClicked );
        this.bindButton( "Vertix/UI-V2/DynamicChannelPremiumClaimChannelButton", this.onClaimButtonClicked );
        this.bindButton( "Vertix/UI-V2/DynamicChannelTransferOwnerButton", this.onTransferOwnerButtonClicked );
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
        await this.uiService.get( "Vertix/UI-V2/DynamicChannelMetaRenameAdapter" )?.showModal( "Vertix/UI-V2/DynamicChannelMetaRenameModal", interaction );
    }

    private async onClearChatButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V2/DynamicChannelMetaClearChatAdapter" )?.runInitial( interaction );
    }

    private async onLimitButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V2/DynamicChannelMetaLimitAdapter" )?.showModal( "Vertix/UI-V2/DynamicChannelMetaLimitModal", interaction );
    }

    private async onToggleStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onToggleVisibilityStateButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onAccessButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onResetChannelButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V2/DynamicChannelPremiumResetChannelAdapter" )?.runInitial( interaction );
    }

    private async onClaimButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const messages = this.uiService.get( "Vertix/UI-V2/ClaimStartAdapter" )?.getStartedMessages( interaction.channel ),
            message = Object.values( messages || {} )[ 0 ];

        if ( ! message ) {
            return DynamicChannelAdapter.logger.error( this.onClaimButtonClicked,
                `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - No message found` );
        }

        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        switch ( state ) {
            case "idle":
            case "active":
                await DynamicChannelClaimManager.get( "Vertix/UI-V2/DynamicChannelClaimManager" )
                    .handleVoteRequest( interaction, message );

                return;
        }

        DynamicChannelAdapter.logger.error( this.onClaimButtonClicked,
            `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - Invalid state: ${ DynamicChannelVoteManager.$.getState( interaction.channelId ) }` );
    }

    private async onTransferOwnerButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V2/DynamicChannelTransferOwnerAdapter" )?.runInitial( interaction );
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
            masterChannelDB =
                await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

        if ( masterChannelDB ) {
            args.dynamicChannelButtonsTemplate =
                await MasterChannelDataManager.$.getChannelButtonsTemplate( masterChannelDB );
        }

        return args;
    }
}
