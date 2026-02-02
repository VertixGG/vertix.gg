import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";
import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/dynamic-channel-component";
import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";
import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";
import { DynamicChannelUIData } from "@vertix.gg/bot/src/data/dynamic-channel/dynamic-channel-ui-data";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { BaseMessageOptions, Message } from "discord.js";
import type UIService from "@vertix.gg/gui/src/ui-service";

const DYNAMIC_CHANNEL_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPrimaryMessageElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannel/EmbedsGroup"
    }
} as const;

const logger = new Logger( "VertixBot/UI-V3/DynamicChannelAdapter" );

const DynamicChannelAdapterBase = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelAdapter"
)
    .setComponent( DynamicChannelComponent )
    .setExecutionSteps( DYNAMIC_CHANNEL_STEPS )
    .setArgsDataSource( [ "all" ], DynamicChannelUIData.getName() )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { channelName: "My Channel", ownerId: "123456789" }
            } )
            // All button clicks stay in Default state but open other adapters
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
            // Element bindings
            .bindElement( "VertixBot/UI-V3/DynamicChannelRenameButton", "OpenRename" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelLimitMetaButton", "OpenLimit" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton", "OpenPermissions" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelPrivacyButton", "OpenPrivacy" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelRegionButton", "OpenRegion" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton", "OpenPrimaryMessageEdit" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelClearChatButton", "ClearChat" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelResetChannelButton", "ResetChannel" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelClaimChannelButton", "ClaimChannel" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelTransferOwnerButton", "TransferOwner" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelTemplatesButton", "OpenTemplates" );
    } )
    .onEntityMap( async( { bindButton } ) => {
        bindButton(
            "VertixBot/UI-V3/DynamicChannelRenameButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                await uiService
                    .get( "VertixBot/UI-V3/DynamicChannelRenameAdapter" )
                    ?.showModal( "VertixBot/UI-V3/DynamicChannelRenameModal", interaction );
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelLimitMetaButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                await uiService
                    .get( "VertixBot/UI-V3/DynamicChannelLimitAdapter" )
                    ?.showModal( "VertixBot/UI-V3/DynamicChannelLimitModal", interaction );
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelPermissionsAdapter" );
                if ( adapter ) {
                    await adapter.ephemeral( interaction );
                }
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelPrivacyButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelPrivacyAdapter" );
                if ( adapter ) {
                    await adapter.ephemeral( interaction );
                }
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelRegionButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                const adapter = uiService.get( "VertixBot/UI-V3/DynamicChannelRegionAdapter" );
                if ( adapter ) {
                    await adapter.ephemeral( interaction );
                }
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                await uiService.get( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter" )?.runInitial( interaction );
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelClearChatButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                await uiService.get( "VertixBot/UI-V3/DynamicChannelClearChatAdapter" )?.runInitial( interaction );
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelResetChannelButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                await uiService.get( "VertixBot/UI-V3/DynamicChannelResetChannelAdapter" )?.runInitial( interaction );
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelClaimChannelButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                const messages = uiService.get( "VertixBot/UI-V3/ClaimStartAdapter" )?.getStartedMessages( interaction.channel ),
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
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
            async( _context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                await uiService.get( "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter" )?.runInitial( interaction );
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelTemplatesButton",
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

class DynamicChannelAdapter extends DynamicChannelAdapterBase {
    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        if ( !this.getArgsManager().getArgsById( this, message.id ) ) {
            await this.awakeInternal( message, newArgs );
        }

        return super.editMessage( message, newArgs );
    }

    protected getMessage(
        from: UIAdapterBuildSource,
        context: UIAdapterStartContext | UIDefaultButtonChannelVoiceInteraction,
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
