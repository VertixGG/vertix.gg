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
import type { ScalingSettings } from "@vertix.gg/dashboard/src/features/generators/types";

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
        "Dashboard/Generators/ScalingConfigForm",
        ( state ) => ( {
            prefix: state.prefix,
            maxMembers: state.maxMembers,
            minAvailable: state.minAvailable
        } )
    );

    const formCommands = useComponent( "Dashboard/Generators/ScalingConfigForm" );
    // `useComponent()` only hands back the context the caller is in, so a form cannot reach
    // the panel around it that way; the command resolves by name instead.
    const stopEditing = useCommand( "Dashboard/Generators/ScalingDetailsPanel/StopEditing" );
    const updateScalingSettings = useCommand( "Dashboard/Generators/UpdateScalingSettings" );

    // Initialize form with settings when mounted
    useEffect( () => {
        formCommands.run( "Dashboard/Generators/ScalingConfigForm/Initialize", { settings } );
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
        stopEditing.run( {} );
    };

    const handleCancel = () => {
        stopEditing.run( {} );
    };

    const handleUpdatePrefix = ( value: string ) => {
        formCommands.run( "Dashboard/Generators/ScalingConfigForm/UpdatePrefix", { value } );
    };

    const handleUpdateMaxMembers = ( value: number ) => {
        formCommands.run( "Dashboard/Generators/ScalingConfigForm/UpdateMaxMembers", { value } );
    };

    const handleUpdateMinAvailable = ( value: number ) => {
        formCommands.run( "Dashboard/Generators/ScalingConfigForm/UpdateMinAvailable", { value } );
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                    Channel Name Prefix
                </label>
                <input
                    type="text"
                    value={ state.prefix }
                    onChange={ ( e ) => handleUpdatePrefix( e.target.value ) }
                    placeholder="Lobby {index}"
                    className="w-full px-3 py-2 bg-background border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-border-accent"
                    disabled={ isSaving }
                />
                <div className="flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 text-text-muted mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-text-muted">
                        Use { "{index}" } as a placeholder for the channel number (e.g., "Lobby { "{index}" }" becomes "Lobby 1", "Lobby 2", etc.)
                    </span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                    Max Members Per Channel
                </label>
                <input
                    type="number"
                    value={ state.maxMembers }
                    onChange={ ( e ) => handleUpdateMaxMembers( parseInt( e.target.value ) || 0 ) }
                    min={ 0 }
                    max={ 99 }
                    className="w-full px-3 py-2 bg-background border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-border-accent"
                    disabled={ isSaving }
                />
                <span className="text-xs text-text-muted">
                    Set to 0 for unlimited members per channel
                </span>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                    Minimum Available Channels
                </label>
                <input
                    type="number"
                    value={ state.minAvailable }
                    onChange={ ( e ) => handleUpdateMinAvailable( parseInt( e.target.value ) || 1 ) }
                    min={ 1 }
                    max={ 10 }
                    className="w-full px-3 py-2 bg-background border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-border-accent"
                    disabled={ isSaving }
                />
                <span className="text-xs text-text-muted">
                    The bot will ensure at least this many channels have available slots
                </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <button
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-success/15 hover:bg-success/25 disabled:bg-surface-elevated disabled:cursor-not-allowed text-text-primary rounded text-sm font-medium transition-colors"
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

const ScalingConfigForm = withCommands(
    "Dashboard/Generators/ScalingConfigForm",
    ScalingConfigFormComponent,
    SCALING_CONFIG_FORM_INITIAL_STATE,
    [ ...SCALING_CONFIG_FORM_COMMANDS ]
);

export { ScalingConfigForm };
export default ScalingConfigForm;
