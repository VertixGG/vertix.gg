import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { Loader2 } from "lucide-react";

import { ChannelRadioList, ToggleSwitch } from "@vertix.gg/dashboard/src/features/generators/components/settings-list";
import { BrandingNoticeLine } from "@vertix.gg/dashboard/src/features/branding/components/branding-notice-line";

import { EVENTS_ERROR_MESSAGES } from "@vertix.gg/dashboard/src/features/events/lib/constants";

import type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands";
import type { GuildDiscordChannel, GuildEventsSettings, TEventsSetting } from "@vertix.gg/dashboard/src/features/events/types";

interface EventsSettingsSelectedState {
    settings: GuildEventsSettings | null;
    channels: GuildDiscordChannel[] | null;
    pendingSetting: TEventsSetting | null;
}

function selectSettings( state: EventsState ): EventsSettingsSelectedState {
    return {
        settings: state.settings,
        channels: state.channels,
        pendingSetting: state.pendingSetting
    };
}

/**
 * The same three settings as `/setup` -> Events in discord, saved as each one changes.
 */
export function EventsSettings() {
    const [ state ] = useCommandState<EventsState, EventsSettingsSelectedState>( "Dashboard/Events", selectSettings );

    const save = useCommand( "Dashboard/Events/Save" );

    if ( ! state.settings ) {
        return null;
    }

    const { enabled, channelId, subPostsEnabled, lastError } = state.settings,
        isSaving = null !== state.pendingSetting,
        lastErrorMessage = lastError ? EVENTS_ERROR_MESSAGES[ lastError ] : undefined;

    return (
        <section className="bg-surface border border-border rounded-lg p-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-text-primary mb-0">Settings</h2>
                { isSaving && <Loader2 className="w-4 h-4 text-text-muted animate-spin" /> }
            </div>

            { lastErrorMessage && (
                <BrandingNoticeLine tone="warning">{ lastErrorMessage }</BrandingNoticeLine>
            ) }

            <ToggleSwitch
                checked={ enabled }
                disabled={ isSaving || ! channelId }
                title="Events"
                body={ channelId
                    ? "A check-in board before every scheduled event held in a voice or stage channel."
                    : "Pick the channel Events posts in first." }
                onChange={ ( value ) => save.run( { enabled: value } ) }
            />

            <ChannelRadioList
                label="Posts in"
                hint="Where the check-in boards, the need-a-sub posts and the attendance go. The bot needs View Channel, Send Messages and Embed Links there."
                channels={ state.channels ?? [] }
                selected={ channelId }
                disabled={ isSaving }
                emptyLabel={ null === state.channels ? "Channels could not be loaded from Discord" : "This server has no text channels" }
                noneLabel="None - Events stays off"
                onChange={ ( value ) => save.run( { channelId: value } ) }
            />

            <ToggleSwitch
                checked={ subPostsEnabled }
                disabled={ isSaving }
                title={ "\"Need a sub\" posts" }
                body="Ten minutes after the start, ask for as many people as are missing."
                onChange={ ( value ) => save.run( { subPostsEnabled: value } ) }
            />
        </section>
    );
}

export default EventsSettings;
