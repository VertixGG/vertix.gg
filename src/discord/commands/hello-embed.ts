import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder, Colors,
} from "discord.js";

import { ButtonStyle } from "discord-api-types/v10";

import { ICommand } from "../interfaces/command";

export const HelloEmbed: ICommand = {
    name: "hello-embed",
    description: "Ephemeral embed response",
    type: ApplicationCommandType.ChatInput,
    run: async ( client: Client, interaction: CommandInteraction ) => {
        const embed = new EmbedBuilder(),
            button = new ButtonBuilder(),
            actionButtonsRow = new ActionRowBuilder<ButtonBuilder>();

        embed
            .setTitle( "Hello there!" )
            .setDescription( "Press the button to say hello !" )
            .setColor( Colors.Blue );

        button.setLabel( "Hello button" );
        button.setStyle( ButtonStyle.Primary ); // Required.
        button.setCustomId( "Hello" ); // Required.

        actionButtonsRow.addComponents( button );

        await interaction.followUp( {
            ephemeral: true,
            embeds: [ embed ],
            components: [ actionButtonsRow ],
        } );
    }
};
