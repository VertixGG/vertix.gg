import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";
import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/dynamic-channel-component";
import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";
import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";
import { DynamicChannelUiData } from "@vertix.gg/bot/src/data/dynamic-channel/dynamic-channel-ui-data";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { BaseMessageOptions, Message, VoiceChannel } from "discord.js";
import type UIService from "@vertix.gg/gui/src/ui-service";

const DYNAMIC_CHANNEL_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelPrimaryMessageElementsGroup",
        embedsGroup: "VertixBot/UI-V3/DynamicChannel/EmbedsGroup"
    }
} as const;

const logger = new Logger( "VertixBot/UI-V3/DynamicChannelAdapter" );

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelFlow";
const FLOW_STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;

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

const DynamicChannelAdapterBase = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelAdapter"
)
    .setComponent( DynamicChannelComponent )
    .setExecutionSteps( DYNAMIC_CHANNEL_STEPS )
    .setArgsDataSource( [ "all" ], DynamicChannelUiData.getName() )
    .onEntityMap( async( { bindButton } ) => {
        bindButton(
            "VertixBot/UI-V3/DynamicChannelRenameButton",
            onRenameButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/OpenRename`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelLimitMetaButton",
            onLimitButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/OpenLimit`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton",
            onAccessButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/OpenPermissions`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelPrivacyButton",
            onPrivacyButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/OpenPrivacy`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelRegionButton",
            onRegionButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/OpenRegion`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton",
            onPrimaryMessageEditButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/OpenPrimaryMessageEdit`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelClearChatButton",
            onClearChatButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/ClearChat`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelResetChannelButton",
            onResetChannelButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/ResetChannel`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelClaimChannelButton",
            onClaimButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/ClaimChannel`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
        bindButton(
            "VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
            onTransferOwnerButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/TransferOwner`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
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
