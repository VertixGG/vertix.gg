import { Events, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { Commands } from "@vertix.gg/ai/src/commands";

import { AI_BUTTON_PREFIX, InteractiveMessageManager } from "@vertix.gg/ai/src/managers/interactive-message-manager";

import GlobalLogger from "@vertix.gg/ai/src/global-logger";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

import type { Client, CommandInteraction, Interaction } from "discord.js";

/**
 * Deliberately lighter than the bot's equivalent: no `updateLastActive` and no
 * leave-if-not-in-database check, because those read the bot's `Guild`
 * collection and this app is invitable where Vertix is not.
 */
export function registerInteractionHandler( client: Client ): void {
    client.on( Events.InteractionCreate, async( interaction: Interaction ) => {
        // Buttons this bot created at runtime have no registered adapter, so they
        // are resolved from storage before the adapter lookup would fail on them.
        if ( interaction.isButton() && interaction.customId.startsWith( AI_BUTTON_PREFIX ) ) {
            const response = await InteractiveMessageManager.$.resolveButton( interaction ).catch( ( error: unknown ) => {
                GlobalLogger.$.error( registerInteractionHandler, "Failed resolving an AI button", error );

                return null;
            } );

            await interaction.reply( {
                content: response ?? "That button is no longer active.",
                ephemeral: true
            } );

            return;
        }

        if ( interaction instanceof MessageComponentInteraction || interaction instanceof ModalSubmitInteraction ) {
            const customId = ServiceLocator.$.get<UIHashService>( "VertixGUI/UIHashService" ).getIdSilent(
                interaction.customId
            );

            const adapter = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ).get( customId, true );

            if ( !adapter ) {
                return;
            }

            // An adapter throwing here surfaces as an 'error' event on the client,
            // which would take the whole process down with it.
            await adapter.run( interaction ).catch( ( error: unknown ) => {
                GlobalLogger.$.error(
                    registerInteractionHandler,
                    `Adapter '${ customId }' failed to handle interaction '${ interaction.id }'`,
                    error
                );
            } );

            return;
        }

        if ( interaction.isCommand() ) {
            await handleSlashCommand( client, interaction as CommandInteraction<"cached"> );
        }
    } );
}

async function handleSlashCommand( client: Client, interaction: CommandInteraction<"cached"> ): Promise<void> {
    GlobalLogger.$.log(
        handleSlashCommand,
        `Guild id: '${ interaction.guildId }' - Slash command: '${ interaction.commandName }' was used by '${ interaction.user.username }'`
    );

    const slashCommand = Commands.find( ( command ) => command.name === interaction.commandName );

    if ( !slashCommand ) {
        await interaction.reply( { content: "Unknown command.", ephemeral: true } );

        return;
    }

    slashCommand.run( client, interaction );
}

export default registerInteractionHandler;
