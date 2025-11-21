import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { UserMasterChannelDataModel } from "@vertix.gg/base/src/models/data/user-master-channel-data-model";
import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/dynamic-channel-component";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { BaseMessageOptions, Message, VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type UIService from "@vertix.gg/gui/src/ui-service";

const DYNAMIC_CHANNEL_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPrimaryMessageElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannel/EmbedsGroup"
    }
} as const;

const logger = new Logger( "VertixBot/UI-V3/DynamicChannelAdapter" );

async function getAllArgs( channel: VoiceChannel, argsFromManager: UIArgs = {} ) {
    const args: UIArgs = {
            channelName: channel.name,
            userLimit: ( channel as VoiceChannel ).userLimit,

            state: await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" ).getChannelPrivacyState( channel ),

            channelId: channel.id,

            region: channel.rtcRegion
        },
        masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

    if ( masterChannelDB ) {
        const settings = await MasterChannelDataModelV3.$.getSettings( masterChannelDB.id );

        const templateButtons = settings?.dynamicChannelButtonsTemplate;

        args.dynamicChannelButtonsTemplate = templateButtons?.length
            ? DynamicChannelPrimaryMessageElementsGroup.sortIds( templateButtons )
            : DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() );

        if ( argsFromManager.ownerId ) {
            const primaryMessage = await UserMasterChannelDataModel.$.getPrimaryMessage(
                argsFromManager.ownerId,
                masterChannelDB.id
            );

            const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
                "Vertix/Config/MasterChannel",
                VERSION_UI_V3
            );

            Object.assign( args, {
                title: primaryMessage?.title || configV3.data.constants.dynamicChannelPrimaryMessageTitle,
                description: primaryMessage?.description || configV3.data.constants.dynamicChannelPrimaryMessageDescription
            } );
        }
    }

    return args;
}

async function onRenameButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService
        .get( "VertixBot/UI-V3/DynamicChannelRenameAdapter" )
        ?.showModal( "VertixBot/UI-V3/DynamicChannelRenameModal", interaction );
}

async function onLimitButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService
        .get( "VertixBot/UI-V3/DynamicChannelLimitAdapter" )
        ?.showModal( "VertixBot/UI-V3/DynamicChannelLimitModal", interaction );
}

async function onAccessButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelPermissionsAdapter" );
    if ( adapter ) {
        await adapter.ephemeral( interaction );
    }
}

async function onPrivacyButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V3/DynamicChannelPrivacyAdapter" )?.runInitial( interaction );
}

async function onRegionButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V3/DynamicChannelRegionAdapter" )?.runInitial( interaction );
}

async function onPrimaryMessageEditButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter" )?.runInitial( interaction );
}

async function onClearChatButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V3/DynamicChannelClearChatAdapter" )?.runInitial( interaction );
}

async function onResetChannelButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V3/DynamicChannelResetChannelAdapter" )?.runInitial( interaction );
}

async function onClaimButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    const messages = uiService.get( "VertixBot/UI-V3/ClaimStartAdapter" )?.getStartedMessages( interaction.channel ),
        message = Object.values( messages || {} )[ 0 ];

    if ( !message ) {
        return logger.error(
            onClaimButtonClicked,
            `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - No message found`
        );
    }

    const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

    switch ( state ) {
        case "idle":
        case "active":
            await DynamicChannelClaimManager.get( "VertixBot/UI-V3/DynamicChannelClaimManager" ).handleVoteRequest(
                interaction,
                message
            );

            return;
    }

    logger.error(
        onClaimButtonClicked,
        `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - Invalid state: ${ DynamicChannelVoteManager.$.getState( interaction.channelId ) }`
    );
}

async function onTransferOwnerButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter" )?.runInitial( interaction );
}

const DynamicChannelAdapterBase = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelAdapter"
)
    .setComponent( DynamicChannelComponent )
    .setExecutionSteps( DYNAMIC_CHANNEL_STEPS )
    .getStartArgs( async( _context, channel, argsFromManager = {} ) => getAllArgs( channel, argsFromManager ) )
    .getReplyArgs( async( _context, interaction, argsFromManager = {} ) => getAllArgs( interaction.channel, argsFromManager ) )
    .getEditMessageArgs( async( _context, message, argsFromManager = {} ) => {
        if ( !message?.channel ) {
            return argsFromManager;
        }
        return getAllArgs( message.channel as VoiceChannel, argsFromManager );
    } )
    .onEntityMap( async( { bindButton } ) => {
        bindButton( "VertixBot/UI-V3/DynamicChannelRenameButton", onRenameButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelLimitMetaButton", onLimitButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton", onAccessButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelPrivacyButton", onPrivacyButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelRegionButton", onRegionButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton", onPrimaryMessageEditButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelClearChatButton", onClearChatButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelResetChannelButton", onResetChannelButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelClaimChannelButton", onClaimButtonClicked );
        bindButton( "VertixBot/UI-V3/DynamicChannelTransferOwnerButton", onTransferOwnerButtonClicked );
    } )
    .build();

class DynamicChannelAdapter extends DynamicChannelAdapterBase {
    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        if ( !this.getArgsManager().getArgsById( this, message.id ) ) {
            await this.awakeInternal( message, newArgs );
        }

        return super.editMessage( message, newArgs );
    }

    protected getMessage(
        from: UIAdapterBuildSource,
        context: VoiceChannel | UIDefaultButtonChannelVoiceInteraction,
        argsFromManager: UIArgs
    ): BaseMessageOptions {
        const result = super.getMessage( from, context, argsFromManager );

        if ( "send" === from || "edit" === from || "edit-message" === from ) {
            if ( argsFromManager.dynamicChannelMentionable ) {
                result.content = "<@" + argsFromManager.ownerId + ">";
            }
        }

        return result;
    }
}

export { DynamicChannelAdapter };
