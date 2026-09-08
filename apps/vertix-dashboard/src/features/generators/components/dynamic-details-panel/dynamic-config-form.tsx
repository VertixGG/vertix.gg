import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Save, X } from "lucide-react";

import { RoleCheckList, ToggleSwitch } from "@vertix.gg/dashboard/src/features/generators/components/settings-list";

import {
    DYNAMIC_CONFIG_FORM_INITIAL_STATE,
    DYNAMIC_CONFIG_FORM_COMMANDS
} from "@vertix.gg/dashboard/src/features/generators/commands/dynamic-details-panel/dynamic-config-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { DynamicConfigFormState } from "@vertix.gg/dashboard/src/features/generators/commands/dynamic-details-panel/dynamic-config-form-commands";
import type {
    ChannelPrivacyState,
    DynamicSettings,
    GuildDiscordOptions
} from "@vertix.gg/dashboard/src/features/generators/types";

export interface DynamicConfigFormProps {
    masterChannelId: string;
    settings: DynamicSettings | null;
    discordOptions: GuildDiscordOptions | null;
    isSaving: boolean;
}

const PRIVACY_STATES: ReadonlyArray<{ value: ChannelPrivacyState; label: string; hint: string }> = [
    { value: "public", label: "🌐 Public", hint: "Anyone who can see the category can join" },
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
    settings,
    discordOptions,
    isSaving
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
            logsChannelId: state.logsChannelId
        } )
    );

    const formCommands = useComponent( "Dashboard/Generators/DynamicConfigForm" );
    // `useComponent()` only hands back the context the caller is in, so a form cannot reach
    // the panel around it that way; the command resolves by name instead.
    const stopEditing = useCommand( "Dashboard/Generators/DynamicDetailsPanel/StopEditing" );
    const updateDynamicSettings = useCommand( "Dashboard/Generators/UpdateDynamicSettings" );

    // Initialize form with settings when mounted
    useEffect( () => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/Initialize", { settings } );
    }, [] );

    const hasChanges =
        state.nameTemplate !== ( settings?.dynamicChannelNameTemplate || "{user}'s Channel" ) ||
        state.autoSave !== ( settings?.dynamicChannelAutoSave ?? true ) ||
        state.autoStatus !== ( settings?.dynamicChannelAutoStatus ?? true ) ||
        state.mentionable !== ( settings?.dynamicChannelMentionable ?? false ) ||
        state.defaultPrivacyState !== ( settings?.dynamicChannelDefaultPrivacyState ?? "public" ) ||
        state.defaultUserLimit !== ( settings?.dynamicChannelDefaultUserLimit ?? null ) ||
        state.voiceRoleId !== ( settings?.dynamicChannelVoiceRoleId ?? null ) ||
        state.logsChannelId !== ( settings?.dynamicChannelLogsChannelId ?? null ) ||
        !sameRoles( state.verifiedRoles, settings?.dynamicChannelVerifiedRoles ?? [] ) ||
        !sameRoles( state.staffRoles, settings?.dynamicChannelStaffRoles ?? [] );

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
                dynamicChannelLogsChannelId: state.logsChannelId
            }
        } );
        stopEditing.run( {} );
    };

    const handleCancel = () => {
        stopEditing.run( {} );
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

    const handleUpdateVoiceRole = ( value: string ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateVoiceRole", { value: value || null } );
    };

    const handleUpdateLogsChannel = ( value: string ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateLogsChannel", { value: value || null } );
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
                        placeholder="Copied from the generator"
                        className={ fieldClassName }
                        disabled={ isSaving }
                    />
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        Empty copies the generator's limit; 0 means no limit
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-border-muted pt-4">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Voice role
                    </label>
                    <select
                        value={ state.voiceRoleId ?? "" }
                        onChange={ ( e ) => handleUpdateVoiceRole( e.target.value ) }
                        className={ fieldClassName }
                        disabled={ isSaving || !roles.length }
                    >
                        <option value="">From the server options</option>
                        { roles.map( ( role ) => (
                            <option key={ role.id } value={ role.id }>{ role.name }</option>
                        ) ) }
                    </select>
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        Given to a member while they sit in one of these channels
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Logs channel
                    </label>
                    <select
                        value={ state.logsChannelId ?? "" }
                        onChange={ ( e ) => handleUpdateLogsChannel( e.target.value ) }
                        className={ fieldClassName }
                        disabled={ isSaving || !textChannels.length }
                    >
                        <option value="">None</option>
                        { textChannels.map( ( channel ) => (
                            <option key={ channel.id } value={ channel.id }>#{ channel.name }</option>
                        ) ) }
                    </select>
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        Where channels being created, renamed and claimed is written
                    </p>
                </div>

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

            <div className="flex items-center gap-2 pt-1">
                <button
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-accent/15 hover:bg-accent/25 border border-border-accent
                        disabled:bg-surface-elevated disabled:border-border disabled:text-text-muted disabled:cursor-not-allowed
                        text-text-accent rounded-md text-sm font-medium transition-colors"
                >
                    <Save className="w-4 h-4" />
                    { isSaving ? "Saving..." : "Save changes" }
                </button>
                <button
                    onClick={ handleCancel }
                    disabled={ isSaving }
                    className="flex items-center gap-2 px-4 py-2 hover:bg-surface-hover disabled:cursor-not-allowed
                        text-text-secondary hover:text-text-primary rounded-md text-sm transition-colors"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
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
