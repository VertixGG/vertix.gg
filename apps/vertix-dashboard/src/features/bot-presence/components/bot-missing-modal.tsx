import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useCommand } from "@zenflux/react-commander/hooks";

import { AlertTriangle, ArrowLeftRight, Plus, RefreshCw } from "lucide-react";

import { buildBotInviteUrl } from "@vertix.gg/definitions/src/discord-invite-definitions";

interface BotMissingModalProps {
    guildId: string;
    guildName: string;
}

/**
 * The whole dashboard, closed off, because the server it is pointed at has no bot in it.
 *
 * Every page here reads or writes through the bot, so with it absent the numbers would all be zero
 * and every button would fail at Discord. There are two ways out and this offers both: put the bot
 * in this server, or open one it is already in.
 *
 * Inviting used to be the one it did not offer - the text said to add the bot "from Discord" and
 * left somebody to find their way there, which is a strange thing to say to a person who is signed
 * in, has picked the server, and is looking at the button that would do it. The invite names the
 * server, so Discord opens on that one rather than on a list it was just picked from.
 *
 * Rendered beside the probe rather than inside it, since `useCommand` resolves against the nearest
 * commander component and the auth commands only answer from here outwards.
 */
export function BotMissingModal( { guildId, guildName }: BotMissingModalProps ) {
    const navigate = useNavigate();

    const clearSelectedGuildCommand = useCommand( "Dashboard/Auth/ClearSelectedGuild" );

    const [ hasOpenedInvite, setHasOpenedInvite ] = useState( false );

    const handleChooseAnotherServer = () => {
        clearSelectedGuildCommand.run( {} );
        navigate( "/select-server" );
    };

    // Discord's dialog is a page of its own, so the invite opens in a tab and this one stays where
    // it was - the dashboard is mid-session and throwing that away to come back to it is worse.
    const handleAddToServer = () => {
        window.open( buildBotInviteUrl( "recommended", guildId ), "_blank", "noopener,noreferrer" );

        setHasOpenedInvite( true );
    };

    // The answer arrives in the other tab, and nothing here is told about it. A reload is the whole
    // re-check: the gate asks again on mount, and closes itself if the bot is in by then.
    const handleCheckAgain = () => window.location.reload();

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
                        { hasOpenedInvite
                            ? "Finish adding it in the Discord tab, then check again here."
                            : "Add it to this server, or carry on with a server it is already in." }
                    </p>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t border-border">
                    <button
                        onClick={ handleChooseAnotherServer }
                        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary
                            text-sm rounded-md px-4 py-2 transition-colors"
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                        Choose another server
                    </button>

                    { hasOpenedInvite
                        ? <button
                            onClick={ handleCheckAgain }
                            className="inline-flex items-center gap-2 bg-accent-muted hover:bg-accent-hover
                                border border-accent text-text-primary text-sm rounded-md px-4 py-2
                                transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Check again
                        </button>
                        : <button
                            onClick={ handleAddToServer }
                            className="inline-flex items-center gap-2 bg-accent-muted hover:bg-accent-hover
                                border border-accent text-text-primary text-sm rounded-md px-4 py-2
                                transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add to this server
                        </button>
                    }
                </div>
            </div>
        </div>
    );
}
