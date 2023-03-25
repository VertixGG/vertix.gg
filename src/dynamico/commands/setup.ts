import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { guiManager, masterChannelManager } from "@dynamico/managers";

import { commandsLogger } from "@dynamico/commands/index";

import { ICommand } from "@dynamico/interfaces/command";
import {  guildGetBadwordsJoined } from "@dynamico/utils/guild";

const name = "setup";

export const Setup: ICommand = {
    name,

    description: "Setting up Dynamico",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction ) => {
        const guildId = interaction.guildId as string;

        if ( ! await masterChannelManager.checkLimit( interaction, guildId ) ) {
            return commandsLogger.warn( name,
                `GuildId: ${ guildId } has not been set up, master channel creation failed`
            );
        }

        // Create interaction defer.
        // TODO: Wizard can only work with sendContinues.
        await guiManager.get( "Dynamico/UI/SetupProcess" )
            .sendContinues( interaction, {
                step: "initial",
                badwords: await guildGetBadwordsJoined( guildId ), // Remove all other calls to DB.
            } );
    }
};
