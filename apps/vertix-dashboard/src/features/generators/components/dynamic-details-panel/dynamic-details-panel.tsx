import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Radio, RefreshCw, Trash2, Settings, Hash, AlertTriangle, Pencil } from "lucide-react";

import { DynamicChannelCard } from "./dynamic-channel-card";
import DynamicConfigForm from "./dynamic-config-form";

import { SettingRow, SettingsGroup } from "@vertix.gg/dashboard/src/features/generators/components/settings-list";

import {
    DYNAMIC_DETAILS_PANEL_INITIAL_STATE,
    DYNAMIC_DETAILS_PANEL_COMMANDS
} from "@vertix.gg/dashboard/src/features/generators/commands/dynamic-details-panel/dynamic-details-panel-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { DynamicDetailsPanelState } from "@vertix.gg/dashboard/src/features/generators/commands/dynamic-details-panel/dynamic-details-panel-commands";
import type {
    DynamicMasterDetails,
    GuildDiscordOptions,
    GuildSettings
} from "@vertix.gg/dashboard/src/features/generators/types";

export interface DynamicDetailsPanelProps {
    details: DynamicMasterDetails;
    discordOptions: GuildDiscordOptions | null;
    /** What this generator falls back to when it holds no list of its own. */
    guildSettings: GuildSettings | null;
    isSaving: boolean;
    isRefreshing: boolean;
    lastRefreshTime: Date | null;
}

function formatLastRefresh( date: Date | null ): string {
    if ( !date ) {
        return "Never";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor( diffMs / 1000 );

    if ( diffSec < 5 ) {
        return "Just now";
    }

    if ( diffSec < 60 ) {
        return `${ diffSec }s ago`;
    }

    const diffMin = Math.floor( diffSec / 60 );

    if ( diffMin < 60 ) {
        return `${ diffMin }m ago`;
    }

    return date.toLocaleTimeString();
}

const PRIVACY_STATE_LABELS: Record<string, string> = {
    public: "🌐 Public",
    private: "🚫 Private",
    hidden: "🙈 Hidden"
};

/**
 * Function formatUserLimit() :: The limit a new channel starts with, in words.
 *
 * Null and zero are different answers - null copies the generator's own limit, zero is Discord's
 * own way of saying there is no limit at all.
 */
function formatUserLimit( limit: number | null, generatorLimit: number | undefined ): string {
    return formatLimitValue( ( null === limit ? generatorLimit : limit ) ?? 0 );
}

function formatLimitValue( limit: number ): string {
    return 0 === limit ? "No limit" : `${ limit } users`;
}

/**
 * Function formatRoles() :: The names of the roles a setting points at.
 */
function formatRoles( ids: string[], options: GuildDiscordOptions | null ): string {
    if ( !ids.length ) {
        return "None";
    }

    return ids
        .map( ( id ) => options?.roles?.find( ( role ) => role.id === id )?.name ?? id )
        .join( ", " );
}

function formatRole( id: string | null, options: GuildDiscordOptions | null, fallback: string ): string {
    if ( !id ) {
        return fallback;
    }

    return options?.roles?.find( ( role ) => role.id === id )?.name ?? id;
}

const INHERITED_NOTE = (
    <>
        This <strong className="font-semibold">generator</strong> has no list of its own, so it follows
        the <strong className="font-semibold">Server Config</strong>. Changing it there moves this with it.
    </>
);

const PUBLIC_PRIVACY_NOTE = (
    <>
        A public channel is not restricted, so it takes the
        <strong className="font-semibold"> generator</strong>&apos;s own permissions. Changing them
        on the <strong className="font-semibold">generator</strong> moves this with it.
    </>
);

const COPIED_LIMIT_NOTE = (
    <>
        This <strong className="font-semibold">generator</strong> sets no limit of its own, so a new
        channel copies the <strong className="font-semibold">generator</strong>&apos;s own limit.
    </>
);

/**
 * Function formatInherited() :: What a generator actually applies.
 *
 * An empty list of its own is not an empty audience, it is the absence of a choice - the server
 * wide list decides, and when that is empty too the last resort does. Saying only "None" would
 * report the opposite of what the channel does.
 */
function formatInherited(
    own: string[],
    guild: string[],
    options: GuildDiscordOptions | null,
    unsetLabel: string
): string {
    if ( own.length ) {
        return formatRoles( own, options );
    }

    return guild.length ? formatRoles( guild, options ) : unsetLabel;
}

function formatChannel( id: string | null, options: GuildDiscordOptions | null ): string {
    if ( !id ) {
        return "None";
    }

    const name = options?.textChannels?.find( ( channel ) => channel.id === id )?.name;

    return name ? `#${ name }` : id;
}

const DynamicDetailsPanelComponent: DCommandFunctionComponent<DynamicDetailsPanelProps, DynamicDetailsPanelState> = ( {
    details,
    discordOptions,
    guildSettings,
    isSaving,
    isRefreshing,
    lastRefreshTime
} ) => {
    const [ state ] = useCommandState<DynamicDetailsPanelState, Pick<DynamicDetailsPanelState, "isEditing" | "showDeleteConfirm" | "tick">>(
        "Dashboard/Generators/DynamicDetailsPanel",
        ( state ) => ( {
            isEditing: state.isEditing,
            showDeleteConfirm: state.showDeleteConfirm,
            tick: state.tick
        } )
    );

    const panelCommands = useComponent( "Dashboard/Generators/DynamicDetailsPanel" );

    // Page-level commands via useCommand
    const refreshSelected = useCommand( "Dashboard/Generators/RefreshSelected" );
    const deleteDynamicSetup = useCommand( "Dashboard/Generators/DeleteDynamicSetup" );

    const { master, dynamicChannels } = details;

    // Update the "X ago" display every 10 seconds
    useEffect( () => {
        const intervalId = setInterval( () => {
            panelCommands.run( "Dashboard/Generators/DynamicDetailsPanel/Tick", {} );
        }, 10000 );

        return () => clearInterval( intervalId );
    }, [] );

    // Polled here rather than on the page: an open form is edited against the settings it was
    // opened with, and refreshing underneath it would swap them out mid-edit. The panel is what
    // knows whether one is open.
    useEffect( () => {
        if ( state.isEditing ) {
            return;
        }

        const intervalId = setInterval( () => {
            refreshSelected.run( {} );
        }, 60000 );

        return () => clearInterval( intervalId );
    }, [ state.isEditing ] );

    const handleRefresh = () => {
        refreshSelected.run( {} );
    };

    const handleDelete = () => {
        deleteDynamicSetup.run( { masterChannelId: master.id } );
    };

    const handleStopEditing = () => {
        panelCommands.run( "Dashboard/Generators/DynamicDetailsPanel/StopEditing", {} );
    };

    const handleStartEditing = () => {
        panelCommands.run( "Dashboard/Generators/DynamicDetailsPanel/StartEditing", {
            settings: master.settings
        } );
    };

    const handleShowDeleteConfirm = () => {
        panelCommands.run( "Dashboard/Generators/DynamicDetailsPanel/ShowDeleteConfirm", {} );
    };

    const handleHideDeleteConfirm = () => {
        panelCommands.run( "Dashboard/Generators/DynamicDetailsPanel/HideDeleteConfirm", {} );
    };

    const settings = master.settings;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border">
                <div className="max-w-4xl w-full px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                            <Radio className="w-5 h-5 text-text-accent" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-text-primary truncate">
                                { details.discord?.masterChannel?.name || "Dynamic Master" }
                            </h2>
                            <p className="text-sm text-text-secondary mb-0 truncate">
                                { details.discord?.category?.name ? (
                                    <span>in <span className="text-text-primary">{ details.discord.category.name }</span></span>
                                ) : (
                                    <span title={ master.channelId }>{ master.channelId }</span>
                                ) }
                                { " · " }
                                { dynamicChannels.length } active
                                { 1 === dynamicChannels.length ? " channel" : " channels" }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-text-muted">
                            { isRefreshing ? "Refreshing..." : formatLastRefresh( lastRefreshTime ) }
                        </span>
                        <button
                            onClick={ handleRefresh }
                            disabled={ isRefreshing || isSaving }
                            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={ `w-5 h-5 ${ isRefreshing ? "animate-spin" : "" }` } />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl w-full px-6 py-6 space-y-6">
                    <section className="bg-surface border border-border rounded-lg">
                        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2 mb-0">
                                <Settings className="w-4 h-4 text-accent-muted" />
                                Configuration
                            </h3>
                            { !state.isEditing && (
                                <button
                                    onClick={ handleStartEditing }
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-accent bg-accent/15
                                        hover:bg-accent/25 border border-border-accent rounded-md transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            ) }
                        </header>

                        <div className="p-4">
                            { state.isEditing ? (
                                <DynamicConfigForm
                                    masterChannelId={ master.id }
                                    settings={ settings }
                                    discordOptions={ discordOptions }
                                    generatorUserLimit={ details.discord?.masterChannel?.userLimit }
                                    isSaving={ isSaving }
                                    onClose={ handleStopEditing }
                                />
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    <SettingsGroup title="New channels">
                                        <SettingRow
                                            label="Name template"
                                            value={ settings?.dynamicChannelNameTemplate || "{user}'s Channel" }
                                            mono
                                        />
                                        <SettingRow
                                            label="Privacy"
                                            value={ PRIVACY_STATE_LABELS[ settings?.dynamicChannelDefaultPrivacyState ?? "public" ] }
                                            note={ "public" === ( settings?.dynamicChannelDefaultPrivacyState ?? "public" )
                                                ? PUBLIC_PRIVACY_NOTE
                                                : undefined }
                                        />
                                        <SettingRow
                                            label="User limit"
                                            value={ formatUserLimit(
                                                settings?.dynamicChannelDefaultUserLimit ?? null,
                                                details.discord?.masterChannel?.userLimit
                                            ) }
                                            note={ null === ( settings?.dynamicChannelDefaultUserLimit ?? null )
                                                ? COPIED_LIMIT_NOTE
                                                : undefined }
                                        />
                                    </SettingsGroup>

                                    <SettingsGroup title="Behaviour">
                                        <SettingRow
                                            label="Auto-save"
                                            value={ settings?.dynamicChannelAutoSave ? "Enabled" : "Disabled" }
                                        />
                                        <SettingRow
                                            label="Automatic status"
                                            value={ ( settings?.dynamicChannelAutoStatus ?? true ) ? "Enabled" : "Disabled" }
                                        />
                                        <SettingRow
                                            label="Mentionable"
                                            value={ settings?.dynamicChannelMentionable ? "Enabled" : "Disabled" }
                                        />
                                    </SettingsGroup>

                                    <SettingsGroup title="Access">
                                        <SettingRow
                                            label="Verified roles"
                                            value={ formatInherited(
                                                settings?.dynamicChannelVerifiedRoles ?? [],
                                                guildSettings?.verifiedRoleIds ?? [],
                                                discordOptions,
                                                "@everyone"
                                            ) }
                                            note={ ( settings?.dynamicChannelVerifiedRoles ?? [] ).length
                                                ? undefined
                                                : INHERITED_NOTE }
                                        />
                                        <SettingRow
                                            label="Staff roles"
                                            value={ formatInherited(
                                                settings?.dynamicChannelStaffRoles ?? [],
                                                guildSettings?.staffRoleIds ?? [],
                                                discordOptions,
                                                "None"
                                            ) }
                                            note={ ( settings?.dynamicChannelStaffRoles ?? [] ).length
                                                ? undefined
                                                : INHERITED_NOTE }
                                        />
                                        <SettingRow
                                            label="Voice role"
                                            value={ formatRole(
                                                settings?.dynamicChannelVoiceRoleId ?? guildSettings?.voiceRoleId ?? null,
                                                discordOptions,
                                                "None"
                                            ) }
                                            note={ settings?.dynamicChannelVoiceRoleId ? undefined : INHERITED_NOTE }
                                        />
                                        <SettingRow
                                            label="Logs channel"
                                            value={ formatChannel( settings?.dynamicChannelLogsChannelId ?? null, discordOptions ) }
                                        />
                                    </SettingsGroup>
                                </div>
                            ) }
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2 mb-3">
                            <Hash className="w-4 h-4 text-accent-muted" />
                            Active channels ({ dynamicChannels.length })
                        </h3>

                        { dynamicChannels.length === 0 ? (
                            <p className="text-sm text-text-muted mb-0">
                                None right now. One appears here as soon as a member joins the generator.
                            </p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                { dynamicChannels.map( ( channel ) => (
                                    <DynamicChannelCard
                                        key={ channel.id }
                                        channel={ channel }
                                    />
                                ) ) }
                            </div>
                        ) }
                    </section>

                    <section className="border border-error/30 rounded-lg px-4 py-3">
                        { state.showDeleteConfirm ? (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-start gap-2 min-w-0">
                                    <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                                    <p className="text-sm text-text-secondary mb-0">
                                        This removes the generator and every channel under it from Discord.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={ handleDelete }
                                        disabled={ isSaving }
                                        className="px-3 py-1.5 bg-error/20 hover:bg-error/30 disabled:opacity-50
                                            text-error rounded-md text-sm font-medium transition-colors"
                                    >
                                        Delete everything
                                    </button>
                                    <button
                                        onClick={ handleHideDeleteConfirm }
                                        disabled={ isSaving }
                                        className="px-3 py-1.5 bg-surface-elevated hover:bg-surface-hover
                                            text-text-primary rounded-md text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-sm text-text-muted">
                                    Deleting the setup removes the generator and its channels from Discord.
                                </span>
                                <button
                                    onClick={ handleShowDeleteConfirm }
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-error
                                        hover:bg-error/15 rounded-md transition-colors shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete setup
                                </button>
                            </div>
                        ) }
                    </section>
                </div>
            </div>
        </div>
    );
};

const DynamicDetailsPanel = withCommands(
    "Dashboard/Generators/DynamicDetailsPanel",
    DynamicDetailsPanelComponent,
    DYNAMIC_DETAILS_PANEL_INITIAL_STATE,
    [ ...DYNAMIC_DETAILS_PANEL_COMMANDS ]
);

export { DynamicDetailsPanel };
export default DynamicDetailsPanel;
