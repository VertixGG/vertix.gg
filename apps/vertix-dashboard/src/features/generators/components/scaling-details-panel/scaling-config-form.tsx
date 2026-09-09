import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Save, X } from "lucide-react";

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
    /** Closes the form. Owned by the panel, which is what decides whether one is open. */
    onClose: () => void;
}

const ScalingConfigFormComponent: DCommandFunctionComponent<ScalingConfigFormProps, ScalingConfigFormState> = ( {
    masterChannelId,
    settings,
    isSaving,
    onClose
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
        onClose();
    };

    const handleCancel = onClose;

    const handleUpdatePrefix = ( value: string ) => {
        formCommands.run( "Dashboard/Generators/ScalingConfigForm/UpdatePrefix", { value } );
    };

    const handleUpdateMaxMembers = ( value: number ) => {
        formCommands.run( "Dashboard/Generators/ScalingConfigForm/UpdateMaxMembers", { value } );
    };

    const handleUpdateMinAvailable = ( value: number ) => {
        formCommands.run( "Dashboard/Generators/ScalingConfigForm/UpdateMinAvailable", { value } );
    };

    const fieldClassName = "w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary "
        + "placeholder-text-muted focus:outline-none focus:border-border-accent";

    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 max-w-md">
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Channel name prefix
                    </label>
                    <input
                        type="text"
                        value={ state.prefix }
                        onChange={ ( e ) => handleUpdatePrefix( e.target.value ) }
                        placeholder="Lobby {index}"
                        className={ `${ fieldClassName } font-mono` }
                        disabled={ isSaving }
                    />
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        { "{index}" } numbers the channels - "Lobby { "{index}" }" becomes Lobby 1, Lobby 2
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Max members per channel
                    </label>
                    <input
                        type="number"
                        value={ state.maxMembers }
                        onChange={ ( e ) => handleUpdateMaxMembers( parseInt( e.target.value ) || 0 ) }
                        min={ 0 }
                        max={ 99 }
                        className={ fieldClassName }
                        disabled={ isSaving }
                    />
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        0 leaves the channels unlimited
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Minimum available channels
                    </label>
                    <input
                        type="number"
                        value={ state.minAvailable }
                        onChange={ ( e ) => handleUpdateMinAvailable( parseInt( e.target.value ) || 1 ) }
                        min={ 1 }
                        max={ 10 }
                        className={ fieldClassName }
                        disabled={ isSaving }
                    />
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        How many empty channels to keep waiting
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <button
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-success/15 hover:bg-success/25 border border-success/40
                        disabled:bg-surface-elevated disabled:border-border disabled:text-text-muted disabled:cursor-not-allowed
                        text-success rounded-md text-sm font-medium transition-colors"
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

const ScalingConfigForm = withCommands(
    "Dashboard/Generators/ScalingConfigForm",
    ScalingConfigFormComponent,
    SCALING_CONFIG_FORM_INITIAL_STATE,
    [ ...SCALING_CONFIG_FORM_COMMANDS ]
);

export { ScalingConfigForm };
export default ScalingConfigForm;
