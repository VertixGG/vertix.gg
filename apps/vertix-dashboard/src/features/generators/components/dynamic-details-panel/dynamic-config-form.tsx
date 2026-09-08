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
import type { DynamicSettings } from "@vertix.gg/dashboard/src/features/generators/types";

export interface DynamicConfigFormProps {
    masterChannelId: string;
    settings: DynamicSettings | null;
    isSaving: boolean;
}

const DynamicConfigFormComponent: DCommandFunctionComponent<DynamicConfigFormProps, DynamicConfigFormState> = ( {
    masterChannelId,
    settings,
    isSaving
} ) => {
    const [ state ] = useCommandState<DynamicConfigFormState, Pick<DynamicConfigFormState, "nameTemplate" | "autoSave" | "mentionable">>(
        "Dashboard/Generators/DynamicConfigForm",
        ( state ) => ( {
            nameTemplate: state.nameTemplate,
            autoSave: state.autoSave,
            mentionable: state.mentionable
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
        state.mentionable !== ( settings?.dynamicChannelMentionable ?? false );

    const handleSave = () => {
        updateDynamicSettings.run( {
            masterChannelId,
            settings: {
                dynamicChannelNameTemplate: state.nameTemplate,
                dynamicChannelAutoSave: state.autoSave,
                dynamicChannelMentionable: state.mentionable
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

    const handleUpdateMentionable = ( value: boolean ) => {
        formCommands.run( "Dashboard/Generators/DynamicConfigForm/UpdateMentionable", { value } );
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
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={ state.autoSave }
                        onChange={ ( e ) => handleUpdateAutoSave( e.target.checked ) }
                        className="w-4 h-4 rounded border-border bg-background text-text-accent focus:ring-accent focus:ring-offset-surface"
                        disabled={ isSaving }
                    />
                    <div>
                        <span className="text-sm font-medium text-text-primary">Auto-Save Settings</span>
                        <p className="text-xs text-text-muted">
                            Remember channel settings when the owner leaves
                        </p>
                    </div>
                </label>
            </div>

            <div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={ state.mentionable }
                        onChange={ ( e ) => handleUpdateMentionable( e.target.checked ) }
                        className="w-4 h-4 rounded border-border bg-background text-text-accent focus:ring-accent focus:ring-offset-surface"
                        disabled={ isSaving }
                    />
                    <div>
                        <span className="text-sm font-medium text-text-primary">Mentionable</span>
                        <p className="text-xs text-text-muted">
                            Allow users to @mention dynamic channels
                        </p>
                    </div>
                </label>
            </div>

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
