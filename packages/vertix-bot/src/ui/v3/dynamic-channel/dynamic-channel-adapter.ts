import { UserMasterChannelDataModel } from "@vertix.gg/base/src/models/data/user-master-channel-data-model";
import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/data/v3/master-channel-data-model-v3";

import { DynamicChannelAdapterBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-base";

import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/dynamic-channel-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { BaseMessageOptions, Message, VoiceChannel } from "discord.js";

export class DynamicChannelAdapter extends DynamicChannelAdapterBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelAdapter";
    }

    public static getComponent() {
        return DynamicChannelComponent;
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        if ( ! this.getArgsManager().getArgsById( this, message.id ) ) {
            await this.awakeInternal( message, newArgs );
        }

        return super.editMessage( message, newArgs );
    }

    protected async getStartArgs( channel: VoiceChannel, argsFromManager: UIArgs = {} ) {
        return this.getAllArgs( channel, argsFromManager );
    }

    protected async getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager: UIArgs = {} ) {
        return this.getAllArgs( interaction.channel, argsFromManager );
    }

    protected async getEditMessageArgs( message: Message<true>, argsFromManager: UIArgs = {} ) {
        return this.getAllArgs( message.channel as VoiceChannel, argsFromManager );
    }

    protected onEntityMap() {
        this.bindButton( "Vertix/UI-V3/DynamicChannelRenameButton", this.onRenameButtonClicked );
        this.bindButton( "Vertix/UI-V3/DynamicChannelLimitMetaButton", this.onLimitButtonClicked );
        this.bindButton( "Vertix/UI-V3/DynamicChannelPermissionsAccessButton", this.onAccessButtonClicked );
        this.bindButton( "Vertix/UI-V3/DynamicChannelPrivacyButton", this.onPrivacyButtonClicked );
        this.bindButton( "Vertix/UI-V3/DynamicChannelRegionButton", this.onRegionButtonClicked );

        this.bindButton( "Vertix/UI-V3/DynamicChannelPrimaryMessageEditButton", this.onPrimaryMessageEditButtonClicked );
        this.bindButton( "Vertix/UI-V3/DynamicChannelClearChatButton", this.onClearChatButtonClicked );
        this.bindButton( "Vertix/UI-V3/DynamicChannelResetChannelButton", this.onResetChannelButtonClicked );
        this.bindButton( "Vertix/UI-V3/DynamicChannelClaimChannelButton", this.onClaimButtonClicked );
        this.bindButton( "Vertix/UI-V3/DynamicChannelTransferOwnerButton", this.onTransferOwnerButtonClicked );
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
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelRenameAdapter" )
            ?.showModal( "Vertix/UI-V3/DynamicChannelRenameModal", interaction );
    }

    private async onLimitButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelLimitAdapter" )
            ?.showModal( "Vertix/UI-V3/DynamicChannelLimitModal", interaction );
    }

    private async onAccessButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
    }

    private async onPrivacyButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelPrivacyAdapter" )?.runInitial( interaction );
    }

    private async onRegionButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelRegionAdapter" )?.runInitial( interaction );
    }

    private async onPrimaryMessageEditButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelPrimaryMessageEditAdapter" )?.runInitial( interaction );
    }

    private async onClearChatButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelClearChatAdapter" )?.runInitial( interaction );
    }

    private async onResetChannelButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelResetChannelAdapter" )?.runInitial( interaction );
    }

    private async onClaimButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const messages = this.uiService.get( "Vertix/UI-V3/ClaimStartAdapter" )
                ?.getStartedMessages( interaction.channel ),
            message = Object.values( messages || {} )[ 0 ];

        if ( ! message ) {
            return DynamicChannelAdapter.logger.error( this.onClaimButtonClicked,
                `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - No message found` );
        }

        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        switch ( state ) {
            case "idle":
            case "active":
                await DynamicChannelClaimManager.get( "Vertix/UI-V3/DynamicChannelClaimManager" )
                    .handleVoteRequest( interaction, message );

                return;
        }

        DynamicChannelAdapter.logger.error( this.onClaimButtonClicked,
            `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - Invalid state: ${ DynamicChannelVoteManager.$.getState( interaction.channelId ) }` );
    }

    private async onTransferOwnerButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.uiService.get( "Vertix/UI-V3/DynamicChannelTransferOwnerAdapter" )?.runInitial( interaction );
    }

    private async getAllArgs( channel: VoiceChannel, argsFromManager: UIArgs = {} ) {
        const args: UIArgs = {
                channelName: channel.name,
                userLimit: ( channel as VoiceChannel ).userLimit,

                state: await this.dynamicChannelService.getChannelPrivacyState( channel ),

                channelId: channel.id,

                region: channel.rtcRegion,
            },
            masterChannelDB =
                await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

        if ( masterChannelDB ) {
            args.dynamicChannelButtonsTemplate =
                ( await MasterChannelDataModelV3.$.getSettings( masterChannelDB.id ) )?.dynamicChannelButtonsTemplate;

            if ( argsFromManager.ownerId ) {
                const primaryMessage = await UserMasterChannelDataModel.$.getPrimaryMessage(
                    argsFromManager.ownerId, masterChannelDB.id
                );

                Object.assign( args, primaryMessage );
            }
        }

        return args;
    }
}
