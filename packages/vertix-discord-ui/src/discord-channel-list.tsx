import * as React from "react";

import "./styles/discord-channel-list.css";

import { cn } from "@vertix.gg/discord-ui/src/lib/utils";

export interface DiscordChannelUser {
    id: string;
    username: string;
    avatar?: string;
}

export interface DiscordChannelStatus {
    text: string;
    editable?: boolean;
}

export interface DiscordChannelListItem {
    id: string;
    name: string;
    active?: boolean;
    /**
     * Occupancy, where it is worth showing. An empty channel nobody is in - the generator you join
     * to get one of your own - carries neither in Discord, just its name.
     */
    userCount?: number;
    maxUsers?: number;
    /**
     * How long you have been in the channel, as Discord shows it on the one you are in.
     *
     * Given, it stands where the occupancy pair would, because that is what Discord puts there,
     * and it runs from there - this is where the clock stood when the page was opened, not a
     * number it sits on.
     */
    timer?: string;
    /** Draws the padlock Discord puts on a channel not everyone can connect to. */
    locked?: boolean;
    status?: DiscordChannelStatus;
    users?: DiscordChannelUser[];
    showInvite?: boolean;
}

export interface DiscordChannelListProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    icon?: React.ReactNode;
    iconEmoji?: string;
    channels: DiscordChannelListItem[];
    collapsible?: boolean;
    showAddButton?: boolean;
    onChannelClick?: ( channel: DiscordChannelListItem ) => void;
    onInviteClick?: ( channel: DiscordChannelListItem ) => void;
    onStatusEdit?: ( channel: DiscordChannelListItem ) => void;
}

export const DiscordChannelList: React.FC<DiscordChannelListProps> = ( {
    title,
    icon,
    iconEmoji,
    channels,
    collapsible = false,
    showAddButton = false,
    onChannelClick,
    onInviteClick,
    onStatusEdit,
    className,
    ...props
} ) => {
    const [ isCollapsed, setIsCollapsed ] = React.useState( false );

    return (
        <div className={ cn( "discord-channel-list", className ) } { ...props }>
            <div className="discord-channel-list-header">
                { ( icon || iconEmoji ) && (
                    <div className="discord-channel-list-icon">
                        { iconEmoji ? <span className="discord-channel-list-icon-emoji">{ iconEmoji }</span> : icon }
                    </div>
                ) }
                <span className="discord-channel-list-title">{ title }</span>
                { collapsible && (
                    <button
                        className="discord-channel-list-chevron"
                        onClick={ () => setIsCollapsed( !isCollapsed ) }
                        aria-label={ isCollapsed ? "Expand" : "Collapse" }
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            style={ { transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" } }
                        >
                            <path
                                d="M3 6L8 11L13 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                ) }
                { showAddButton && (
                    <button
                        className="discord-channel-list-add-button"
                        aria-label="Add channel"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M8 3V13M3 8H13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                ) }
            </div>
            { !isCollapsed && (
                <div className="discord-channel-list-content">
                    { channels.map( ( channel ) => (
                        <DiscordChannelListItem
                            key={ channel.id }
                            channel={ channel }
                            onClick={ onChannelClick }
                            onInviteClick={ onInviteClick }
                            onStatusEdit={ onStatusEdit }
                        />
                    ) ) }
                </div>
            ) }
        </div>
    );
};

interface DiscordChannelListItemProps {
    channel: DiscordChannelListItem;
    onClick?: ( channel: DiscordChannelListItem ) => void;
    onInviteClick?: ( channel: DiscordChannelListItem ) => void;
    onStatusEdit?: ( channel: DiscordChannelListItem ) => void;
}

/**
 * Function DiscordVoiceChannelIcon() :: The speaker Discord puts beside a voice channel.
 *
 * Drawn here rather than lifted from Discord - their icon set is theirs - at the size and weight
 * theirs sits at, so a row reads the same without carrying somebody else's artwork. Green while you
 * are connected to the channel, muted grey otherwise, which is the whole of what it is saying.
 *
 * A channel not everyone can connect to trades its sound wave for a padlock, rather than wearing
 * both: Discord swaps the one glyph for the other, and at this size two marks beside the cone turn
 * into a smudge.
 */
function DiscordVoiceChannelIcon( { locked }: { locked?: boolean } ) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M11.4 4.2a1 1 0 0 1 .6.9v13.8a1 1 0 0 1-1.65.76L6.4 16.2H4a2 2 0 0 1-2-2v-4.4a2 2 0 0 1 2-2h2.4l3.95-3.46a1 1 0 0 1 1.05-.14Z"
                fill="currentColor"
            />

            { locked ? (
                <>
                    <path
                        d="M16.4 13.2v-1.5a2.1 2.1 0 0 1 4.2 0v1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <rect x="14.9" y="12.9" width="7.2" height="6.2" rx="1.4" fill="currentColor"/>
                </>
            ) : (
                <path
                    d="M15.5 8.8a1 1 0 0 1 1.4.15 5 5 0 0 1 0 6.1 1 1 0 1 1-1.55-1.25 3 3 0 0 0 0-3.6 1 1 0 0 1 .15-1.4Z"
                    fill="currentColor"
                />
            ) }
        </svg>
    );
}

const DiscordChannelListItem: React.FC<DiscordChannelListItemProps> = ( {
    channel,
    onClick,
    onInviteClick,
    onStatusEdit
} ) => {
    const isActive = channel.active ?? false;
    const hasUsers = channel.users && channel.users.length > 0;

    return (
        <div
            className={ cn(
                "discord-channel-list-item",
                isActive && "discord-channel-list-item-active"
            ) }
            onClick={ () => onClick?.( channel ) }
        >
            <div className="discord-channel-list-item-main">
                <div className={ cn( "discord-channel-list-item-icon", isActive && "active" ) }>
                    <DiscordVoiceChannelIcon locked={ channel.locked }/>
                </div>
                <div className="discord-channel-list-item-content">
                    <div className="discord-channel-list-item-name">{ channel.name }</div>
                    { channel.status && (
                        <div className="discord-channel-list-item-status">
                            <span>{ channel.status.text }</span>
                            { channel.status.editable && (
                                <button
                                    className="discord-channel-list-item-status-edit"
                                    onClick={ ( e ) => {
                                        e.stopPropagation();
                                        onStatusEdit?.( channel );
                                    } }
                                    aria-label="Edit status"
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path
                                            d="M10.5 1.5L12.5 3.5M11 1L9.5 2.5L11.5 4.5L13 3L11 1Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M2 13H5L11.5 6.5L8.5 3.5L2 10V13Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            ) }
                        </div>
                    ) }
                </div>
                { channel.timer ? (
                    <DiscordChannelListTimer from={ channel.timer }/>
                ) : undefined !== channel.userCount && undefined !== channel.maxUsers ? (
                    <div className="discord-channel-list-item-count">
                        <span className={ cn( "discord-channel-list-item-count-current", isActive && "active" ) }>
                            { String( channel.userCount ).padStart( 2, "0" ) }
                        </span>
                        <span className="discord-channel-list-item-count-max">
                            { String( channel.maxUsers ).padStart( 2, "0" ) }
                        </span>
                    </div>
                ) : null }
            </div>
            { hasUsers && (
                <div className="discord-channel-list-item-details">
                    { channel.showInvite && (
                        <div
                            className="discord-channel-list-item-invite"
                            onClick={ ( e ) => {
                                e.stopPropagation();
                                onInviteClick?.( channel );
                            } }
                        >
                            <span className="discord-channel-list-item-invite-emoji">🌐</span>
                            <span>Invite to Voice</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path
                                    d="M4 2L8 6L4 10"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    ) }
                    <div className="discord-channel-list-item-users">
                        { channel.users?.map( ( user ) => (
                            <div key={ user.id } className="discord-channel-list-item-user">
                                { user.avatar ? (
                                    <img
                                        src={ user.avatar }
                                        alt={ user.username }
                                        className="discord-channel-list-item-user-avatar"
                                    />
                                ) : (
                                    <div className="discord-channel-list-item-user-avatar-placeholder">
                                        { user.username.charAt( 0 ).toUpperCase() }
                                    </div>
                                ) }
                                <span className="discord-channel-list-item-user-name">{ user.username }</span>
                            </div>
                        ) ) }
                    </div>
                </div>
            ) }
        </div>
    );
};

export default DiscordChannelList;

/** A minute and an hour in seconds, for reading a clock and writing one back. */
const SECONDS_PER_MINUTE = 60,
    SECONDS_PER_HOUR = 60 * 60;

const TIMER_TICK_MS = 1000;

/** `mm:ss` or `h:mm:ss` as a number of seconds, or nothing at all if it is not a clock. */
function parseTimer( value: string ): number | null {
    const parts = value.split( ":" );

    if ( parts.length < 2 || parts.length > 3 ) {
        return null;
    }

    let seconds = 0;

    for ( const part of parts ) {
        if ( !/^\d+$/.test( part ) ) {
            return null;
        }

        seconds = seconds * SECONDS_PER_MINUTE + parseInt( part, 10 );
    }

    return seconds;
}

function formatTimer( totalSeconds: number ): string {
    const hours = Math.floor( totalSeconds / SECONDS_PER_HOUR ),
        minutes = Math.floor( totalSeconds % SECONDS_PER_HOUR / SECONDS_PER_MINUTE ),
        seconds = totalSeconds % SECONDS_PER_MINUTE;

    const pad = ( value: number ) => String( value ).padStart( 2, "0" );

    // Discord shows the hour only once there has been one, and pads everything after it.
    return hours
        ? `${ hours }:${ pad( minutes ) }:${ pad( seconds ) }`
        : `${ pad( minutes ) }:${ pad( seconds ) }`;
}

/**
 * How long you have been in the channel, which is a clock and so has to run.
 *
 * Discord counts it up from the moment you joined, rolling seconds into minutes and minutes into
 * an hour once there is one. Counted off the wall clock rather than off its own ticks, so a tab
 * left in the background comes back reading what it should rather than where it was throttled to.
 *
 * It is its own component so that a second passing redraws the clock and nothing else around it.
 */
function DiscordChannelListTimer( { from }: { from: string } ) {
    // Where it stood, and when that was - reset if the page ever hands it a different starting point.
    const anchor = React.useRef( { from, at: Date.now() } );

    if ( anchor.current.from !== from ) {
        anchor.current = { from, at: Date.now() };
    }

    const [ now, setNow ] = React.useState( () => Date.now() );

    React.useEffect( () => {
        const tick = window.setInterval( () => setNow( Date.now() ), TIMER_TICK_MS );

        return () => window.clearInterval( tick );
    }, [] );

    const started = parseTimer( from );

    // Anything that is not a clock is left exactly as it was given.
    if ( null === started ) {
        return <div className="discord-channel-list-item-timer">{ from }</div>;
    }

    const elapsed = Math.max( 0, Math.floor( ( now - anchor.current.at ) / 1000 ) );

    return (
        <div className="discord-channel-list-item-timer">{ formatTimer( started + elapsed ) }</div>
    );
}
