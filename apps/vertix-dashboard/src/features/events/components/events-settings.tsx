import { useState } from "react";

import { Mic, Volume2 } from "lucide-react";

import {
    GUILD_EVENTS_LIMITS,
    GUILD_EVENTS_SETTINGS_CHOICES
} from "@vertix.gg/definitions/src/guild-events-definitions";

import {
    ChannelCheckList,
    ChannelRadioList,
    RoleRadioList,
    ToggleSwitch
} from "@vertix.gg/dashboard/src/features/generators/components/settings-list";
import { BrandingNoticeLine } from "@vertix.gg/dashboard/src/features/branding/components/branding-notice-line";

import { ChoiceChips } from "@vertix.gg/dashboard/src/features/events/components/choice-chips";
import { EventsSettingsCard } from "@vertix.gg/dashboard/src/features/events/components/events-settings-card";
import { useEventsSettings } from "@vertix.gg/dashboard/src/features/events/components/use-events-settings";

import { EVENTS_ERROR_MESSAGES } from "@vertix.gg/dashboard/src/features/events/lib/constants";
import { formatEventsMinutes } from "@vertix.gg/dashboard/src/features/events/lib/format-events-time";

/** Said wherever a role picker is, since a ping only notifies if the role may be mentioned. */
const PING_ROLE_HINT = "A role nobody may @mention is only pinged if the bot has Mention @everyone, @here and All Roles.";

function formatAfterStart( minutes: number ) {
    return minutes ? formatEventsMinutes( minutes ) : "At the start";
}

/**
 * Whether Events runs here, and where it posts - the same two things as `/setup` -> Events.
 */
function EventsBasicsSettings() {
    const { settings, channels, pendingSetting, isSaving, save } = useEventsSettings();

    if ( ! settings ) {
        return null;
    }

    const lastErrorMessage = settings.lastError ? EVENTS_ERROR_MESSAGES[ settings.lastError ] : undefined;

    return (
        <EventsSettingsCard
            title="Events"
            description="Whether the bot runs check-ins in this server, and where it posts. The same as /setup → Events in Discord."
            settings={ [ "enabled", "channelId" ] }
            pendingSetting={ pendingSetting }
        >
            { lastErrorMessage && (
                <BrandingNoticeLine tone="warning">{ lastErrorMessage }</BrandingNoticeLine>
            ) }

            <ToggleSwitch
                checked={ settings.enabled }
                disabled={ isSaving || ! settings.channelId }
                title="Events"
                body={ settings.channelId
                    ? "A check-in board before every scheduled event held in a voice or stage channel."
                    : "Pick the channel Events posts in first." }
                onChange={ ( value ) => save( { enabled: value } ) }
            />

            <ChannelRadioList
                label="Posts in"
                hint="Where the check-in boards and the need-a-sub posts go. The bot needs View Channel, Send Messages and Embed Links there."
                channels={ channels ?? [] }
                selected={ settings.channelId }
                disabled={ isSaving }
                emptyLabel={ null === channels ? "Channels could not be loaded from Discord" : "This server has no text channels" }
                noneLabel="None - Events stays off"
                onChange={ ( value ) => save( { channelId: value } ) }
            />
        </EventsSettingsCard>
    );
}

/**
 * When the board goes up, when check-in closes, and who is told it is open.
 */
function EventsCheckInSettings() {
    const { settings, roles, pendingSetting, isSaving, save } = useEventsSettings();

    if ( ! settings ) {
        return null;
    }

    return (
        <EventsSettingsCard
            title="Check-in"
            description="Members check in by joining the event's voice channel. These decide when that counts, and who is told."
            settings={ [ "checkInLeadMinutes", "lateAfterMinutes", "checkInRoleId", "checkInPingInterested" ] }
            pendingSetting={ pendingSetting }
        >
            <ChoiceChips
                label="The board goes up"
                hint="How long before the start the check-in board is posted. From then on, anybody joining the voice channel is checked in."
                choices={ GUILD_EVENTS_SETTINGS_CHOICES.checkInLeadMinutes }
                selected={ settings.checkInLeadMinutes }
                disabled={ isSaving }
                format={ formatEventsMinutes }
                onChange={ ( value ) => save( { checkInLeadMinutes: value } ) }
            />

            <ChoiceChips
                label="Check-in closes, after the start"
                hint={ "Until then an arrival counts as on time. Then the list locks: whoever has not come is marked " +
                    "Didn't come, anybody arriving later is Late, and the \"need a sub\" post goes up. The board tells " +
                    "members the time." }
                choices={ GUILD_EVENTS_SETTINGS_CHOICES.lateAfterMinutes }
                selected={ settings.lateAfterMinutes }
                disabled={ isSaving }
                format={ formatAfterStart }
                onChange={ ( value ) => save( { lateAfterMinutes: value } ) }
            />

            <RoleRadioList
                label="Ping a role when the board goes up"
                hint={ `So everyone who plays knows check-in is open. ${ PING_ROLE_HINT }` }
                roles={ roles ?? [] }
                selected={ settings.checkInRoleId }
                disabled={ isSaving }
                emptyLabel={ null === roles ? "Roles could not be loaded from Discord" : "This server has no roles" }
                noneLabel="Nobody"
                onChange={ ( value ) => save( { checkInRoleId: value } ) }
            />

            <ToggleSwitch
                checked={ settings.checkInPingInterested }
                disabled={ isSaving }
                title="Also ping who said they're coming"
                body={ "Mentions everyone on the event's Interested list who is not in voice yet, in the board's post - " +
                    `up to ${ GUILD_EVENTS_LIMITS.PING_MEMBERS_MAX } of them.` }
                onChange={ ( value ) => save( { checkInPingInterested: value } ) }
            />
        </EventsSettingsCard>
    );
}

/**
 * Which of the server's scheduled events get a board at all.
 *
 * Every voice and stage event unless the server names the channels whose events do. Picking "only
 * these" is kept on this screen until a channel is ticked - saving an empty list would mean every
 * event again, which is not what somebody who just asked for fewer meant.
 */
function EventsScopeSettings() {
    const { settings, voiceChannels, pendingSetting, isSaving, save } = useEventsSettings();

    const [ isLimited, setIsLimited ] = useState( () => !! settings?.eventChannelIds.length );

    if ( ! settings ) {
        return null;
    }

    const isStage = ( channelId: string ) => !! voiceChannels?.find( ( channel ) => channel.id === channelId )?.isStage,
        isLimitedNow = isLimited || settings.eventChannelIds.length > 0;

    const showEvery = () => {
        setIsLimited( false );

        if ( settings.eventChannelIds.length ) {
            save( { eventChannelIds: [] } );
        }
    };

    return (
        <EventsSettingsCard
            title="Which events"
            description="Events runs for scheduled events held in a voice or stage channel. Limit it when only some of them need a check-in."
            settings={ [ "eventChannelIds" ] }
            pendingSetting={ pendingSetting }
        >
            <div className="space-y-2">
                <label className={ `flex items-center gap-2 text-sm text-text-primary ${ isSaving ? "opacity-50" : "cursor-pointer" }` }>
                    <input type="radio" className="accent-accent" checked={ ! isLimitedNow } disabled={ isSaving } onChange={ showEvery } />
                    Every voice and stage event
                </label>

                <label className={ `flex items-center gap-2 text-sm text-text-primary ${ isSaving ? "opacity-50" : "cursor-pointer" }` }>
                    <input type="radio" className="accent-accent" checked={ isLimitedNow } disabled={ isSaving } onChange={ () => setIsLimited( true ) } />
                    Only events held in these channels
                </label>
            </div>

            { isLimitedNow && (
                <ChannelCheckList
                    label="Channels"
                    hint={ settings.eventChannelIds.length
                        ? "An event set somewhere else gets no board. One already under way when you change this runs to its end."
                        : "Tick at least one - until then every event still counts." }
                    channels={ voiceChannels ?? [] }
                    selected={ settings.eventChannelIds }
                    disabled={ isSaving }
                    emptyLabel={ null === voiceChannels ? "Channels could not be loaded from Discord" : "This server has no voice channels" }
                    renderMarker={ ( channel ) => isStage( channel.id )
                        ? <Mic className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        : <Volume2 className="w-3.5 h-3.5 text-text-muted shrink-0" /> }
                    onChange={ ( value ) => save( { eventChannelIds: value } ) }
                />
            ) }
        </EventsSettingsCard>
    );
}

/**
 * The post asking others to take the places of whoever did not come.
 */
function EventsSubsSettings() {
    const { settings, roles, pendingSetting, isSaving, save } = useEventsSettings();

    if ( ! settings ) {
        return null;
    }

    const isOff = ! settings.subPostsEnabled;

    return (
        <EventsSettingsCard
            title={ "\"Need a sub\" posts" }
            description="When check-in closes with people missing, a post asks others to take their places. It counts down as people arrive, and comes down when the event ends."
            settings={ [ "subPostsEnabled", "subMinMissing", "subRoleId" ] }
            pendingSetting={ pendingSetting }
        >
            <ToggleSwitch
                checked={ settings.subPostsEnabled }
                disabled={ isSaving }
                title="Post for subs"
                body="Asks for as many people as are missing - never more than a voice channel with a user limit has room for."
                onChange={ ( value ) => save( { subPostsEnabled: value } ) }
            />

            <ChoiceChips
                label="Only once at least this many are missing"
                hint="For an event that minds only a short team, not one absence."
                choices={ GUILD_EVENTS_SETTINGS_CHOICES.subMinMissing }
                selected={ settings.subMinMissing }
                disabled={ isSaving || isOff }
                format={ String }
                onChange={ ( value ) => save( { subMinMissing: value } ) }
            />

            <RoleRadioList
                label="Ping a role in the post"
                hint={ `The people who stand in - a subs or reserves role, say. ${ PING_ROLE_HINT }` }
                roles={ roles ?? [] }
                selected={ settings.subRoleId }
                disabled={ isSaving || isOff }
                emptyLabel={ null === roles ? "Roles could not be loaded from Discord" : "This server has no roles" }
                noneLabel="Nobody"
                onChange={ ( value ) => save( { subRoleId: value } ) }
            />
        </EventsSettingsCard>
    );
}

/**
 * When the attendance is taken, who counts as having come, and where a copy of it goes.
 */
function EventsAttendanceSettings() {
    const { settings, channels, pendingSetting, isSaving, save } = useEventsSettings();

    if ( ! settings ) {
        return null;
    }

    return (
        <EventsSettingsCard
            title="Attendance"
            description="When the event is over, the board becomes the attendance: who came, who was late, who didn't come and who walked in, with each member's time in voice."
            settings={ [ "endAfterEmptyMinutes", "maxDurationHours", "minVoiceMinutes", "logChannelId" ] }
            pendingSetting={ pendingSetting }
        >
            <ChoiceChips
                label="Taken once the voice channel has been empty for"
                hint="Anybody coming back within that time keeps the event going."
                choices={ GUILD_EVENTS_SETTINGS_CHOICES.endAfterEmptyMinutes }
                selected={ settings.endAfterEmptyMinutes }
                disabled={ isSaving }
                format={ formatEventsMinutes }
                onChange={ ( value ) => save( { endAfterEmptyMinutes: value } ) }
            />

            <ChoiceChips
                label="Taken at the latest, after the start"
                hint="Even with people still in voice - for an evening that never quite empties."
                choices={ GUILD_EVENTS_SETTINGS_CHOICES.maxDurationHours }
                selected={ settings.maxDurationHours }
                disabled={ isSaving }
                format={ ( value ) => `${ value } h` }
                onChange={ ( value ) => save( { maxDurationHours: value } ) }
            />

            <ChoiceChips
                label="Counts as there after at least"
                hint={ "Less time in voice, over the whole event, is listed as Didn't come - so looking in for a minute is " +
                    "not attending. Only the final attendance is held to it." }
                choices={ GUILD_EVENTS_SETTINGS_CHOICES.minVoiceMinutes }
                selected={ settings.minVoiceMinutes }
                disabled={ isSaving }
                format={ ( value ) => value ? formatEventsMinutes( value ) : "Any time" }
                onChange={ ( value ) => save( { minVoiceMinutes: value } ) }
            />

            <ChannelRadioList
                label="Also post a copy to"
                hint="Another text channel - a staff log, say - that gets every finished attendance too. The board itself still becomes the attendance where members saw it."
                channels={ ( channels ?? [] ).filter( ( channel ) => channel.id !== settings.channelId ) }
                selected={ settings.logChannelId }
                disabled={ isSaving }
                emptyLabel={ null === channels ? "Channels could not be loaded from Discord" : "This server has no other text channels" }
                noneLabel="Nowhere else"
                onChange={ ( value ) => save( { logChannelId: value } ) }
            />
        </EventsSettingsCard>
    );
}

/**
 * Every Events setting, in the order an event's evening reaches them - the same order the "How it
 * works" steps beside them walk through. Each is saved the moment it changes, as in Discord.
 */
export function EventsSettings() {
    return (
        <div className="space-y-5 min-w-0">
            <EventsBasicsSettings />
            <EventsCheckInSettings />
            <EventsScopeSettings />
            <EventsSubsSettings />
            <EventsAttendanceSettings />
        </div>
    );
}

export default EventsSettings;
