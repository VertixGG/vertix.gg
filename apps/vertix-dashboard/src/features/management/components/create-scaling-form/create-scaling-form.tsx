import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Loader2, Plus, X } from "lucide-react";

import {
    CREATE_SCALING_FORM_INITIAL_STATE,
    CREATE_SCALING_FORM_COMMANDS
} from "@vertix.gg/dashboard/src/features/management/commands/create-scaling-form/create-scaling-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { CreateScalingFormState } from "@vertix.gg/dashboard/src/features/management/commands/create-scaling-form/create-scaling-form-commands";

export interface CreateScalingFormProps {
    isCreating: boolean;
}

const CreateScalingFormComponent: DCommandFunctionComponent<CreateScalingFormProps, CreateScalingFormState> = ( {
    isCreating
} ) => {
    const [ state ] = useCommandState<CreateScalingFormState, Pick<CreateScalingFormState, "prefix" | "maxMembers">>(
        "Dashboard/Management/CreateScalingForm",
        ( state ) => ( {
            prefix: state.prefix,
            maxMembers: state.maxMembers
        } )
    );

    const formCommands = useComponent( "Dashboard/Management/CreateScalingForm" );
    const createScalingSetup = useCommand( "Dashboard/Management/CreateScalingSetup" );
    const hideCreateModal = useCommand( "Dashboard/Management/HideCreateModal" );

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault();
        createScalingSetup.run( { input: { prefix: state.prefix, maxMembers: state.maxMembers } } );
    };

    const handleCancel = () => {
        hideCreateModal.run( {} );
    };

    const handleUpdatePrefix = ( value: string ) => {
        formCommands.run( "Dashboard/Management/CreateScalingForm/UpdatePrefix", { value } );
    };

    const handleUpdateMaxMembers = ( value: number ) => {
        formCommands.run( "Dashboard/Management/CreateScalingForm/UpdateMaxMembers", { value } );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <h2 className="text-lg font-semibold text-white">Create Auto-Scaling Setup</h2>
                    <button
                        onClick={ handleCancel }
                        disabled={ isCreating }
                        className="p-1 text-zinc-400 hover:text-white rounded disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={ handleSubmit } className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Channel Prefix
                        </label>
                        <input
                            type="text"
                            value={ state.prefix }
                            onChange={ ( e ) => handleUpdatePrefix( e.target.value ) }
                            disabled={ isCreating }
                            placeholder="### Room - {index} ###"
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-zinc-500">
                            Use { "{index}" } as placeholder for channel number
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Max Members per Channel
                        </label>
                        <input
                            type="number"
                            value={ state.maxMembers }
                            onChange={ ( e ) => handleUpdateMaxMembers( parseInt( e.target.value ) || 0 ) }
                            disabled={ isCreating }
                            min={ 0 }
                            max={ 99 }
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-zinc-500">
                            Set to 0 for unlimited members
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={ handleCancel }
                            disabled={ isCreating }
                            className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={ isCreating }
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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
    "Dashboard/Management/CreateScalingForm",
    CreateScalingFormComponent,
    CREATE_SCALING_FORM_INITIAL_STATE,
    [ ...CREATE_SCALING_FORM_COMMANDS ]
);

export { CreateScalingForm };
export default CreateScalingForm;
