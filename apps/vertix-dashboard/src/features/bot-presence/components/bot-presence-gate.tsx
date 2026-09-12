import { useNavigate } from "react-router-dom";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { AlertTriangle, ArrowLeftRight } from "lucide-react";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import { BotPresenceQuery } from "@vertix.gg/dashboard/src/features/bot-presence/query/bot-presence-query";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { SelectedGuild } from "@vertix.gg/dashboard/src/features/auth/types";
import type { GuildBotPresence } from "@vertix.gg/dashboard/src/features/bot-presence/types";

interface BotPresenceDisplayProps {
    guildId: string;
}

interface BotPresenceDisplayState {
    botPresence: GuildBotPresence | null;
}

interface BotPresenceSelectedState {
    botPresence: BotPresenceDisplayState[ "botPresence" ];
}

interface AuthSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

const BOT_PRESENCE_INITIAL_STATE: BotPresenceDisplayState = {
    botPresence: null
};

/**
 * The whole dashboard, closed off, because the server it is pointed at has no bot in it.
 *
 * Every page here reads or writes through the bot, so with it absent the numbers would all be zero
 * and every button would fail at Discord. The one way out is the one thing that can help - pick a
 * server the bot is actually in.
 */
function BotMissingModal() {
    const navigate = useNavigate();

    const clearSelectedGuildCommand = useCommand( "Dashboard/Auth/ClearSelectedGuild" );

    const [ authState ] = useCommandState<AuthState, AuthSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): AuthSelectedState => ( {
            selectedGuild: state.selectedGuild
        } )
    );

    const handleChooseAnotherServer = () => {
        clearSelectedGuildCommand.run( {} );
        navigate( "/select-server" );
    };

    const guildName = authState.selectedGuild?.name;

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
                        <span className="text-text-primary font-medium">
                            { guildName ?? "this server" }
                        </span>, so there is nothing here for it to report on and nothing it could
                        change on your behalf.
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

const BotPresenceDisplayComponent: DCommandFunctionComponent<BotPresenceDisplayProps, BotPresenceDisplayState> = () => {
    const [ state ] = useCommandState<BotPresenceDisplayState, BotPresenceSelectedState>(
        "Dashboard/BotPresence",
        ( state: BotPresenceDisplayState ): BotPresenceSelectedState => ( {
            botPresence: state.botPresence
        } )
    );

    // Only an answer of "no" closes the dashboard. Null is Discord never having answered, and a
    // question that could not be put is no reason to lock somebody out of their own server.
    if ( false !== state.botPresence?.isBotInGuild ) {
        return null;
    }

    return <BotMissingModal />;
};

const BotPresenceDisplay = withCommands<BotPresenceDisplayProps, BotPresenceDisplayState>(
    "Dashboard/BotPresence",
    BotPresenceDisplayComponent,
    BOT_PRESENCE_INITIAL_STATE,
    []
);

interface BotPresenceGateProps {
    selectedGuild: SelectedGuild | null;
}

/**
 * Asks whether the bot is in the selected server, and shuts the dashboard if it is not.
 *
 * Sits in the layout rather than on a page, since every page under it is equally useless against a
 * server the bot cannot see.
 */
export function BotPresenceGate( { selectedGuild }: BotPresenceGateProps ) {
    // The interface editor runs against a sentinel id that is not a Discord guild at all, so there
    // is nobody to ask about it and nothing to shut.
    if ( ! selectedGuild || DEFAULT_CUSTOMIZATION_GUILD_ID === selectedGuild.id ) {
        return null;
    }

    return (
        <QueryComponent<GuildBotPresence, BotPresenceDisplayProps, GuildBotPresence, BotPresenceDisplayState>
            module={ BotPresenceQuery }
            component={ BotPresenceDisplay }
            props={ { guildId: selectedGuild.id } }
        />
    );
}
