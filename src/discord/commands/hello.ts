import { ApplicationCommandType, Client, CommandInteraction } from "discord.js";
import { ICommand } from "../interfaces/command";

export const Hello: ICommand = {
    name: "hello",
    description: "Returns a greeting",
    type: ApplicationCommandType.ChatInput,
    run: async ( client: Client, interaction: CommandInteraction ) => {
        const content = "Hello there!";

        await interaction.followUp( {
            ephemeral: true,
            content
        } );
    }
};
