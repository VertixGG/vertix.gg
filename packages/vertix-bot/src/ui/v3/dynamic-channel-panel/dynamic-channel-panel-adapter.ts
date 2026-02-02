import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";
import { DynamicChannelPanelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel-panel/dynamic-channel-panel-component";
import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";
import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";
import { DynamicChannelUIData } from "@vertix.gg/bot/src/data/dynamic-channel/dynamic-channel-ui-data";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
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

// Note: DynamicChannelPanelAdapter is a variant of DynamicChannelAdapter shown in panel channels.
// It shares the same buttons and behavior, so we define a hidden transaction for handler bindings.
const DynamicChannelPanelAdapterBase = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelPanelAdapter"
)
    .setComponent( DynamicChannelPanelComponent )
    .setExecutionSteps( DYNAMIC_CHANNEL_PANEL_STEPS )
    .setArgsDataSource( [ "all" ], DynamicChannelUIData.getName() )
    .defineTransactions( ( tx ) => {
        tx
            .setHidden( true ) // Hide from visualization since DynamicChannelAdapter already shows the flow
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { channelName: "My Channel", ownerId: "123456789" }
            } )
            // Transitions (same as DynamicChannelAdapter, but hidden)
            .addTransition( "OpenRename", { from: "Default", to: "Default" } )
            .addTransition( "OpenLimit", { from: "Default", to: "Default" } )
            .addTransition( "OpenPermissions", { from: "Default", to: "Default" } )
            .addTransition( "OpenPrivacy", { from: "Default", to: "Default" } )
            .addTransition( "OpenRegion", { from: "Default", to: "Default" } )
            .addTransition( "OpenPrimaryMessageEdit", { from: "Default", to: "Default" } )
            .addTransition( "ClearChat", { from: "Default", to: "Default" } )
            .addTransition( "ResetChannel", { from: "Default", to: "Default" } )
            .addTransition( "ClaimChannel", { from: "Default", to: "Default" } )
            .addTransition( "TransferOwner", { from: "Default", to: "Default" } )
            .addTransition( "OpenTemplates", { from: "Default", to: "Default" } )
            // Handler bindings (combines element-to-transition binding with handler)
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelRenameButton",
                "OpenRename",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    await uiService
                        .get( "VertixBot/UI-V3/DynamicChannelRenameAdapter" )
                        ?.showModal( "VertixBot/UI-V3/DynamicChannelRenameModal", interaction );
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelLimitMetaButton",
                "OpenLimit",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    await uiService
                        .get( "VertixBot/UI-V3/DynamicChannelLimitAdapter" )
                        ?.showModal( "VertixBot/UI-V3/DynamicChannelLimitModal", interaction );
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton",
                "OpenPermissions",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelPermissionsAdapter" );
                    if ( adapter ) {
                        await adapter.ephemeral( interaction );
                    }
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelPrivacyButton",
                "OpenPrivacy",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelPrivacyAdapter" );
                    if ( adapter ) {
                        await adapter.ephemeral( interaction );
                    }
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelRegionButton",
                "OpenRegion",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelRegionAdapter" );
                    if ( adapter ) {
                        await adapter.ephemeral( interaction );
                    }
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton",
                "OpenPrimaryMessageEdit",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    await uiService.get( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter" )?.runInitial( interaction );
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelClearChatButton",
                "ClearChat",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    await uiService.get( "VertixBot/UI-V3/DynamicChannelClearChatAdapter" )?.runInitial( interaction );
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelResetChannelButton",
                "ResetChannel",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    await uiService.get( "VertixBot/UI-V3/DynamicChannelResetChannelAdapter" )?.runInitial( interaction );
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelClaimChannelButton",
                "ClaimChannel",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    const messages = uiService.get( "VertixBot/UI-V3/ClaimStartAdapter" )?.getStartedMessages( interaction.channel! ),
                        message = Object.values( messages || {} )[ 0 ];

                    if ( !message ) {
                        return logger.error(
                            "onClaimButtonClicked",
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
                        "onClaimButtonClicked",
                        `Guild id: ${ interaction.guildId }, Channel id: ${ interaction.channelId } - Invalid state: ${ DynamicChannelVoteManager.$.getState( interaction.channelId ) }`
                    );
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
                "TransferOwner",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    await uiService.get( "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter" )?.runInitial( interaction );
                }
            )
            .bindButton(
                "VertixBot/UI-V3/DynamicChannelTemplatesButton",
                "OpenTemplates",
                async( _context, interaction ) => {
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
            );
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
