import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands";
import type {
    GuildDiscordChannel,
    GuildDiscordRole,
    GuildDiscordVoiceChannel,
    GuildEventsSettings,
    GuildEventsSettingsPatch,
    TEventsSetting
} from "@vertix.gg/dashboard/src/features/events/types";

interface EventsSettingsSelectedState {
    settings: GuildEventsSettings | null;
    channels: GuildDiscordChannel[] | null;
    voiceChannels: GuildDiscordVoiceChannel[] | null;
    roles: GuildDiscordRole[] | null;
    pendingSetting: TEventsSetting | null;
}

function selectSettings( state: EventsState ): EventsSettingsSelectedState {
    return {
        settings: state.settings,
        channels: state.channels,
        voiceChannels: state.voiceChannels,
        roles: state.roles,
        pendingSetting: state.pendingSetting
    };
}

/**
 * Function useEventsSettings() :: The settings as saved, what Discord offers to point them at, and
 * the way to change one.
 *
 * Every section of the settings reads through this, so each draws what is actually saved and waits
 * while any one save is in flight - two saves at once would each answer with a row the other had
 * not seen.
 */
export function useEventsSettings() {
    const [ state ] = useCommandState<EventsState, EventsSettingsSelectedState>( "Dashboard/Events", selectSettings );

    const save = useCommand( "Dashboard/Events/Save" );

    return {
        ... state,
        isSaving: null !== state.pendingSetting,
        save: ( patch: GuildEventsSettingsPatch ) => save.run( patch )
    };
}

/**
 * Function findName() :: The name of the channel or role an id points at, or null when the server
 * no longer has it.
 */
export function findName( items: { id: string; name: string }[] | null, id: string | null ) {
    return ( id && items?.find( ( item ) => item.id === id )?.name ) || null;
}
