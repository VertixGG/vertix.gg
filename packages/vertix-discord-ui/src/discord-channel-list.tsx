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
    userCount: number;
    maxUsers: number;
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
                <div className="discord-channel-list-item-icon">
                    <span className={ cn( "discord-channel-list-item-speaker-emoji", isActive && "active" ) }>
                        { isActive ? "🔊" : "🔇" }
                    </span>
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
                <div className="discord-channel-list-item-count">
                    <span className={ cn( "discord-channel-list-item-count-current", isActive && "active" ) }>
                        { String( channel.userCount ).padStart( 2, "0" ) }
                    </span>
                    <span className="discord-channel-list-item-count-max">
                        { String( channel.maxUsers ).padStart( 2, "0" ) }
                    </span>
                </div>
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
