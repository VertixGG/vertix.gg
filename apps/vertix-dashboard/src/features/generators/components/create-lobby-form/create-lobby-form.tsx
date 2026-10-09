import { useCommand } from "@zenflux/react-commander/hooks";

import { Gamepad2, Loader2, Plus, X } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";

export interface CreateLobbyFormProps {
    isCreating: boolean;
}

/**
 * Making a team lobby. There is nothing to fill in - a lobby asks nothing before it is made, and its
 * hosts are named afterwards from `/setup` - so the form is the say-so before a setup is spent on it.
 */
export function CreateLobbyForm( { isCreating }: CreateLobbyFormProps ) {
    const createLobbySetup = useCommand( "Dashboard/Generators/CreateLobbySetup" );
    const hideCreateModal = useCommand( "Dashboard/Generators/HideCreateModal" );

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault();
        createLobbySetup.run( {} );
    };

    const handleCancel = () => {
        hideCreateModal.run( {} );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary">Create Team Lobby</h2>
                    <button
                        onClick={ handleCancel }
                        disabled={ isCreating }
                        className="p-1 text-text-secondary hover:text-text-primary rounded disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={ handleSubmit } className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                        <Gamepad2 className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                        <div className="space-y-2 text-sm text-text-secondary">
                            <p className="mb-0">
                                One voice channel your members gather in, with a read-only panel channel beside
                                it. A host splits everyone into team rooms or groups from that panel, and one
                                press brings them all back.
                            </p>
                            <p className="mb-0">
                                It counts as one of the server&apos;s setups. Name its hosts afterwards from
                                <code className="text-text-primary"> /setup </code>
                                in Discord - until then, anyone in the lobby can run it.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <DiscordButton
                            type="button"
                            className="flex-1"
                            onClick={ handleCancel }
                            disabled={ isCreating }
                        >
                            Cancel
                        </DiscordButton>
                        <DiscordButton
                            variant="primary"
                            type="submit"
                            className="flex-1"
                            disabled={ isCreating }
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
                        </DiscordButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateLobbyForm;
