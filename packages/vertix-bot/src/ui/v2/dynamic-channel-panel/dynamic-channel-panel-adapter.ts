import { VoiceChannel } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelPanelComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel-panel/dynamic-channel-panel-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { Message } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type UIService from "@vertix.gg/gui/src/ui-service";

const logger = new Logger( "VertixBot/UI-V2/DynamicChannelPanelAdapter" );

const DYNAMIC_CHANNEL_PANEL_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelElementsGroup"
    }
} as const;

async function resolveChannelFromContext(
    context: UIAdapterStartContext,
    argsFromManager?: UIArgs
): Promise<VoiceChannel | null> {
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

async function getAllArgs( channel: VoiceChannel ) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const args: UIArgs = {
            channelName: channel.name,
            userLimit: channel.userLimit,

            isPrivate: ( await dynamicChannelService.getChannelState( channel ) ) === "private",
            isHidden: ( await dynamicChannelService.getChannelVisibilityState( channel ) ) === "hidden",

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

async function onRenameButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService
        .get( "VertixBot/UI-V2/DynamicChannelMetaRenameAdapter" )
        ?.showModal( "VertixBot/UI-V2/DynamicChannelMetaRenameModal", interaction );
}

async function onClearChatButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V2/DynamicChannelMetaClearChatAdapter" )?.runInitial( interaction );
}

async function onLimitButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService
        .get( "VertixBot/UI-V2/DynamicChannelMetaLimitAdapter" )
        ?.showModal( "VertixBot/UI-V2/DynamicChannelMetaLimitModal", interaction );
}

async function onToggleStateButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
}

async function onToggleVisibilityStateButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
}

async function onAccessButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V2/DynamicChannelPermissionsAdapter" )?.runInitial( interaction );
}

async function onResetChannelButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService.get( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelAdapter" )?.runInitial( interaction );
}

async function onClaimButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    const messages = uiService.get( "VertixBot/UI-V2/ClaimStartAdapter" )?.getStartedMessages( interaction.channel ),
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
            await DynamicChannelClaimManager.get( "VertixBot/UI-V2/DynamicChannelClaimManager" ).handleVoteRequest(
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
    await uiService.get( "VertixBot/UI-V2/DynamicChannelTransferOwnerAdapter" )?.runInitial( interaction );
}

const DynamicChannelPanelAdapterBase = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V2/DynamicChannelPanelAdapter"
)
    .setComponent( DynamicChannelPanelComponent )
    .setExecutionSteps( DYNAMIC_CHANNEL_PANEL_STEPS )
    .getStartArgs( async( context, channel, argsFromManager ) => {
        const resolvedChannel = await resolveChannelFromContext( channel, argsFromManager );

        if ( !resolvedChannel ) {
            return {
                dynamicChannelButtonsTemplate: argsFromManager?.dynamicChannelButtonsTemplate
            };
        }

        return getAllArgs( resolvedChannel );
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args = argsFromManager || {};

        const resolvedChannel = await resolveChannelFromContext(
            interaction.channel,
            args
        );

        if ( !resolvedChannel ) {
            return {
                dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
            };
        }

        return getAllArgs( resolvedChannel );
    } )
    .getEditMessageArgs( async( context, message, argsFromManager ) => {
        if ( !message ) {
            return {};
        }

        const args = argsFromManager || {};

        const resolvedChannel = await resolveChannelFromContext(
            message.channel as UIAdapterStartContext,
            args
        );

        if ( !resolvedChannel ) {
            return {
                dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
            };
        }

        return getAllArgs( resolvedChannel );
    } )
    .onEntityMap( async( { bindButton } ) => {
        bindButton( "VertixBot/UI-V2/DynamicChannelMetaRenameButton", onRenameButtonClicked );
        bindButton( "VertixBot/UI-V2/DynamicChannelMetaClearChatButton", onClearChatButtonClicked );
        bindButton( "VertixBot/UI-V2/DynamicChannelMetaLimitButton", onLimitButtonClicked );

        bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsStateButton", onToggleStateButtonClicked );
        bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton", onToggleVisibilityStateButtonClicked );
        bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton", onAccessButtonClicked );

        bindButton( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton", onResetChannelButtonClicked );
        bindButton( "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton", onClaimButtonClicked );
        bindButton( "VertixBot/UI-V2/DynamicChannelTransferOwnerButton", onTransferOwnerButtonClicked );
    } )
    .build();

class DynamicChannelPanelAdapter extends DynamicChannelPanelAdapterBase {
    protected static override getExecutionSteps() {
        return DYNAMIC_CHANNEL_PANEL_STEPS;
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        if ( !this.getArgsManager().getArgsById( this, message.id ) ) {
            await this.awakeInternal( message, newArgs || {} );
        }

        return super.editMessage( message, newArgs );
    }
}

export { DynamicChannelPanelAdapter };
