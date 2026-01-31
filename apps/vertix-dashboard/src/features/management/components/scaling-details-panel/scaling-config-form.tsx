import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Save, X, Info } from "lucide-react";

import {
    SCALING_CONFIG_FORM_INITIAL_STATE,
    SCALING_CONFIG_FORM_COMMANDS
} from "../../commands/scaling-details-panel/scaling-config-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { ScalingConfigFormState } from "../../commands/scaling-details-panel/scaling-config-form-commands";
import type { ScalingSettings } from "@vertix.gg/dashboard/src/features/management/types";

export interface ScalingConfigFormProps {
    masterChannelId: string;
    settings: ScalingSettings | null;
    isSaving: boolean;
}

const ScalingConfigFormComponent: DCommandFunctionComponent<ScalingConfigFormProps, ScalingConfigFormState> = ( {
    masterChannelId,
    settings,
    isSaving
} ) => {
    const [ state ] = useCommandState<ScalingConfigFormState, Pick<ScalingConfigFormState, "prefix" | "maxMembers" | "minAvailable">>(
        "Dashboard/Management/ScalingConfigForm",
        ( state ) => ( {
            prefix: state.prefix,
            maxMembers: state.maxMembers,
            minAvailable: state.minAvailable
        } )
    );

    const formCommands = useComponent( "Dashboard/Management/ScalingConfigForm" );
    const panelCommands = useComponent( "Dashboard/Management/ScalingDetailsPanel" );
    const updateScalingSettings = useCommand( "Dashboard/Management/UpdateScalingSettings" );

    // Initialize form with settings when mounted
    useEffect( () => {
        formCommands.run( "Dashboard/Management/ScalingConfigForm/Initialize", { settings } );
    }, [] );

    const hasChanges =
        state.prefix !== ( settings?.scalingChannelPrefix || "" ) ||
        state.maxMembers !== ( settings?.scalingChannelMaxMembersPerChannel || 0 ) ||
        state.minAvailable !== ( settings?.scalingChannelMinAvailableChannels || 1 );

    const handleSave = () => {
        updateScalingSettings.run( {
            masterChannelId,
            settings: {
                scalingChannelPrefix: state.prefix,
                scalingChannelMaxMembersPerChannel: state.maxMembers,
                scalingChannelMinAvailableChannels: state.minAvailable
            }
        } );
        panelCommands.run( "Dashboard/Management/ScalingDetailsPanel/StopEditing" );
    };

    const handleCancel = () => {
        panelCommands.run( "Dashboard/Management/ScalingDetailsPanel/StopEditing" );
    };

    const handleUpdatePrefix = ( value: string ) => {
        formCommands.run( "Dashboard/Management/ScalingConfigForm/UpdatePrefix", { value } );
    };

    const handleUpdateMaxMembers = ( value: number ) => {
        formCommands.run( "Dashboard/Management/ScalingConfigForm/UpdateMaxMembers", { value } );
    };

    const handleUpdateMinAvailable = ( value: number ) => {
        formCommands.run( "Dashboard/Management/ScalingConfigForm/UpdateMinAvailable", { value } );
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Channel Name Prefix
                </label>
                <input
                    type="text"
                    value={ state.prefix }
                    onChange={ ( e ) => handleUpdatePrefix( e.target.value ) }
                    placeholder="Lobby {index}"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    disabled={ isSaving }
                />
                <div className="flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-500">
                        Use { "{index}" } as a placeholder for the channel number (e.g., "Lobby { "{index}" }" becomes "Lobby 1", "Lobby 2", etc.)
                    </span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Max Members Per Channel
                </label>
                <input
                    type="number"
                    value={ state.maxMembers }
                    onChange={ ( e ) => handleUpdateMaxMembers( parseInt( e.target.value ) || 0 ) }
                    min={ 0 }
                    max={ 99 }
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    disabled={ isSaving }
                />
                <span className="text-xs text-zinc-500">
                    Set to 0 for unlimited members per channel
                </span>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Minimum Available Channels
                </label>
                <input
                    type="number"
                    value={ state.minAvailable }
                    onChange={ ( e ) => handleUpdateMinAvailable( parseInt( e.target.value ) || 1 ) }
                    min={ 1 }
                    max={ 10 }
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    disabled={ isSaving }
                />
                <span className="text-xs text-zinc-500">
                    The bot will ensure at least this many channels have available slots
                </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <button
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
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

const ScalingConfigForm = withCommands(
    "Dashboard/Management/ScalingConfigForm",
    ScalingConfigFormComponent,
    SCALING_CONFIG_FORM_INITIAL_STATE,
    [ ...SCALING_CONFIG_FORM_COMMANDS ]
);

export { ScalingConfigForm };
export default ScalingConfigForm;
