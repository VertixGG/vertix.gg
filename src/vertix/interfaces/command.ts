import { ChatInputApplicationCommandData, Client, CommandInteraction } from "discord.js";

export interface ICommand extends ChatInputApplicationCommandData {
    run: ( client: Client, interaction: CommandInteraction<"cached"> ) => void;
}
