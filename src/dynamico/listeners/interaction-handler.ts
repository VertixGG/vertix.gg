import * as process from "process";

import {
    ButtonInteraction,
    Client,
    CommandInteraction,
    Events,
    Interaction,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import { Commands } from "../commands";

import GlobalLogger from "@dynamico/global-logger";

import authMiddleware from "@dynamico/middlewares/auth";

import permissionsMiddleware from "@dynamico/middlewares/permissions";

import { UIInteractionTypes } from "@dynamico/interfaces/ui";

import { guiManager, } from "@dynamico/managers";

const globalLogger = GlobalLogger.getInstance();

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
        if ( interaction.isCommand() || interaction.isContextMenuCommand() ) {
            await handleSlashCommand( client, interaction as CommandInteraction );
        } else if ( interaction.isButton() ) {
            await handleButton( client, interaction as ButtonInteraction );
        } else if ( interaction.isModalSubmit() ) {
            await handleModalSubmit( client, interaction );
        } else if ( interaction.isUserSelectMenu() || interaction.isStringSelectMenu() ) {
            await handleUserSelectMenuInteraction( client, interaction as UserSelectMenuInteraction );
        } else if ( process.env.debug_mode === "discord" ) {
            globalLogger.log( interactionHandler, "", interaction );
        }
    } );
};

const handleSlashCommand = async ( client: Client, interaction: CommandInteraction ): Promise<void> => {
    globalLogger.log( handleSlashCommand, `Slash command '${ interaction.commandName }' was used by '${ interaction.user.username }'` );

    if ( ! await permissionsMiddleware( interaction ) ) {
        return;
    }

    const slashCommand = Commands.find( c => c.name === interaction.commandName );

    if ( ! slashCommand ) {
        await interaction.followUp( { content: "An error has occurred" } );
        return;
    }

    await interaction.deferReply( {
        ephemeral: true,
    } );

    slashCommand.run( client, interaction );
};

const getCallback = async ( interaction: UIInteractionTypes ) => {
    const result = await guiManager.getCallback( interaction.customId, [
        authMiddleware,
        permissionsMiddleware,
    ] );

    result( interaction );
};

async function handleButton( client: Client, interaction: ButtonInteraction ) {
    globalLogger.info( handleButton,
        `Button id '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await getCallback( interaction );
};

async function handleModalSubmit( client: Client, interaction: ModalSubmitInteraction ) {
    globalLogger.log( handleModalSubmit,
        `Modal submit id '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await getCallback( interaction );
}

async function handleUserSelectMenuInteraction( client: Client, interaction: UserSelectMenuInteraction | SelectMenuInteraction ) {
    globalLogger.log( handleUserSelectMenuInteraction,
        `UserSelectMenuInteraction|SelectMenuInteraction id '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await getCallback( interaction );
}
