import { useState } from "react";

import { Loader2, Plus, X } from "lucide-react";

import type { CreateScalingSetupInput } from "@vertix.gg/dashboard/src/features/management/types";

interface CreateScalingFormProps {
    isCreating: boolean;
    onSubmit: ( input: CreateScalingSetupInput ) => void;
    onCancel: () => void;
}

export function CreateScalingForm( { isCreating, onSubmit, onCancel }: CreateScalingFormProps ) {
    const [ prefix, setPrefix ] = useState( "### Room - {index} ###" );
    const [ maxMembers, setMaxMembers ] = useState( 10 );

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault();
        onSubmit( { prefix, maxMembers } );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <h2 className="text-lg font-semibold text-white">Create Auto-Scaling Setup</h2>
                    <button
                        onClick={ onCancel }
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
                            value={ prefix }
                            onChange={ ( e ) => setPrefix( e.target.value ) }
                            disabled={ isCreating }
                            placeholder="### Room - {index} ###"
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-zinc-500">
                            Use {"{index}"} as placeholder for channel number
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Max Members per Channel
                        </label>
                        <input
                            type="number"
                            value={ maxMembers }
                            onChange={ ( e ) => setMaxMembers( parseInt( e.target.value ) || 0 ) }
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
                            onClick={ onCancel }
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
}
