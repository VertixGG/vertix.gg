import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Loader2, Plus, X } from "lucide-react";

import {
    CREATE_SCALING_FORM_INITIAL_STATE,
    CREATE_SCALING_FORM_COMMANDS
} from "@vertix.gg/dashboard/src/features/generators/commands/create-scaling-form/create-scaling-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { CreateScalingFormState } from "@vertix.gg/dashboard/src/features/generators/commands/create-scaling-form/create-scaling-form-commands";

export interface CreateScalingFormProps {
    isCreating: boolean;
}

const CreateScalingFormComponent: DCommandFunctionComponent<CreateScalingFormProps, CreateScalingFormState> = ( {
    isCreating
} ) => {
    const [ state ] = useCommandState<CreateScalingFormState, Pick<CreateScalingFormState, "prefix" | "maxMembers">>(
        "Dashboard/Generators/CreateScalingForm",
        ( state ) => ( {
            prefix: state.prefix,
            maxMembers: state.maxMembers
        } )
    );

    const formCommands = useComponent( "Dashboard/Generators/CreateScalingForm" );
    const createScalingSetup = useCommand( "Dashboard/Generators/CreateScalingSetup" );
    const hideCreateModal = useCommand( "Dashboard/Generators/HideCreateModal" );

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault();
        createScalingSetup.run( { input: { prefix: state.prefix, maxMembers: state.maxMembers } } );
    };

    const handleCancel = () => {
        hideCreateModal.run( {} );
    };

    const handleUpdatePrefix = ( value: string ) => {
        formCommands.run( "Dashboard/Generators/CreateScalingForm/UpdatePrefix", { value } );
    };

    const handleUpdateMaxMembers = ( value: number ) => {
        formCommands.run( "Dashboard/Generators/CreateScalingForm/UpdateMaxMembers", { value } );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary">Create Auto-Scaling Setup</h2>
                    <button
                        onClick={ handleCancel }
                        disabled={ isCreating }
                        className="p-1 text-text-secondary hover:text-text-primary rounded disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={ handleSubmit } className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Channel Prefix
                        </label>
                        <input
                            type="text"
                            value={ state.prefix }
                            onChange={ ( e ) => handleUpdatePrefix( e.target.value ) }
                            disabled={ isCreating }
                            placeholder="### Room - {index} ###"
                            className="w-full px-3 py-2 bg-surface-elevated border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-border-accent disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-text-muted">
                            Use { "{index}" } as placeholder for channel number
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Max Members per Channel
                        </label>
                        <input
                            type="number"
                            value={ state.maxMembers }
                            onChange={ ( e ) => handleUpdateMaxMembers( parseInt( e.target.value ) || 0 ) }
                            disabled={ isCreating }
                            min={ 0 }
                            max={ 99 }
                            className="w-full px-3 py-2 bg-surface-elevated border border-border rounded text-text-primary focus:outline-none focus:border-border-accent disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-text-muted">
                            Set to 0 for unlimited members
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={ handleCancel }
                            disabled={ isCreating }
                            className="flex-1 px-4 py-2 bg-surface-elevated text-text-primary rounded hover:bg-surface-hover disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={ isCreating }
                            className="flex-1 px-4 py-2 bg-accent/15 text-text-accent border border-border-accent rounded hover:bg-accent/25 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            { isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create
                                </>
                            ) }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateScalingForm = withCommands(
    "Dashboard/Generators/CreateScalingForm",
    CreateScalingFormComponent,
    CREATE_SCALING_FORM_INITIAL_STATE,
    [ ...CREATE_SCALING_FORM_COMMANDS ]
);

export { CreateScalingForm };
export default CreateScalingForm;
