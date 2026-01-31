import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Save, X, Info } from "lucide-react";

import {
    DYNAMIC_CONFIG_FORM_INITIAL_STATE,
    DYNAMIC_CONFIG_FORM_COMMANDS
} from "@vertix.gg/dashboard/src/features/management/commands/dynamic-details-panel/dynamic-config-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { DynamicConfigFormState } from "@vertix.gg/dashboard/src/features/management/commands/dynamic-details-panel/dynamic-config-form-commands";
import type { DynamicSettings } from "@vertix.gg/dashboard/src/features/management/types";

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
        "Dashboard/Management/DynamicConfigForm",
        ( state ) => ( {
            nameTemplate: state.nameTemplate,
            autoSave: state.autoSave,
            mentionable: state.mentionable
        } )
    );

    const formCommands = useComponent( "Dashboard/Management/DynamicConfigForm" );
    const panelCommands = useComponent( "Dashboard/Management/DynamicDetailsPanel" );
    const updateDynamicSettings = useCommand( "Dashboard/Management/UpdateDynamicSettings" );

    // Initialize form with settings when mounted
    useEffect( () => {
        formCommands.run( "Dashboard/Management/DynamicConfigForm/Initialize", { settings } );
    }, [] );

    const hasChanges =
        state.nameTemplate !== ( settings?.dynamicChannelNameTemplate || "{username}'s Channel" ) ||
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
        panelCommands.run( "Dashboard/Management/DynamicDetailsPanel/StopEditing", {} );
    };

    const handleCancel = () => {
        panelCommands.run( "Dashboard/Management/DynamicDetailsPanel/StopEditing", {} );
    };

    const handleUpdateNameTemplate = ( value: string ) => {
        formCommands.run( "Dashboard/Management/DynamicConfigForm/UpdateNameTemplate", { value } );
    };

    const handleUpdateAutoSave = ( value: boolean ) => {
        formCommands.run( "Dashboard/Management/DynamicConfigForm/UpdateAutoSave", { value } );
    };

    const handleUpdateMentionable = ( value: boolean ) => {
        formCommands.run( "Dashboard/Management/DynamicConfigForm/UpdateMentionable", { value } );
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Channel Name Template
                </label>
                <input
                    type="text"
                    value={ state.nameTemplate }
                    onChange={ ( e ) => handleUpdateNameTemplate( e.target.value ) }
                    placeholder="{username}'s Channel"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    disabled={ isSaving }
                />
                <div className="flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-500">
                        Use { "{username}" } as a placeholder for the channel owner's name
                    </span>
                </div>
            </div>

            <div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={ state.autoSave }
                        onChange={ ( e ) => handleUpdateAutoSave( e.target.checked ) }
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
                        disabled={ isSaving }
                    />
                    <div>
                        <span className="text-sm font-medium text-zinc-300">Auto-Save Settings</span>
                        <p className="text-xs text-zinc-500">
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
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
                        disabled={ isSaving }
                    />
                    <div>
                        <span className="text-sm font-medium text-zinc-300">Mentionable</span>
                        <p className="text-xs text-zinc-500">
                            Allow users to @mention dynamic channels
                        </p>
                    </div>
                </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <button
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
                >
                    <Save className="w-4 h-4" />
                    { isSaving ? "Saving..." : "Save Changes" }
                </button>
                <button
                    onClick={ handleCancel }
                    disabled={ isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
            </div>
        </div>
    );
};

const DynamicConfigForm = withCommands(
    "Dashboard/Management/DynamicConfigForm",
    DynamicConfigFormComponent,
    DYNAMIC_CONFIG_FORM_INITIAL_STATE,
    [ ...DYNAMIC_CONFIG_FORM_COMMANDS ]
);

export { DynamicConfigForm };
export default DynamicConfigForm;
