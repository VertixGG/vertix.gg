import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { GuildEventSettingsModel } from "@vertix.gg/data/src/models/guild-event-settings-model";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";

import { EventsComponent } from "@vertix.gg/bot/src/ui/general/events/events-component";
import { refuseUnwritableEventsChannel } from "@vertix.gg/bot/src/ui/general/events/events-channel-utils";

import type { BaseGuildTextChannel, Guild } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type UIService from "@vertix.gg/gui/src/ui-service";
import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type EventsInteractions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

/**
 * Function readEventsArgs() :: How Events is set in a server, as the screen draws it.
 *
 * A channel that no longer exists is shown as not picked - it is what the admin has to fix, and
 * the menu cannot preselect a channel discord no longer has.
 */
async function readEventsArgs( guild: Guild ): Promise<UIArgs> {
    const settings = await GuildEventSettingsModel.$.get( guild.id ),
        channelId = settings?.channelId && guild.channels.cache.has( settings.channelId ) ? settings.channelId : null;

    return {
        eventsEnabled: !! settings?.enabled,
        eventsChannelId: channelId,
        eventsSubPostsEnabled: settings?.subPostsEnabled ?? true,
        eventsLastError: settings?.lastError ?? null
    };
}

const EventsAdapter = new AdminExecutionAdapterBuilder<BaseGuildTextChannel, EventsInteractions, UIArgs>(
    "VertixBot/UI-General/EventsAdapter"
)
    .setComponent( EventsComponent )
    .getReplyArgs( async( _context, interaction ) => readEventsArgs( interaction.guild ) )
    .defineTransactions( tx => {
        tx.setInitialState( "Initial" )
            .addState( "Initial", { executionStep: "default" } )
            .addState( "Completed", { executionStep: "default" } )
            .addTransition( "SelectChannel", { from: "Initial", to: "Initial" } )
            .addTransition( "ToggleEnabled", { from: "Initial", to: "Initial" } )
            .addTransition( "ToggleSubPosts", { from: "Initial", to: "Initial" } )
            .addTransition( "Done", { from: "Initial", to: "Completed" } )
            .addEntryPoint( {
                flowName: "VertixBot/UI-General/SetupFlow",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/ChooseEvents",
                targetState: "VertixBot/UI-General/EventsFlow/States/Initial",
                description: "Entry point triggered by SetupFlow via the Events button"
            } )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/EventsChannelSelectMenu",
                "SelectChannel",
                async( context, interaction ) => {
                    const channelId = interaction.values.at( 0 ) || null;

                    if ( channelId && await refuseUnwritableEventsChannel( interaction, channelId ) ) {
                        return;
                    }

                    const current = await GuildEventSettingsModel.$.get( interaction.guildId );

                    // Clearing the channel turns Events off: there would be nowhere for a board to go.
                    await GuildEventSettingsModel.$.save( interaction.guildId, interaction.client.user.id, {
                        channelId,
                        enabled: channelId ? !! current?.enabled : false
                    }, interaction.user.id );

                    await context.triggerTransition( "SelectChannel", interaction, {} );
                }
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/EventsEnableButton",
                "ToggleEnabled",
                async( context, interaction ) => {
                    const current = await GuildEventSettingsModel.$.get( interaction.guildId ),
                        enabled = ! current?.enabled;

                    // Checked again on the way on: the channel may have changed since it was picked.
                    if ( enabled && current?.channelId && await refuseUnwritableEventsChannel( interaction, current.channelId ) ) {
                        return;
                    }

                    await GuildEventSettingsModel.$.save( interaction.guildId, interaction.client.user.id, {
                        enabled: enabled && !! current?.channelId
                    }, interaction.user.id );

                    await context.triggerTransition( "ToggleEnabled", interaction, {} );
                }
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/EventsSubPostsButton",
                "ToggleSubPosts",
                async( context, interaction ) => {
                    const current = await GuildEventSettingsModel.$.get( interaction.guildId );

                    await GuildEventSettingsModel.$.save( interaction.guildId, interaction.client.user.id, {
                        subPostsEnabled: ! ( current?.subPostsEnabled ?? true )
                    }, interaction.user.id );

                    await context.triggerTransition( "ToggleSubPosts", interaction, {} );
                }
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DoneButton",
                "Done",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

                    await uiService.get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
                }
            );
    } )
    .build();

export { EventsAdapter };
