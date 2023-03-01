import { CommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";

export interface ICommand extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}
