import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { resolveGuildEventsSettings } from "@vertix.gg/definitions/src/guild-events-definitions";

import { EventsQuery } from "@vertix.gg/dashboard/src/features/events/query/events-query";

import { QueryRequestError } from "@vertix.gg/dashboard/src/lib/query-request-error";

import type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands/base";
import type {
    GuildEventsSettings,
    GuildEventsSettingsPatch,
    TEventsSetting
} from "@vertix.gg/dashboard/src/features/events/types";

/** Every setting a save can carry, in the order a patch is looked through for the one it changes. */
const EVENTS_SETTINGS: readonly TEventsSetting[] = [
    "enabled",
    "channelId",
    "subPostsEnabled",
    "checkInLeadMinutes",
    "lateAfterMinutes",
    "endAfterEmptyMinutes",
    "maxDurationHours",
    "eventChannelIds",
    "checkInRoleId",
    "checkInPingInterested",
    "subRoleId",
    "subMinMissing",
    "minVoiceMinutes",
    "logChannelId"
];

/**
 * Command `Dashboard/Events/Save` :: Changes one setting, as soon as it is changed.
 *
 * There is no save button, the same as the screen in discord: each switch and pick is saved on its
 * own. The api asks the bot before accepting a channel, so a refusal comes back naming what the
 * bot lacks there, and the screen keeps showing what is actually saved.
 */
export class SaveEventsSettingsCommand extends CommandBase<EventsState, GuildEventsSettingsPatch> {
    public static getName(): string {
        return "Dashboard/Events/Save";
    }

    public async apply( patch: GuildEventsSettingsPatch ) {
        const { guildId, pendingSetting } = this.state,
            setting = EVENTS_SETTINGS.find( ( key ) => undefined !== patch[ key ] );

        if ( ! guildId || null !== pendingSetting || ! setting ) {
            return;
        }

        this.setState( { pendingSetting: setting, error: null, reasons: [] } );

        try {
            const settings = await getQueryModule( EventsQuery ).request<GuildEventsSettings>( "Dashboard/Events/SaveSettings", {
                guildId,
                ... patch
            } );

            return this.setState( { settings: resolveGuildEventsSettings( settings ), pendingSetting: null } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to save the Events settings",
                reasons: error instanceof QueryRequestError ? error.reasons : [],
                pendingSetting: null
            } );
        }
    }
}
