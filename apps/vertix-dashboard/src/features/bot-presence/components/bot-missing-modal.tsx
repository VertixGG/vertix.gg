import { useNavigate } from "react-router-dom";

import { useCommand } from "@zenflux/react-commander/hooks";

import { AlertTriangle, ArrowLeftRight } from "lucide-react";

interface BotMissingModalProps {
    guildName: string;
}

/**
 * The whole dashboard, closed off, because the server it is pointed at has no bot in it.
 *
 * Every page here reads or writes through the bot, so with it absent the numbers would all be zero
 * and every button would fail at Discord. The one way out is the one thing that can help - pick a
 * server the bot is actually in.
 *
 * Rendered beside the probe rather than inside it, since `useCommand` resolves against the nearest
 * commander component and the auth commands only answer from here outwards.
 */
export function BotMissingModal( { guildName }: BotMissingModalProps ) {
    const navigate = useNavigate();

    const clearSelectedGuildCommand = useCommand( "Dashboard/Auth/ClearSelectedGuild" );

    const handleChooseAnotherServer = () => {
        clearSelectedGuildCommand.run( {} );
        navigate( "/select-server" );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                    <h2 className="text-lg font-semibold text-text-primary mb-0">
                        The bot is not in this server
                    </h2>
                </div>

                <div className="p-4">
                    <p className="text-sm text-text-secondary mb-3">
                        Discord does not list VoiceChannels as a member of{ " " }
                        <span className="text-text-primary font-medium">{ guildName }</span>, so
                        there is nothing here for it to report on and nothing it could change on
                        your behalf.
                    </p>
                    <p className="text-sm text-text-muted mb-0">
                        Add the bot to that server from Discord, or carry on with a server it is
                        already in.
                    </p>
                </div>

                <div className="flex justify-end p-4 border-t border-border">
                    <button
                        onClick={ handleChooseAnotherServer }
                        className="inline-flex items-center gap-2 bg-surface-elevated hover:bg-surface-hover
                            border border-border hover:border-border-accent text-text-accent text-sm
                            rounded-md px-4 py-2 transition-colors"
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                        Choose another server
                    </button>
                </div>
            </div>
        </div>
    );
}
