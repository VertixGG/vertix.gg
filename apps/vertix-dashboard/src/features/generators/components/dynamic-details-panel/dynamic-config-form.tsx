import { useEffect } from "react";

import { Link } from "react-router-dom";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Save, X } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";

import {
    ChannelCheckList,
    ChannelRadioList,
    RoleCheckList,
    RoleRadioList,
    ToggleSwitch,
    voiceRoleUnavailableReason
} from "@vertix.gg/dashboard/src/features/generators/components/settings-list";

import { dynamicChannelEditorLink } from "@vertix.gg/dashboard/src/features/flow-editor/lib/editor-link";

import {
    LFM_TIMING_FIELDS,
    LFM_TIMING_SETTINGS_KEYS,
    lfmTimingDraftsOf,
    readLfmTimingDraft
} from "@vertix.gg/dashboard/src/features/generators/lib/lfm-timings";

import {
    DYNAMIC_CONFIG_FORM_INITIAL_STATE,
    DYNAMIC_CONFIG_FORM_COMMANDS
} from "@vertix.gg/dashboard/src/features/generators/commands/dynamic-details-panel/dynamic-config-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type {
    TDynamicChannelLfmTimingsField
} from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";
import type { DynamicConfigFormState } from "@vertix.gg/dashboard/src/features/generators/commands/dynamic-details-panel/dynamic-config-form-commands";
import type {
    ChannelPrivacyState,
    DynamicSettings,
    GuildDiscordOptions
} from "@vertix.gg/dashboard/src/features/generators/types";

export interface DynamicConfigFormProps {
    masterChannelId: string;
    /** The interface version the generator was set up with, which decides the flow it links at. */
    masterChannelVersion?: string | null;
    settings: DynamicSettings;
    discordOptions: GuildDiscordOptions | null;
    /** The generator's own limit, which an empty field copies. `0` is Discord's word for none. */
    generatorUserLimit: number | undefined;
    /** The server wide voice role, which this generator falls back to when it picks none. */
    guildVoiceRoleId: string | null;
    isSaving: boolean;
    /** Closes the form. Owned by the panel, which is what decides whether one is open. */
    onClose: () => void;
}

const PRIVACY_STATES: ReadonlyArray<{ value: ChannelPrivacyState; label: string; hint: string }> = [
    // Public writes no permission of its own, so the channel keeps what it inherited from the
    // generator - saying it here rather than describing the category, which no longer decides.
    { value: "public", label: "🌐 Public", hint: "Not restricted - takes the generator's own permissions" },
    { value: "private", label: "🚫 Private", hint: "Visible, but only the people the owner lets in" },
    { value: "hidden", label: "🙈 Hidden", hint: "Neither visible nor joinable until the owner allows it" }
];

/**
 * Function sameRoles() :: Whether two role selections hold the same roles.
 *
 * Ticking a box appends, so the saved order and the form's order differ for the same set - a plain
 * comparison would report a change that is not one.
 */
function sameRoles( a: string[], b: string[] ): boolean {
    return a.length === b.length && a.every( ( id ) => b.includes( id ) );
}

const DynamicConfigFormComponent: DCommandFunctionComponent<DynamicConfigFormProps, DynamicConfigFormState> = ( {
    masterChannelId,
    masterChannelVersion,
    settings,
    discordOptions,
    generatorUserLimit,
    guildVoiceRoleId,
    isSaving,
    onClose
} ) => {
    const [ state ] = useCommandState<DynamicConfigFormState, DynamicConfigFormState>(
        "Dashboard/Generators/DynamicConfigForm",
        ( state ) => ( {
            nameTemplate: state.nameTemplate,
            autoSave: state.autoSave,
            autoStatus: state.autoStatus,
            mentionable: state.mentionable,
            defaultPrivacyState: state.defaultPrivacyState,
            defaultUserLimit: state.defaultUserLimit,
            verifiedRoles: state.verifiedRoles,
            staffRoles: state.staffRoles,
            voiceRoleId: state.voiceRoleId,
            logsChannelId: state.logsChannelId,
            lfmChannelIds: state.lfmChannelIds,
            lfmPingRoleIds: state.lfmPingRoleIds,
            lfmTimingDrafts: state.lfmTimingDrafts,
        } )
    );

    const formCommands = useComponent( "Dashboard/Generators/DynamicConfigForm" );
    const updateDynamicSettings = useCommand( "Dashboard/Generators/UpdateDynamicSettings" );

    // Initialize form with settings when mounted
    useEffect( () => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/Initialize", { settings } );
    }, [] );

    /*
     * What the four clocks read as now, and what they read as when the form opened.
     *
     * Compared as the text of the fields rather than as the milliseconds behind them, so a stored
     * value its own unit cannot write out exactly cannot make an untouched form look edited.
     */
    const lfmTimingResults = LFM_TIMING_FIELDS.map( ( entry ) => ( {
        ... entry,
        draft: state.lfmTimingDrafts[ entry.field ] ?? "",
        ... readLfmTimingDraft( entry.field, state.lfmTimingDrafts[ entry.field ] ?? "" )
    } ) );

    const lfmTimingErrors = lfmTimingResults.filter( ( entry ) => entry.error );

    const storedLfmTimingDrafts = lfmTimingDraftsOf( {
        postCooldown: settings.dynamicChannelLfmPostCooldownMs,
        pingCooldown: settings.dynamicChannelLfmPingCooldownMs,
        postExpiry: settings.dynamicChannelLfmPostExpiryMs,
        occupancyDebounce: settings.dynamicChannelLfmOccupancyDebounceMs
    } );

    const hasChanges =
        lfmTimingResults.some( ( { field, draft } ) => draft !== storedLfmTimingDrafts[ field ] ) ||
        state.nameTemplate !== ( settings.dynamicChannelNameTemplate ) ||
        state.autoSave !== ( settings.dynamicChannelAutoSave ) ||
        state.autoStatus !== ( settings.dynamicChannelAutoStatus ) ||
        state.mentionable !== ( settings.dynamicChannelMentionable ) ||
        state.defaultPrivacyState !== ( settings.dynamicChannelDefaultPrivacyState ) ||
        state.defaultUserLimit !== ( settings.dynamicChannelDefaultUserLimit ) ||
        state.voiceRoleId !== ( settings.dynamicChannelVoiceRoleId ) ||
        state.logsChannelId !== ( settings.dynamicChannelLogsChannelId ) ||
        !sameRoles( state.verifiedRoles, settings.dynamicChannelVerifiedRoles ) ||
        !sameRoles( state.staffRoles, settings.dynamicChannelStaffRoles ) ||
        !sameRoles( state.lfmChannelIds, settings.dynamicChannelLfmChannelIds ?? [] ) ||
        !sameRoles( state.lfmPingRoleIds, settings.dynamicChannelLfmPingRoleIds ?? [] );

    const handleSave = () => {
        updateDynamicSettings.run( {
            masterChannelId,
            settings: {
                dynamicChannelNameTemplate: state.nameTemplate,
                dynamicChannelAutoSave: state.autoSave,
                dynamicChannelAutoStatus: state.autoStatus,
                dynamicChannelMentionable: state.mentionable,
                dynamicChannelDefaultPrivacyState: state.defaultPrivacyState,
                dynamicChannelDefaultUserLimit: state.defaultUserLimit,
                dynamicChannelVerifiedRoles: state.verifiedRoles,
                dynamicChannelStaffRoles: state.staffRoles,
                dynamicChannelVoiceRoleId: state.voiceRoleId,
                dynamicChannelLogsChannelId: state.logsChannelId,
                dynamicChannelLfmChannelIds: state.lfmChannelIds,
                dynamicChannelLfmPingRoleIds: state.lfmPingRoleIds,
                // Every field is in bounds by the time this runs - saving is refused while one is
                // not, so there is no partial set to decide what to do with here.
                ... lfmTimingResults.reduce( ( timings, { field, milliseconds } ) => ( {
                    ... timings,
                    [ LFM_TIMING_SETTINGS_KEYS[ field ] ]: milliseconds
                } ), {} )
            }
        } );
        onClose();
    };

    const handleCancel = onClose;

    const handleUpdateLfmChannels = ( value: string[] ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateLfmChannels", { value } );
    };

    const handleUpdateLfmPingRoles = ( value: string[] ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateLfmPingRoles", { value } );
    };

    const handleUpdateLfmTiming = ( field: TDynamicChannelLfmTimingsField, value: string ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateLfmTiming", { field, value } );
    };

    const handleUpdateNameTemplate = ( value: string ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateNameTemplate", { value } );
    };

    const handleUpdateAutoSave = ( value: boolean ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateAutoSave", { value } );
    };

    const handleUpdateAutoStatus = ( value: boolean ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateAutoStatus", { value } );
    };

    const handleUpdateMentionable = ( value: boolean ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateMentionable", { value } );
    };

    const handleUpdateDefaultPrivacyState = ( value: ChannelPrivacyState ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateDefaultPrivacyState", { value } );
    };

    // An empty field is "copy the generator's own limit", which is not the same as a limit of
    // zero - zero is Discord's own word for no limit at all.
    const handleUpdateDefaultUserLimit = ( value: string ) => {
        const trimmed = value.trim();
        const parsed = Number( trimmed );

        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateDefaultUserLimit", {
            value: !trimmed.length || Number.isNaN( parsed ) ? null : Math.min( Math.max( parsed, 0 ), 99 )
        } );
    };

    const handleUpdateVerifiedRoles = ( value: string[] ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateVerifiedRoles", { value } );
    };

    const handleUpdateStaffRoles = ( value: string[] ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateStaffRoles", { value } );
    };

    const handleUpdateVoiceRole = ( value: string | null ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateVoiceRole", { value } );
    };

    const handleUpdateLogsChannel = ( value: string | null ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateLogsChannel", { value } );
    };

    // The api answers with an error body rather than a rejection when it cannot reach Discord, so
    // the shape is checked rather than assumed.
    const roles = Array.isArray( discordOptions?.roles ) ? discordOptions.roles : [];
    const textChannels = Array.isArray( discordOptions?.textChannels ) ? discordOptions.textChannels : [];

    const fieldClassName = "w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary "
        + "placeholder-text-muted focus:outline-none focus:border-border-accent";

    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 max-w-md">
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Channel name template
                    </label>
                    <input
                        type="text"
                        value={ state.nameTemplate }
                        onChange={ ( e ) => handleUpdateNameTemplate( e.target.value ) }
                        placeholder="{user}'s Channel"
                        className={ `${ fieldClassName } font-mono` }
                        disabled={ isSaving }
                    />
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        { "{user}" } stands for the channel owner's name
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        New channel privacy
                    </label>
                    <select
                        value={ state.defaultPrivacyState }
                        onChange={ ( e ) => handleUpdateDefaultPrivacyState( e.target.value as ChannelPrivacyState ) }
                        className={ fieldClassName }
                        disabled={ isSaving }
                    >
                        { PRIVACY_STATES.map( ( option ) => (
                            <option key={ option.value } value={ option.value }>{ option.label }</option>
                        ) ) }
                    </select>
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        { PRIVACY_STATES.find( ( option ) => option.value === state.defaultPrivacyState )?.hint }
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        New channel user limit
                    </label>
                    <input
                        type="number"
                        min={ 0 }
                        max={ 99 }
                        value={ null === state.defaultUserLimit ? "" : state.defaultUserLimit }
                        onChange={ ( e ) => handleUpdateDefaultUserLimit( e.target.value ) }
                        placeholder={ 0 === ( generatorUserLimit ?? 0 )
                            ? "Copied from the generator (no limit)"
                            : `Copied from the generator (${ generatorUserLimit } users)` }
                        className={ fieldClassName }
                        disabled={ isSaving }
                    />
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        Empty copies the generator's limit; 0 means no limit
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-border-muted pt-4">
                <RoleRadioList
                    label="Voice role"
                    hint="Given to a member while they sit in one of these channels"
                    roles={ roles }
                    unavailableReason={ voiceRoleUnavailableReason }
                    selected={ state.voiceRoleId }
                    disabled={ isSaving }
                    emptyLabel="Roles could not be loaded from Discord"
                    // Picking nothing here is not "no role", it is deferring to the server, so the
                    // row names what deferring actually gets.
                    noneLabel={ `From the server options (${ guildVoiceRoleId
                        ? roles.find( ( role ) => role.id === guildVoiceRoleId )?.name ?? guildVoiceRoleId
                        : "none" })` }
                    onChange={ handleUpdateVoiceRole }
                />

                <ChannelRadioList
                    label="Logs channel"
                    hint="Where channels being created, renamed and claimed is written"
                    channels={ textChannels }
                    selected={ state.logsChannelId }
                    disabled={ isSaving }
                    emptyLabel="Channels could not be loaded from Discord"
                    noneLabel="None"
                    onChange={ handleUpdateLogsChannel }
                />

                <RoleCheckList
                    label="Verified roles"
                    hint="The roles the privacy buttons work on"
                    roles={ roles }
                    selected={ state.verifiedRoles }
                    disabled={ isSaving }
                    emptyLabel="Roles could not be loaded from Discord"
                    onChange={ handleUpdateVerifiedRoles }
                />

                <RoleCheckList
                    label="Staff roles"
                    hint="Roles a private or hidden channel can never shut out"
                    roles={ roles }
                    selected={ state.staffRoles }
                    disabled={ isSaving }
                    emptyLabel="Roles could not be loaded from Discord"
                    onChange={ handleUpdateStaffRoles }
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-border-muted pt-4">
                <ToggleSwitch
                    checked={ state.autoSave }
                    disabled={ isSaving }
                    title="Auto-save settings"
                    body="Remember channel settings when the owner leaves"
                    onChange={ handleUpdateAutoSave }
                />

                <ToggleSwitch
                    checked={ state.autoStatus }
                    disabled={ isSaving }
                    title="Automatic channel status"
                    body="Write the status line under the channel name"
                    onChange={ handleUpdateAutoStatus }
                />

                <ToggleSwitch
                    checked={ state.mentionable }
                    disabled={ isSaving }
                    title="Mentionable"
                    body="Mention the owner in the primary message"
                    onChange={ handleUpdateMentionable }
                />
            </div>

            { /*
                 Everything the looking-for-members button does, in one place rather than scattered
                 among the access lists it used to sit in - the boards are what switches it on, and
                 the clocks are meaningless without them.
              */ }
            <div className="border-t border-border-muted pt-4 space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Looking for members</h3>
                    <p className="text-xs text-text-muted mb-0">
                        A room with space left can advertise itself on a board. Picking no board is what
                        the bot reads as the feature being off, and the button also has to be switched on
                        below before an owner sees it.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <ChannelCheckList
                        label="Boards"
                        hint="Where a room with space left may advertise itself. None switches the feature off"
                        channels={ textChannels }
                        selected={ state.lfmChannelIds }
                        disabled={ isSaving }
                        emptyLabel="Channels could not be loaded from Discord"
                        onChange={ handleUpdateLfmChannels }
                    />

                    <RoleCheckList
                        label="Pings"
                        hint="Who gets mentioned when a room posts. None mentions nobody"
                        roles={ roles }
                        selected={ state.lfmPingRoleIds }
                        disabled={ isSaving }
                        emptyLabel="Roles could not be loaded from Discord"
                        onChange={ handleUpdateLfmPingRoles }
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    { lfmTimingResults.map( ( { field, label, unit, hint, draft, error } ) => (
                        <div key={ field }>
                            <label className="block text-sm font-medium text-text-primary mb-1">
                                { label }
                            </label>

                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={ draft }
                                    onChange={ ( e ) => handleUpdateLfmTiming( field, e.target.value ) }
                                    disabled={ isSaving }
                                    className={ `${ fieldClassName } pr-20 ${ error ? "border-error" : "" }` }
                                />
                                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-text-muted
                                pointer-events-none">
                                    { unit }
                                </span>
                            </div>

                            { error ? (
                                <p className="text-xs text-error mt-1 mb-0">{ error } { unit }</p>
                            ) : (
                                <p className="text-xs text-text-muted mt-1 mb-0">{ hint }</p>
                            ) }
                        </div>
                    ) ) }
                </div>
            </div>

            <div className="border-t border-border-muted pt-4">
                <label className="block text-sm font-medium text-text-primary mb-1">
                    Buttons
                </label>
                <p className="text-xs text-text-muted mt-0 mb-0">
                    { /* Chosen and arranged in one place rather than two - the editor draws the
                         elements themselves, so the set and its rows are the same gesture there. */ }
                    Which buttons a channel owner gets, and the rows they sit in, are set in the{ " " }
                    <Link
                        to={ dynamicChannelEditorLink( masterChannelId, masterChannelVersion ) }
                        className="link-accent"
                    >
                        interface editor
                    </Link>.
                </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <DiscordButton
                    variant="primary"
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving || 0 < lfmTimingErrors.length }
                    icon={ <Save className="w-4 h-4" /> }
                >
                    { isSaving ? "Saving..." : "Save changes" }
                </DiscordButton>
                <DiscordButton
                    onClick={ handleCancel }
                    disabled={ isSaving }
                    icon={ <X className="w-4 h-4" /> }
                >
                    Cancel
                </DiscordButton>
            </div>
        </div>
    );
};

const DynamicConfigForm = withCommands(
    "Dashboard/Generators/DynamicConfigForm",
    DynamicConfigFormComponent,
    DYNAMIC_CONFIG_FORM_INITIAL_STATE,
    [ ...DYNAMIC_CONFIG_FORM_COMMANDS ]
);

export { DynamicConfigForm };
export default DynamicConfigForm;
