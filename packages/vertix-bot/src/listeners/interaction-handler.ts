import { Events, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { Commands } from "@vertix.gg/bot/src/commands";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

import type { Client, CommandInteraction, Interaction } from "discord.js";

export function interactionHandler ( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
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
                await adapter.run( interaction );

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

const handleSlashCommand = async ( client: Client, interaction: CommandInteraction<"cached"> ): Promise<void> => {
    GlobalLogger.$.log(
        handleSlashCommand,
        `Guild id: '${ interaction.guildId }' - Slash command: '${ interaction.commandName }' were used by '${ interaction.user.username }'`
    );

    const slashCommand = Commands.find( ( c ) => c.name === interaction.commandName );

    if ( !slashCommand ) {
        await interaction.followUp( { content: "An error has occurred" } );
        return;
    }

    slashCommand.run( client, interaction );
};
