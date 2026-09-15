import { Events, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

import { GuildModel } from "@vertix.gg/data/src/models/guild-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { Commands } from "@vertix.gg/bot/src/commands";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { guildLeaveBecauseNotInDatabase } from "@vertix.gg/bot/src/utils/guild";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

import type { Client, CommandInteraction, Interaction } from "discord.js";

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async( interaction: Interaction ) => {
        if ( interaction.guildId ) {
            void GuildModel.$.updateLastActive( interaction.guildId ).then( ( updated ) => {
                if ( !updated ) {
                    void guildLeaveBecauseNotInDatabase( interaction.guildId! );
                }
            } );
        }

        if ( interaction instanceof MessageComponentInteraction || interaction instanceof ModalSubmitInteraction ) {
            const customId = ServiceLocator.$.get<UIHashService>( "VertixGUI/UIHashService" ).getIdSilent(
                interaction.customId
            );

            const adapter = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ).get( customId, true );

            GlobalLogger.$.log(
                interactionHandler,
                `Interaction id: '${ interaction.id }' - ${ interaction.constructor.name } id: '${ customId }' was used by '${ interaction.user.username }'`
            );

            if ( adapter ) {
                // An adapter throwing here surfaces as an 'error' event on the client, which takes
                // the whole bot down with it.
                await adapter.run( interaction ).catch( ( error: unknown ) => {
                    // Spelled into the message rather than left as a parameter alone: the shipped
                    // line carries only the message, so an error kept beside it is one nobody
                    // reading the logs can see.
                    const reason = error instanceof Error
                        ? `${ error.name }: ${ error.message }\n${ error.stack ?? "" }`
                        : String( error );

                    GlobalLogger.$.error(
                        interactionHandler,
                        `Adapter '${ customId }' failed to handle interaction '${ interaction.id }' - ${ reason }`,
                        error
                    );
                } );

                return;
            }
        }

        if ( interaction.isCommand() || interaction.isContextMenuCommand() ) {
            await handleSlashCommand( client, interaction as CommandInteraction<"cached"> );
            return;
        }

        GlobalLogger.$.debug( interactionHandler, "", interaction );
    } );
}

const handleSlashCommand = async( client: Client, interaction: CommandInteraction<"cached"> ): Promise<void> => {
    GlobalLogger.$.log(
        handleSlashCommand,
        `Guild id: '${ interaction.guildId }' - Slash command: '${ interaction.commandName }' were used by '${ interaction.user.username }'`
    );

    const slashCommand = Commands.find( ( c ) => c.name === interaction.commandName );

    if ( !slashCommand ) {
        GlobalLogger.$.error(
            handleSlashCommand,
            `Guild id: '${ interaction.guildId }' - No such command: '${ interaction.commandName }'`
        );

        await answerFailedCommand( interaction );

        return;
    }

    // Awaited, and caught. A command reads the database, fetches channels and runs an interface's
    // own handler, and any of that can throw - unawaited it became an unhandled rejection, and
    // whoever ran the command was left with discord's "the application did not respond", which
    // says the bot is broken rather than that this one thing went wrong.
    try {
        await slashCommand.run( client, interaction );
    } catch( error ) {
        GlobalLogger.$.error(
            handleSlashCommand,
            `Guild id: '${ interaction.guildId }' - Command '${ interaction.commandName }' failed`,
            error
        );

        await answerFailedCommand( interaction );
    }
};

/**
 * Function answerFailedCommand() :: Says the command is over, whatever happened to it.
 *
 * Answered the way it would have been if it had worked, unless something already answered - a
 * command that got as far as replying and then threw has said its piece, and discord refuses a
 * second reply anyway.
 *
 * Its own try/catch because this is the last thing standing between a thrown error and silence; if
 * the interface cannot be reached either, the log is what is left and it is already written.
 */
const answerFailedCommand = async( interaction: CommandInteraction<"cached"> ): Promise<void> => {
    if ( interaction.replied || interaction.deferred ) {
        return;
    }

    try {
        await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/CommandFailedAdapter" )
            ?.ephemeral( interaction );
    } catch( error ) {
        GlobalLogger.$.error( answerFailedCommand, "", error );
    }
};
