import { ChannelType } from "discord.js";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { AIGuildDataManager } from "@vertix.gg/ai/src/managers/ai-guild-data-manager";

import {
    isTriggerEvent,
    TRIGGER_EVENT_DEFINITIONS
} from "@vertix.gg/ai/src/definitions/trigger-event-definitions";

import { TriggerComponent } from "@vertix.gg/ai/src/ui/trigger/trigger-component";

import { canManageAISettings, MANAGE_AI_SETTINGS_DENIED_MESSAGE } from "@vertix.gg/ai/src/utils/permission-utils";

import type { BaseGuildTextChannel } from "discord.js";
import type { UIDefaultStringSelectMenuChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { E_AI_TRIGGER_EVENT } from "@vertix.gg/prisma/._ai-client-internal";

type TriggerArgs = {
    enabledEvents: E_AI_TRIGGER_EVENT[];
    eventsLabel: string;
    channelsLabel: string;
    warning: string;
};

// `bindSelectMenu` is generic-bounded to StringSelectMenuInteraction, so both
// menus bind through that type - same as the bot's AIAgentChannelSelectMenu.
type TriggerInteractions = UIDefaultStringSelectMenuChannelTextInteraction;

type TriggerContext = IAdapterContext<TriggerInteractions, TriggerArgs>;

const TriggerAdapter = new AdapterBuilderBase<
    BaseGuildTextChannel,
    TriggerInteractions,
    typeof UIAdapterBase<BaseGuildTextChannel, TriggerInteractions>,
    TriggerArgs,
    TriggerContext
>( "VertixAI/UI/TriggerAdapter", UIAdapterBase )
    .setComponent( TriggerComponent )
    .setChannelTypes( [ ChannelType.GuildText ] )
    .getStartArgs( async( _context, channel ) => await buildArgs( channel.guildId ) )
    .getEditMessageArgs( async( _context, message ) => await buildArgs( message?.guildId ?? "" ) )
    .getReplyArgs( async( _context, interaction ) => await buildArgs( interaction.guildId ?? "" ) )
    .onEntityMap( async( { bindSelectMenu } ) => {
        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixAI/UI/TriggerEventsMenu",
            async( context, interaction ) => {
                await onEventsSelected( context, interaction );
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixAI/UI/TriggerChannelsMenu",
            async( context, interaction ) => {
                await onChannelsSelected( context, interaction );
            }
        );
    } )
    .build();

async function buildArgs( guildId: string ): Promise<TriggerArgs> {
    if ( !guildId.length ) {
        return {
            enabledEvents: [],
            eventsLabel: "—",
            channelsLabel: "—",
            warning: "This panel only works inside a server."
        };
    }

    const settings = await AIGuildDataManager.$.getTriggerSettings( guildId );

    const eventsLabel = settings.events.length
        ? settings.events
            .map( ( event ) => {
                const definition = TRIGGER_EVENT_DEFINITIONS[ event ];

                return `${ definition.emoji } ${ definition.label }`;
            } )
            .join( "\n" )
        : "None - the AI never acts on its own.";

    const channelsLabel = settings.channelIds.length
        ? settings.channelIds.map( ( channelId ) => `<#${ channelId }>` ).join( ", " )
        : "—";

    return {
        enabledEvents: settings.events,
        eventsLabel,
        channelsLabel,
        warning: buildWarning( settings.events )
    };
}

/**
 * Surfaces intent requirements in the panel, because an event whose intent is
 * missing never fires and never errors - it just silently does nothing.
 */
function buildWarning( events: E_AI_TRIGGER_EVENT[] ): string {
    const privileged = events.filter( ( event ) => TRIGGER_EVENT_DEFINITIONS[ event ].privileged );

    if ( !privileged.length ) {
        return "";
    }

    const labels = privileged.map( ( event ) => TRIGGER_EVENT_DEFINITIONS[ event ].label ).join( ", " );

    return `\n⚠️  **${ labels }** need privileged gateway intents enabled on the bot's application, or they will never fire.`;
}

async function onEventsSelected(
    context: TriggerContext,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    if ( !canManageAISettings( interaction ) ) {
        await interaction.reply( { content: MANAGE_AI_SETTINGS_DENIED_MESSAGE, ephemeral: true } );

        return;
    }

    const events = interaction.values.filter( isTriggerEvent );

    await AIGuildDataManager.$.setTriggerEvents( interaction.guildId, events );

    await context.editReply( interaction, await buildArgs( interaction.guildId ) );
}

async function onChannelsSelected(
    context: TriggerContext,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    if ( !canManageAISettings( interaction ) ) {
        await interaction.reply( { content: MANAGE_AI_SETTINGS_DENIED_MESSAGE, ephemeral: true } );

        return;
    }

    await AIGuildDataManager.$.setTriggerChannels( interaction.guildId, [ ...interaction.values ] );

    await context.editReply( interaction, await buildArgs( interaction.guildId ) );
}

export { TriggerAdapter };
