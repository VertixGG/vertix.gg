import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import { BotPresenceQuery } from "@vertix.gg/dashboard/src/features/bot-presence/query/bot-presence-query";
import { BotMissingModal } from "@vertix.gg/dashboard/src/features/bot-presence/components/bot-missing-modal";
import { useBotPresenceStore } from "@vertix.gg/dashboard/src/hooks/use-bot-presence";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { SelectedGuild } from "@vertix.gg/dashboard/src/features/auth/types";
import type { GuildBotPresence } from "@vertix.gg/dashboard/src/features/bot-presence/types";

interface BotPresenceProbeProps {
    guildId: string;
}

interface BotPresenceProbeState {}

interface BotPresenceGateProps {
    selectedGuild: SelectedGuild | null;
}

/**
 * Function BotPresenceProbeComponent() :: Puts the question, and draws nothing.
 *
 * The query publishes its answer to the presence store on mount; this component exists because
 * QueryComponent needs one to hang the request on.
 */
const BotPresenceProbeComponent: DCommandFunctionComponent<BotPresenceProbeProps, BotPresenceProbeState> = () => null;

const BotPresenceProbe = withCommands<BotPresenceProbeProps, BotPresenceProbeState>(
    "Dashboard/BotPresence",
    BotPresenceProbeComponent,
    {},
    []
);

/**
 * Asks whether the bot is in the selected server, and shuts the dashboard if it is not.
 *
 * Sits in the layout rather than on a page, since every page under it is equally useless against a
 * server the bot cannot see.
 */
export function BotPresenceGate( { selectedGuild }: BotPresenceGateProps ) {
    const presence = useBotPresenceStore( ( state ) => state.presence );

    // The interface editor runs against a sentinel id that is not a Discord guild at all, so there
    // is nobody to ask about it and nothing to shut.
    if ( ! selectedGuild || DEFAULT_CUSTOMIZATION_GUILD_ID === selectedGuild.id ) {
        return null;
    }

    // Only an answer about this server, and only an answer of "no", closes the dashboard. An answer
    // left over from the server before says nothing about this one, and null is Discord never
    // having answered - no reason to lock somebody out of their own server.
    const isBotMissing = presence?.guildId === selectedGuild.id && false === presence.isBotInGuild;

    return (
        <>
            <QueryComponent<GuildBotPresence, BotPresenceProbeProps, GuildBotPresence, BotPresenceProbeState>
                module={ BotPresenceQuery }
                component={ BotPresenceProbe }
                props={ { guildId: selectedGuild.id } }
            />

            { isBotMissing && <BotMissingModal guildName={ selectedGuild.name } /> }
        </>
    );
}
