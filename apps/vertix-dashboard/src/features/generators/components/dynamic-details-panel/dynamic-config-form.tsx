import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Save, X, Info } from "lucide-react";

import {
    DYNAMIC_CONFIG_FORM_INITIAL_STATE,
    DYNAMIC_CONFIG_FORM_COMMANDS
} from "@vertix.gg/dashboard/src/features/generators/commands/dynamic-details-panel/dynamic-config-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { DynamicConfigFormState } from "@vertix.gg/dashboard/src/features/generators/commands/dynamic-details-panel/dynamic-config-form-commands";
import type { ChannelPrivacyState, DynamicSettings } from "@vertix.gg/dashboard/src/features/generators/types";

export interface DynamicConfigFormProps {
    masterChannelId: string;
    settings: DynamicSettings | null;
    isSaving: boolean;
}

const PRIVACY_STATES: ReadonlyArray<{ value: ChannelPrivacyState; label: string; hint: string }> = [
    { value: "public", label: "🌐 Public", hint: "Anyone who can see the category can join" },
    { value: "private", label: "🚫 Private", hint: "Visible, but only the people the owner lets in" },
    { value: "hidden", label: "🙈 Hidden", hint: "Neither visible nor joinable until the owner allows it" }
];

interface ToggleFieldProps {
    checked: boolean;
    disabled: boolean;
    title: string;
    body: string;
    onChange: ( value: boolean ) => void;
}

function ToggleField( { checked, disabled, title, body, onChange }: ToggleFieldProps ) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                checked={ checked }
                onChange={ ( e ) => onChange( e.target.checked ) }
                className="w-4 h-4 rounded border-border bg-background text-text-accent focus:ring-accent focus:ring-offset-surface"
                disabled={ disabled }
            />
            <div>
                <span className="text-sm font-medium text-text-primary">{ title }</span>
                <p className="text-xs text-text-muted">{ body }</p>
            </div>
        </label>
    );
}

const DynamicConfigFormComponent: DCommandFunctionComponent<DynamicConfigFormProps, DynamicConfigFormState> = ( {
    masterChannelId,
    settings,
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
            defaultUserLimit: state.defaultUserLimit
        } )
    );

    const formCommands = useComponent( "Dashboard/Generators/DynamicConfigForm" );
    const panelCommands = useComponent( "Dashboard/Generators/DynamicDetailsPanel" );
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
        state.defaultUserLimit !== ( settings?.dynamicChannelDefaultUserLimit ?? null );

    const handleSave = () => {
        updateDynamicSettings.run( {
            masterChannelId,
            settings: {
                dynamicChannelNameTemplate: state.nameTemplate,
                dynamicChannelAutoSave: state.autoSave,
                dynamicChannelAutoStatus: state.autoStatus,
                dynamicChannelMentionable: state.mentionable,
                dynamicChannelDefaultPrivacyState: state.defaultPrivacyState,
                dynamicChannelDefaultUserLimit: state.defaultUserLimit
            }
        } );
        panelCommands.run( "Dashboard/Generators/DynamicDetailsPanel/StopEditing", {} );
    };

    const handleCancel = () => {
        panelCommands.run( "Dashboard/Generators/DynamicDetailsPanel/StopEditing", {} );
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

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                    Channel Name Template
                </label>
                <input
                    type="text"
                    value={ state.nameTemplate }
                    onChange={ ( e ) => handleUpdateNameTemplate( e.target.value ) }
                    placeholder="{user}'s Channel"
                    className="w-full px-3 py-2 bg-background border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-border-accent"
                    disabled={ isSaving }
                />
                <div className="flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 text-text-muted mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-text-muted">
                        Use { "{user}" } as a placeholder for the channel owner's name
                    </span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                    Default Privacy State
                </label>
                <select
                    value={ state.defaultPrivacyState }
                    onChange={ ( e ) => handleUpdateDefaultPrivacyState( e.target.value as ChannelPrivacyState ) }
                    className="w-full px-3 py-2 bg-background border border-border rounded text-text-primary focus:outline-none focus:border-border-accent"
                    disabled={ isSaving }
                >
                    { PRIVACY_STATES.map( ( option ) => (
                        <option key={ option.value } value={ option.value }>{ option.label }</option>
                    ) ) }
                </select>
                <div className="flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 text-text-muted mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-text-muted">
                        { PRIVACY_STATES.find( ( option ) => option.value === state.defaultPrivacyState )?.hint }
                    </span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                    Default User Limit
                </label>
                <input
                    type="number"
                    min={ 0 }
                    max={ 99 }
                    value={ null === state.defaultUserLimit ? "" : state.defaultUserLimit }
                    onChange={ ( e ) => handleUpdateDefaultUserLimit( e.target.value ) }
                    placeholder="Copied from the generator channel"
                    className="w-full px-3 py-2 bg-background border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-border-accent"
                    disabled={ isSaving }
                />
                <div className="flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 text-text-muted mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-text-muted">
                        Leave empty to copy the generator's own limit; 0 means no limit
                    </span>
                </div>
            </div>

            <ToggleField
                checked={ state.autoSave }
                disabled={ isSaving }
                title="Auto-Save Settings"
                body="Remember channel settings when the owner leaves"
                onChange={ handleUpdateAutoSave }
            />

            <ToggleField
                checked={ state.autoStatus }
                disabled={ isSaving }
                title="Automatic Channel Status"
                body="Write the status line under the channel name from what the channel is doing"
                onChange={ handleUpdateAutoStatus }
            />

            <ToggleField
                checked={ state.mentionable }
                disabled={ isSaving }
                title="Mentionable"
                body="Mention the owner in the channel's primary message"
                onChange={ handleUpdateMentionable }
            />

            <div className="flex items-center gap-2 pt-2">
                <button
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-accent/15 hover:bg-accent/25 disabled:bg-surface-elevated disabled:cursor-not-allowed text-text-primary rounded text-sm font-medium transition-colors"
                >
                    <Save className="w-4 h-4" />
                    { isSaving ? "Saving..." : "Save Changes" }
                </button>
                <button
                    onClick={ handleCancel }
                    disabled={ isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-hover disabled:bg-surface disabled:cursor-not-allowed text-text-primary rounded text-sm font-medium transition-colors"
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
