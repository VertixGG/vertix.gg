// import {
//     ApplicationCommandType,
//     Client,
//     CommandInteraction, PermissionsBitField,
//     VoiceChannel,
// } from "discord.js";
//
// import { ICommand } from "@vertix/interfaces/command";
// import { UIManager } from "@vertix/ui-v2/ui-manager";
//
// const name = "welcome";
//
// export const Welcome: ICommand = {
//     name,
//
//     description: "Welcome message",
//     type: ApplicationCommandType.ChatInput,
//
//     defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],
//
//     run: async ( client: Client, interaction: CommandInteraction<"cached"> ) => {
//         await UIManager.$.get( "Vertix/UI-V2/WelcomeAdapter" )?.send( interaction.channel as VoiceChannel );
//     }
// };
