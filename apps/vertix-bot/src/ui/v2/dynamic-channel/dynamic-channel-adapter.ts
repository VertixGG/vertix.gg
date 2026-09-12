import { VoiceChannel } from "discord.js";

import { splitTemplate } from "@vertix.gg/utils/src/button-rows";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/dynamic-channel-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { BaseMessageOptions, Message } from "discord.js";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ChannelExtended } from "@vertix.gg/data/src/models/channel/channel-client-extend";

import type {
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type UIService from "@vertix.gg/gui/src/ui-service";

const logger = new Logger( "VertixBot/UI-V2/DynamicChannelAdapter" );

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

/**
 * Function resolveButtonsTemplate() :: The button set a channel's panel should carry.
 *
 * The owner's roles arrive highest first and the first one carrying a set wins, so a role set
 * replaces the default rather than adding to it. An empty entry is a removed set, not a set of no
 * buttons, so it falls through, and the guild id is skipped because discord seeds every member's
 * roles with @everyone under it - a set stored there would match every owner alive.
 */
/**
 * Function readOwnerRoleIds() :: The owner's roles, as the service resolved them.
 *
 * Never the roles of whoever triggered the render - the panel is one message the whole channel
 * reads, so the set it carries belongs to its owner.
 */
function readOwnerRoleIds( args?: UIArgs ): string[] {
    const ownerRoleIds = args?.ownerRoleIds;

    return Array.isArray( ownerRoleIds ) ? ownerRoleIds as string[] : [];
}

async function resolveButtonsTemplate(
    masterChannelDB: ChannelExtended,
    guildId: string,
    ownerRoleIds: string[]
): Promise<string[]> {
    const byRole = await MasterChannelDataManager.$.getChannelButtonsTemplateOverrides( masterChannelDB );

    for ( const roleId of ownerRoleIds ) {
        if ( roleId === guildId ) {
            continue;
        }

        const override = byRole[ roleId ];

        if ( Array.isArray( override ) && override.length ) {
            return override;
        }
    }

    return ( await MasterChannelDataManager.$.getChannelButtonsTemplate( masterChannelDB, true ) ) ?? [];
}

async function getAllArgs( channel: VoiceChannel, ownerRoleIds: string[] = [] ) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const args: UIArgs = {
            channelName: channel.name,
            userLimit: ( channel as VoiceChannel ).userLimit,

            isPrivate: ( await dynamicChannelService.getChannelState( channel ) ) === "private",
            isHidden: ( await dynamicChannelService.getChannelVisibilityState( channel ) ) === "hidden",

            channelId: channel.id,

            region: channel.rtcRegion
        },
        masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

    if ( masterChannelDB ) {
        // The stored list carries its row divisions inline, so they come out before it is handed
        // on - a separator is not a button, and the component needs the two apart to draw the
        // arrangement at all. Left joined, the set arrived without an arrangement and every panel
        // printed in plain rows whatever the editor had been asked for.
        const stored = splitTemplate(
            await resolveButtonsTemplate( masterChannelDB, channel.guild.id, ownerRoleIds )
        );

        args.dynamicChannelButtonsTemplate = stored.ids;
        args.dynamicChannelButtonsRowBreaks = stored.rowBreaks;
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

async function onStatusButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    await uiService
        .get( "VertixBot/UI-V2/DynamicChannelMetaStatusAdapter" )
        ?.showModal( "VertixBot/UI-V2/DynamicChannelMetaStatusModal", interaction );
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

const DynamicChannelAdapterBase = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V2/DynamicChannelAdapter"
)
    .setComponent( DynamicChannelComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelElementsGroup",
                previewDefaultVars: { channelName: "My Channel", ownerId: "123456789" }
            } )
            .addTransition( "OpenRename", { from: "Default", to: "Default" } )
            .addTransition( "OpenStatus", { from: "Default", to: "Default" } )
            .addTransition( "OpenLimit", { from: "Default", to: "Default" } )
            .addTransition( "OpenPermissions", { from: "Default", to: "Default" } )
            .addTransition( "ToggleState", { from: "Default", to: "Default" } )
            .addTransition( "ToggleVisibility", { from: "Default", to: "Default" } )
            .addTransition( "ClearChat", { from: "Default", to: "Default" } )
            .addTransition( "ResetChannel", { from: "Default", to: "Default" } )
            .addTransition( "ClaimChannel", { from: "Default", to: "Default" } )
            .addTransition( "TransferOwner", { from: "Default", to: "Default" } )
            .bindButton( "VertixBot/UI-V2/DynamicChannelMetaRenameButton", "OpenRename", onRenameButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelMetaStatusButton", "OpenStatus", onStatusButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelMetaLimitButton", "OpenLimit", onLimitButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton", "OpenPermissions", onAccessButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsStateButton", "ToggleState", onToggleStateButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton", "ToggleVisibility", onToggleVisibilityStateButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelMetaClearChatButton", "ClearChat", onClearChatButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton", "ResetChannel", onResetChannelButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton", "ClaimChannel", onClaimButtonClicked )
            .bindButton( "VertixBot/UI-V2/DynamicChannelTransferOwnerButton", "TransferOwner", onTransferOwnerButtonClicked );
    } )
    .getStartArgs( async( context, channel, argsFromManager ) => {
        const resolvedChannel = await resolveChannelFromContext( channel, argsFromManager );

        if ( !resolvedChannel ) {
            return {};
        }

        return getAllArgs( resolvedChannel, readOwnerRoleIds( argsFromManager ) );
    } )
    .getReplyArgs( async( context, interaction ) => {
        const resolvedChannel = await resolveChannelFromContext(
            interaction.channel,
            context.getArgs( interaction )
        );

        if ( !resolvedChannel ) {
            return {};
        }

        return getAllArgs( resolvedChannel, readOwnerRoleIds( context.getArgs( interaction ) ) );
    } )
    .getEditMessageArgs( async( context, message, argsFromManager ) => {
        if ( !message ) {
            return {};
        }

        const resolvedChannel = await resolveChannelFromContext(
            message.channel as UIAdapterStartContext,
            argsFromManager || context.getArgs( message )
        );

        if ( !resolvedChannel ) {
            return {};
        }

        return getAllArgs( resolvedChannel, readOwnerRoleIds( argsFromManager || context.getArgs( message ) ) );
    } )
    .build();

class DynamicChannelAdapter extends DynamicChannelAdapterBase {
    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        if ( !this.getArgsManager().getArgsById( this, message.id ) ) {
            await this.awakeInternal( message, {} );
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
