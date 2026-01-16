import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";
import { DynamicChannelPanelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel-panel/dynamic-channel-panel-component";
import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";
import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";
import { DynamicChannelUIData } from "@vertix.gg/bot/src/data/dynamic-channel/dynamic-channel-ui-data";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { Message } from "discord.js";
import type UIService from "@vertix.gg/gui/src/ui-service";

const DYNAMIC_CHANNEL_PANEL_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPrimaryMessageElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannelPanel/EmbedsGroup"
    }
} as const;

const logger = new Logger( "VertixBot/UI-V3/DynamicChannelPanelAdapter" );

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
    const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelPrivacyAdapter" );
    if ( adapter ) {
        await adapter.ephemeral( interaction );
    }
}

async function onRegionButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelRegionAdapter" );
    if ( adapter ) {
        await adapter.ephemeral( interaction );
    }
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

async function onTemplatesButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const { ChannelTemplateModel } = await import( "@vertix.gg/base/src/models/data/channel-template-model" );

    const templates = await ChannelTemplateModel.$.getTemplates(
        interaction.user.id,
        interaction.guildId
    );

    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelTemplatesAdapter" );

    if ( adapter ) {
        await adapter.ephemeral( interaction, {
            templates,
            maxTemplates: 5
        } );
    }
}

const DynamicChannelPanelAdapterBase = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelPanelAdapter"
)
    .setComponent( DynamicChannelPanelComponent )
    .setExecutionSteps( DYNAMIC_CHANNEL_PANEL_STEPS )
    .setArgsDataSource( [ "all" ], DynamicChannelUIData.getName() )
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
        bindButton( "VertixBot/UI-V3/DynamicChannelTemplatesButton", onTemplatesButtonClicked );
    } )
    .build();

class DynamicChannelPanelAdapter extends DynamicChannelPanelAdapterBase {
    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        if ( !this.getArgsManager().getArgsById( this, message.id ) ) {
            await this.awakeInternal( message, newArgs );
        }

        return super.editMessage( message, newArgs );
    }
}

export { DynamicChannelPanelAdapter };
