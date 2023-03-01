import { ButtonInteraction, Client, CommandInteraction, Events, Interaction } from "discord.js";

import { Commands } from "../interactions/commands";

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
        if ( interaction.isCommand() || interaction.isContextMenuCommand() ) {
            await handleSlashCommand( client, interaction as CommandInteraction );
        } else if ( interaction.isButton() ) {
            await handleButton( client, interaction as ButtonInteraction );
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
    await interaction.deferUpdate();

    console.log( `Button id '${ interaction.customId }' was used by '${ interaction.user.username }'` );

    switch ( interaction.customId ) {
        case "Hello": // Custom ID of the button when it was created.
            await interaction.followUp( {
                ephemeral: true,
                content: `Hello! ${ interaction.user.username }`
            } );
            break;
    }
};
