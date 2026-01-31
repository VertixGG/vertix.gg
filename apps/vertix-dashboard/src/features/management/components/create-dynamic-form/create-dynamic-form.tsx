import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Loader2, Plus, X } from "lucide-react";

import {
    CREATE_DYNAMIC_FORM_INITIAL_STATE,
    CREATE_DYNAMIC_FORM_COMMANDS
} from "@vertix.gg/dashboard/src/features/management/commands/create-dynamic-form/create-dynamic-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { CreateDynamicFormState } from "@vertix.gg/dashboard/src/features/management/commands/create-dynamic-form/create-dynamic-form-commands";
import type { DynamicChannelVersion } from "@vertix.gg/dashboard/src/features/management/types";

export interface CreateDynamicFormProps {
    isCreating: boolean;
}

const CreateDynamicFormComponent: DCommandFunctionComponent<CreateDynamicFormProps, CreateDynamicFormState> = ( {
    isCreating
} ) => {
    const [ state ] = useCommandState<CreateDynamicFormState, Pick<CreateDynamicFormState, "version" | "nameTemplate" | "autoSave" | "mentionable">>(
        "Dashboard/Management/CreateDynamicForm",
        ( state ) => ( {
            version: state.version,
            nameTemplate: state.nameTemplate,
            autoSave: state.autoSave,
            mentionable: state.mentionable
        } )
    );

    const formCommands = useComponent( "Dashboard/Management/CreateDynamicForm" );
    const createDynamicSetup = useCommand( "Dashboard/Management/CreateDynamicSetup" );
    const hideCreateModal = useCommand( "Dashboard/Management/HideCreateModal" );

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault();
        createDynamicSetup.run( {
            input: {
                version: state.version,
                nameTemplate: state.nameTemplate,
                autoSave: state.autoSave,
                mentionable: state.mentionable
            }
        } );
    };

    const handleCancel = () => {
        hideCreateModal.run( {} );
    };

    const handleUpdateVersion = ( value: DynamicChannelVersion ) => {
        formCommands.run( "Dashboard/Management/CreateDynamicForm/UpdateVersion", { value } );
    };

    const handleUpdateNameTemplate = ( value: string ) => {
        formCommands.run( "Dashboard/Management/CreateDynamicForm/UpdateNameTemplate", { value } );
    };

    const handleUpdateAutoSave = ( value: boolean ) => {
        formCommands.run( "Dashboard/Management/CreateDynamicForm/UpdateAutoSave", { value } );
    };

    const handleUpdateMentionable = ( value: boolean ) => {
        formCommands.run( "Dashboard/Management/CreateDynamicForm/UpdateMentionable", { value } );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <h2 className="text-lg font-semibold text-white">Create Dynamic Channel Setup</h2>
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
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            UI Version
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={ () => handleUpdateVersion( "v3" ) }
                                disabled={ isCreating }
                                className={ `flex-1 px-3 py-2 rounded border transition-colors disabled:opacity-50 ${
                                    state.version === "v3"
                                        ? "bg-blue-600 border-blue-500 text-white"
                                        : "bg-zinc-700 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                                }` }
                            >
                                <div className="font-medium">V3 (Recommended)</div>
                                <div className="text-xs opacity-75">Modern UI with control panel</div>
                            </button>
                            <button
                                type="button"
                                onClick={ () => handleUpdateVersion( "v2" ) }
                                disabled={ isCreating }
                                className={ `flex-1 px-3 py-2 rounded border transition-colors disabled:opacity-50 ${
                                    state.version === "v2"
                                        ? "bg-blue-600 border-blue-500 text-white"
                                        : "bg-zinc-700 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                                }` }
                            >
                                <div className="font-medium">V2 (Legacy)</div>
                                <div className="text-xs opacity-75">Classic embedded buttons</div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Channel Name Template
                        </label>
                        <input
                            type="text"
                            value={ state.nameTemplate }
                            onChange={ ( e ) => handleUpdateNameTemplate( e.target.value ) }
                            disabled={ isCreating }
                            placeholder="{user}'s Channel"
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-zinc-500">
                            Available placeholders: { "{user}" }, { "{game}" }, { "{index}" }, { "{state}" }
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300">
                                Auto-Save Channel Settings
                            </label>
                            <p className="text-xs text-zinc-500">
                                Save user preferences for future channels
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={ () => handleUpdateAutoSave( !state.autoSave ) }
                            disabled={ isCreating }
                            className={ `relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                                state.autoSave ? "bg-blue-600" : "bg-zinc-600"
                            }` }
                        >
                            <span
                                className={ `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    state.autoSave ? "translate-x-5" : "translate-x-0"
                                }` }
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300">
                                Mentionable Channels
                            </label>
                            <p className="text-xs text-zinc-500">
                                Allow channels to be mentioned by users
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={ () => handleUpdateMentionable( !state.mentionable ) }
                            disabled={ isCreating }
                            className={ `relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                                state.mentionable ? "bg-blue-600" : "bg-zinc-600"
                            }` }
                        >
                            <span
                                className={ `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    state.mentionable ? "translate-x-5" : "translate-x-0"
                                }` }
                            />
                        </button>
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

const CreateDynamicForm = withCommands(
    "Dashboard/Management/CreateDynamicForm",
    CreateDynamicFormComponent,
    CREATE_DYNAMIC_FORM_INITIAL_STATE,
    [ ...CREATE_DYNAMIC_FORM_COMMANDS ]
);

export { CreateDynamicForm };
export default CreateDynamicForm;
