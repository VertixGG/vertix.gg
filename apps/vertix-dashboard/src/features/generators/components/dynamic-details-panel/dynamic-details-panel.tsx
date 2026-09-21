import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Radio, RefreshCw, Trash2, Settings, Hash, AlertTriangle, Pencil } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";

import { Link } from "react-router-dom";

import {
    dynamicChannelLfmTimingsResolve
} from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

import { DynamicChannelCard } from "./dynamic-channel-card";
import DynamicConfigForm from "./dynamic-config-form";

import { SettingRow, SettingsGroup } from "@vertix.gg/dashboard/src/features/generators/components/settings-list";

import { ButtonsSummary } from "@vertix.gg/dashboard/src/features/generators/components/buttons-picker";
import { dynamicChannelEditorLink } from "@vertix.gg/dashboard/src/features/flow-editor/lib/editor-link";

import {
    LFM_TIMING_FIELDS,
    formatLfmTiming
} from "@vertix.gg/dashboard/src/features/generators/lib/lfm-timings";

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

const ROLE_BUTTONS_NOTE = (
    <>
        This <strong className="font-semibold">role</strong> carries a set of its own, so its members
        get it <strong className="font-semibold">instead of</strong> the default rather than as well
        as it. An owner holding more than one of these roles gets the highest one's.
    </>
);

const DEFAULT_BUTTONS_NOTE = (
    <>
        What an owner gets when none of their roles carries a set of its own. The control panel
        beside the generator always draws this one, whoever is looking at it.
    </>
);

const INHERITED_NOTE = (
    <>
        This <strong className="font-semibold">generator</strong> has no list of its own, so it follows
        the <strong className="font-semibold">Server Options</strong>. Changing it there moves this with it.
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

/**
 * Function buttonsRolesInPrecedenceOrder() :: The roles carrying a button set, highest role first.
 *
 * The order is the rule rather than a way of arranging the rows: an owner's roles are walked from
 * the top and the first one carrying a set decides what their channel draws, outright. Sorted any
 * other way, the role that actually wins would sit somewhere in the middle of the list with
 * nothing marking it.
 *
 * A set stored against an id the server no longer has can reach nobody, so it leads rather than
 * being dropped - it is the only row here that needs the admin to do something.
 */
function buttonsRolesInPrecedenceOrder(
    byRole: Record<string, string[]>,
    options: GuildDiscordOptions | null
): Array<{ id: string; buttons: string[]; isMissing: boolean }> {
    // An empty entry is a removed set rather than a set of no buttons, and the bot falls through
    // it to the default - so it is not one of these rows either.
    const configured = Object.keys( byRole ).filter( ( id ) => byRole[ id ]?.length );

    const known = ( options?.roles ?? [] )
        .filter( ( role ) => configured.includes( role.id ) )
        .map( ( role ) => ( { id: role.id, buttons: byRole[ role.id ], isMissing: false } ) );

    const missing = configured
        .filter( ( id ) => ! known.some( ( role ) => role.id === id ) )
        .map( ( id ) => ( { id, buttons: byRole[ id ], isMissing: true } ) );

    return [ ...missing, ...known ];
}

function formatChannel( id: string | null, options: GuildDiscordOptions | null ): string {
    if ( !id ) {
        return "None";
    }

    const name = options?.textChannels?.find( ( channel ) => channel.id === id )?.name;

    return name ? `#${ name }` : id;
}

/**
 * Function formatChannels() :: The names of the channels a setting points at.
 */
function formatChannels( ids: string[], options: GuildDiscordOptions | null ): string {
    return ids.map( ( id ) => formatChannel( id, options ) ).join( ", " );
}

const LFM_OFF_NOTE = (
    <>
        No board is picked, so the button refuses and tells whoever pressed it to ask an admin.
        Picking one here is what switches the feature on.
    </>
);

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

    const roleButtonSets = buttonsRolesInPrecedenceOrder(
        settings?.dynamicChannelButtonsTemplateByRole ?? {},
        discordOptions
    );

    // Resolved rather than read straight, so an api too old to answer with these still shows the
    // clocks the bot is actually running on instead of four blanks.
    const lfmTimings = dynamicChannelLfmTimingsResolve( {
        postCooldown: settings?.dynamicChannelLfmPostCooldownMs,
        pingCooldown: settings?.dynamicChannelLfmPingCooldownMs,
        postExpiry: settings?.dynamicChannelLfmPostExpiryMs,
        occupancyDebounce: settings?.dynamicChannelLfmOccupancyDebounceMs
    } );

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
                            { !state.isEditing && settings && (
                                <DiscordButton
                                    variant="primary"
                                    size="sm"
                                    onClick={ handleStartEditing }
                                    icon={ <Pencil className="w-3.5 h-3.5" /> }
                                >
                                    Edit
                                </DiscordButton>
                            ) }
                        </header>

                        <div className="p-4">
                            { !settings ? (
                                <p className="text-sm text-text-muted">
                                    These settings could not be read - the bot was not reachable. Nothing is shown
                                    rather than what it might have been, because a form filled with a guess saves
                                    the guess.
                                </p>
                            ) : state.isEditing ? (
                                <DynamicConfigForm
                                    masterChannelId={ master.id }
                                    masterChannelVersion={ master.version }
                                    settings={ settings }
                                    discordOptions={ discordOptions }
                                    generatorUserLimit={ details.discord?.masterChannel?.userLimit }
                                    guildVoiceRoleId={ guildSettings?.voiceRoleId ?? null }
                                    isSaving={ isSaving }
                                    onClose={ handleStopEditing }
                                />
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    <SettingsGroup title="New channels">
                                        <SettingRow
                                            label="Name template"
                                            value={ settings.dynamicChannelNameTemplate }
                                            mono
                                        />
                                        <SettingRow
                                            label="Privacy"
                                            value={ PRIVACY_STATE_LABELS[ settings.dynamicChannelDefaultPrivacyState ] }
                                            note={ "public" === settings.dynamicChannelDefaultPrivacyState
                                                ? PUBLIC_PRIVACY_NOTE
                                                : undefined }
                                        />
                                        <SettingRow
                                            label="User limit"
                                            value={ formatUserLimit(
                                                settings.dynamicChannelDefaultUserLimit,
                                                details.discord?.masterChannel?.userLimit
                                            ) }
                                            note={ null === settings.dynamicChannelDefaultUserLimit
                                                ? COPIED_LIMIT_NOTE
                                                : undefined }
                                        />
                                    </SettingsGroup>

                                    <SettingsGroup title="Behaviour">
                                        <SettingRow
                                            label="Auto-save"
                                            value={ settings.dynamicChannelAutoSave ? "Enabled" : "Disabled" }
                                        />
                                        <SettingRow
                                            label="Automatic status"
                                            value={ settings.dynamicChannelAutoStatus ? "Enabled" : "Disabled" }
                                        />
                                        <SettingRow
                                            label="Mentionable"
                                            value={ settings.dynamicChannelMentionable ? "Enabled" : "Disabled" }
                                        />
                                    </SettingsGroup>

                                    <SettingsGroup title="Access">
                                        <SettingRow
                                            label="Verified roles"
                                            value={ formatInherited(
                                                settings.dynamicChannelVerifiedRoles,
                                                guildSettings?.verifiedRoleIds ?? [],
                                                discordOptions,
                                                "@everyone"
                                            ) }
                                            note={ settings.dynamicChannelVerifiedRoles.length
                                                ? undefined
                                                : INHERITED_NOTE }
                                        />
                                        <SettingRow
                                            label="Staff roles"
                                            value={ formatInherited(
                                                settings.dynamicChannelStaffRoles,
                                                guildSettings?.staffRoleIds ?? [],
                                                discordOptions,
                                                "None"
                                            ) }
                                            note={ settings.dynamicChannelStaffRoles.length
                                                ? undefined
                                                : INHERITED_NOTE }
                                        />
                                        <SettingRow
                                            label="Voice role"
                                            value={ formatRole(
                                                settings.dynamicChannelVoiceRoleId ?? guildSettings?.voiceRoleId ?? null,
                                                discordOptions,
                                                "None"
                                            ) }
                                            note={ settings.dynamicChannelVoiceRoleId ? undefined : INHERITED_NOTE }
                                        />
                                        <SettingRow
                                            label="Logs channel"
                                            value={ formatChannel( settings.dynamicChannelLogsChannelId, discordOptions ) }
                                        />
                                    </SettingsGroup>

                                    { /* The boards decide whether there is a feature here at all,
                                         so they lead and the clocks only appear once there are. */ }
                                    <SettingsGroup title="Looking for members">
                                        <SettingRow
                                            label="Boards"
                                            value={ ( settings.dynamicChannelLfmChannelIds ?? [] ).length
                                                ? formatChannels(
                                                    settings.dynamicChannelLfmChannelIds ?? [],
                                                    discordOptions
                                                )
                                                : "Off" }
                                            note={ ( settings.dynamicChannelLfmChannelIds ?? [] ).length
                                                ? undefined
                                                : LFM_OFF_NOTE }
                                        />

                                        { ( settings.dynamicChannelLfmChannelIds ?? [] ).length ? (
                                            <>
                                                <SettingRow
                                                    label="Pings"
                                                    value={ formatRoles(
                                                        settings.dynamicChannelLfmPingRoleIds ?? [],
                                                        discordOptions
                                                    ) }
                                                />

                                                { LFM_TIMING_FIELDS.map( ( { field, label } ) => (
                                                    <SettingRow
                                                        key={ field }
                                                        label={ label }
                                                        value={ formatLfmTiming( field, lfmTimings[ field ] ) }
                                                    />
                                                ) ) }
                                            </>
                                        ) : null }
                                    </SettingsGroup>

                                    { /* Buttons live in the interface editor now, where the set and
                                         the rows it prints in are one thing. */ }
                                    <div className="md:col-span-2">
                                        <SettingsGroup title="Buttons">
                                            { /* Above the default and in the order the bot resolves
                                                 them, because that order decides which of them a
                                                 member actually gets. */ }
                                            { roleButtonSets.map( ( role ) => (
                                                <SettingRow
                                                    key={ role.id }
                                                    label={ formatRole( role.id, discordOptions, role.id ) }
                                                    value={
                                                        <span className="flex flex-col gap-1.5 items-start">
                                                            { role.isMissing && (
                                                                <span className="text-text-muted">
                                                                    No role here carries this id any more,
                                                                    so this set reaches nobody
                                                                </span>
                                                            ) }
                                                            <ButtonsSummary
                                                                selected={ role.buttons }
                                                                version={ master.version }
                                                                masterChannelId={ master.channelId }
                                                            />
                                                        </span>
                                                    }
                                                    note={ ROLE_BUTTONS_NOTE }
                                                />
                                            ) ) }

                                            <SettingRow
                                                // Only true while it is the only set there is. Once
                                                // a role carries one, the honest name for this row
                                                // is who it is left for.
                                                label={ roleButtonSets.length ? "Everyone else" : "Shown to users" }
                                                note={ roleButtonSets.length ? DEFAULT_BUTTONS_NOTE : undefined }
                                                value={
                                                    <span className="flex flex-col gap-1.5 items-start">
                                                        <ButtonsSummary
                                                            selected={ settings.dynamicChannelButtonsTemplate }
                                                            version={ master.version }
                                                            masterChannelId={ master.channelId }
                                                        />
                                                        <Link
                                                            to={ dynamicChannelEditorLink( master.id, master.version ) }
                                                            className="link-accent"
                                                        >
                                                            Arrange in the interface editor
                                                        </Link>
                                                    </span>
                                                }
                                            />
                                        </SettingsGroup>
                                    </div>
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
                                    <DiscordButton
                                        variant="danger"
                                        size="sm"
                                        onClick={ handleDelete }
                                        disabled={ isSaving }
                                    >
                                        Delete everything
                                    </DiscordButton>
                                    <DiscordButton
                                        size="sm"
                                        onClick={ handleHideDeleteConfirm }
                                        disabled={ isSaving }
                                    >
                                        Cancel
                                    </DiscordButton>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-sm text-text-muted">
                                    Deleting the setup removes the generator and its channels from Discord.
                                </span>
                                <DiscordButton
                                    variant="danger"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={ handleShowDeleteConfirm }
                                    icon={ <Trash2 className="w-4 h-4" /> }
                                >
                                    Delete setup
                                </DiscordButton>
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
