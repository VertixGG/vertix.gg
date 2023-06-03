import {
    Client,
    CommandInteraction,
    Events,
    Interaction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
} from "discord.js";

import { Commands } from "../commands";

import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";

import { GlobalLogger } from "@vertix/global-logger";

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
        if (
            ( interaction instanceof MessageComponentInteraction ) ||
            ( interaction instanceof ModalSubmitInteraction )
        ) {
            GlobalLogger.$.log( interactionHandler,
                `Interaction id: '${ interaction.id }' - ${ interaction.constructor.name } id: '${ interaction.customId }' was used by '${ interaction.user.username }'`
            );

            const adapter = UIAdapterManager.$.get( interaction.customId, true );

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
};

const handleSlashCommand = async ( client: Client, interaction: CommandInteraction<"cached"> ): Promise<void> => {
    GlobalLogger.$.log( handleSlashCommand,
        `Guild id: '${ interaction.guildId }' - Slash command: '${ interaction.commandName }' were used by '${ interaction.user.username }'`
    );

    const slashCommand = Commands.find( c => c.name === interaction.commandName );

    if ( ! slashCommand ) {
        await interaction.followUp( { content: "An error has occurred" } );
        return;
    }

    slashCommand.run( client, interaction );
};
