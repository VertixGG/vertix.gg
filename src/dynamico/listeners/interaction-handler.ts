import * as process from "process";

import {
    ButtonInteraction,
    Client,
    CommandInteraction,
    Events,
    Interaction,
    ModalSubmitInteraction, SelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import { Commands } from "../interactions/commands";

import GUIManager from "../managers/gui";

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
        if ( interaction.isCommand() || interaction.isContextMenuCommand() ) {
            await handleSlashCommand( client, interaction as CommandInteraction );
        } else if ( interaction.isButton() ) {
            await handleButton( client, interaction as ButtonInteraction );
        } else if ( interaction.isModalSubmit() ) {
            await handleModalSubmit( client, interaction );
        } else if ( interaction.isUserSelectMenu() || interaction.isSelectMenu() ) {
            await handleUserSelectMenuInteraction( client, interaction as UserSelectMenuInteraction );
        } else if ( process.env.debug_mode === "discord" ) {
            console.log( interaction );
        }
    } );
};

const handleSlashCommand = async ( client: Client, interaction: CommandInteraction ): Promise<void> => {
    console.log( `Slash command '${ interaction.commandName }' was used by '${ interaction.user.username }'` );

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

async function handleButton( client: Client, interaction: ButtonInteraction ) {
    console.log( `Button id '${ interaction.customId }' was used by '${ interaction.user.username }'` );

   GUIManager.getInstance().getCallback( interaction.customId )( interaction );
};

async function handleModalSubmit( client: Client, interaction: ModalSubmitInteraction ) {
    console.log( `Modal submit id '${ interaction.customId }' was used by '${ interaction.user.username }'` );

   GUIManager.getInstance().getCallback( interaction.customId )( interaction );
}

async function handleUserSelectMenuInteraction( client: Client, interaction: UserSelectMenuInteraction|SelectMenuInteraction ) {
    console.log( `UserSelectMenuInteraction|SelectMenuInteraction id '${ interaction.customId }' was used by '${ interaction.user.username }'` );

   GUIManager.getInstance().getCallback( interaction.customId )( interaction );
}
