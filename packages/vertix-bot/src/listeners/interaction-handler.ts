import { Events, MessageComponentInteraction, ModalSubmitInteraction, } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { Commands } from "@vertix.gg/bot/src/commands";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import type { Client, CommandInteraction, Interaction } from "discord.js";

import type { UIAdapterService } from "@vertix.gg/bot/src/ui-v2/ui-adapter-service";
import type { UIService } from "@vertix.gg/bot/src/ui-v2/ui-service";

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
        if (
            ( interaction instanceof MessageComponentInteraction ) ||
            ( interaction instanceof ModalSubmitInteraction )
        ) {
            const uiService = ServiceLocator.$.get<UIService>( "VertixBot/UI-V2/UIService" );

            const realCustomId = uiService.getCustomIdFromHash( interaction.customId );

            GlobalLogger.$.log( interactionHandler,
                `Interaction id: '${ interaction.id }' - ${ interaction.constructor.name } id: '${ realCustomId }' was used by '${ interaction.user.username }'`
            );

            const adapter = ServiceLocator.$.get<UIAdapterService>( "VertixBot/UI-V2/UIAdapterService" )
                .get( realCustomId, true );

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
