import React from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent } from "@zenflux/react-commander/hooks";

import { Loader2, Plus, X } from "lucide-react";

import {
    CREATE_DYNAMIC_FORM_INITIAL_STATE,
    CREATE_DYNAMIC_FORM_COMMANDS
} from "@vertix.gg/dashboard/src/features/generators/commands/create-dynamic-form/create-dynamic-form-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { CreateDynamicFormState } from "@vertix.gg/dashboard/src/features/generators/commands/create-dynamic-form/create-dynamic-form-commands";
import type { CreateDynamicSetupInput, DynamicChannelVersion } from "@vertix.gg/dashboard/src/features/generators/types";

export interface CreateDynamicFormProps {
    isCreating: boolean;
    onSubmit: ( input: CreateDynamicSetupInput ) => void;
    onCancel: () => void;
}

const CreateDynamicFormComponent: DCommandFunctionComponent<CreateDynamicFormProps, CreateDynamicFormState> = ( {
    isCreating,
    onSubmit,
    onCancel
} ) => {
    const [ state ] = useCommandState<CreateDynamicFormState, Pick<CreateDynamicFormState, "version" | "nameTemplate" | "autoSave" | "mentionable">>(
        "Dashboard/Generators/CreateDynamicForm",
        ( state ) => ( {
            version: state.version,
            nameTemplate: state.nameTemplate,
            autoSave: state.autoSave,
            mentionable: state.mentionable
        } )
    );

    const formCommands = useComponent( "Dashboard/Generators/CreateDynamicForm" );

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault();
        onSubmit( {
            version: state.version,
            nameTemplate: state.nameTemplate,
            autoSave: state.autoSave,
            mentionable: state.mentionable
        } );
    };

    const handleUpdateVersion = ( value: DynamicChannelVersion ) => {
        formCommands.run( "Dashboard/Generators/CreateDynamicForm/UpdateVersion", { value } );
    };

    const handleUpdateNameTemplate = ( value: string ) => {
        formCommands.run( "Dashboard/Generators/CreateDynamicForm/UpdateNameTemplate", { value } );
    };

    const handleUpdateAutoSave = ( value: boolean ) => {
        formCommands.run( "Dashboard/Generators/CreateDynamicForm/UpdateAutoSave", { value } );
    };

    const handleUpdateMentionable = ( value: boolean ) => {
        formCommands.run( "Dashboard/Generators/CreateDynamicForm/UpdateMentionable", { value } );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary">Create Dynamic Channel Setup</h2>
                    <button
                        onClick={ onCancel }
                        disabled={ isCreating }
                        className="p-1 text-text-secondary hover:text-text-primary rounded disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={ handleSubmit } className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            UI Version
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={ () => handleUpdateVersion( "v3" ) }
                                disabled={ isCreating }
                                className={ `flex-1 px-3 py-2 rounded border transition-colors disabled:opacity-50 ${
                                    state.version === "v3"
                                        ? "bg-accent/15 border-border-accent text-text-primary"
                                        : "bg-surface-elevated border-border text-text-primary hover:border-border-accent"
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
                                        ? "bg-accent/15 border-border-accent text-text-primary"
                                        : "bg-surface-elevated border-border text-text-primary hover:border-border-accent"
                                }` }
                            >
                                <div className="font-medium">V2 (Legacy)</div>
                                <div className="text-xs opacity-75">Classic embedded buttons</div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Channel Name Template
                        </label>
                        <input
                            type="text"
                            value={ state.nameTemplate }
                            onChange={ ( e ) => handleUpdateNameTemplate( e.target.value ) }
                            disabled={ isCreating }
                            placeholder="{user}'s Channel"
                            className="w-full px-3 py-2 bg-surface-elevated border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-border-accent disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-text-muted">
                            Available placeholders: { "{user}" }, { "{game}" }, { "{index}" }, { "{state}" }
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-text-primary">
                                Auto-Save Channel Settings
                            </label>
                            <p className="text-xs text-text-muted">
                                Save user preferences for future channels
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={ () => handleUpdateAutoSave( !state.autoSave ) }
                            disabled={ isCreating }
                            className={ `relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                                state.autoSave ? "bg-accent/15" : "bg-surface-hover"
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
                            <label className="block text-sm font-medium text-text-primary">
                                Mentionable Channels
                            </label>
                            <p className="text-xs text-text-muted">
                                Allow channels to be mentioned by users
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={ () => handleUpdateMentionable( !state.mentionable ) }
                            disabled={ isCreating }
                            className={ `relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                                state.mentionable ? "bg-accent/15" : "bg-surface-hover"
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
                            onClick={ onCancel }
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

const CreateDynamicForm = withCommands(
    "Dashboard/Generators/CreateDynamicForm",
    CreateDynamicFormComponent,
    CREATE_DYNAMIC_FORM_INITIAL_STATE,
    [ ...CREATE_DYNAMIC_FORM_COMMANDS ]
);

export { CreateDynamicForm };
export default CreateDynamicForm;
