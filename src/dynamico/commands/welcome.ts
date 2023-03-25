import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { ICommand } from "@dynamico/interfaces/command";

import { guiManager } from "@dynamico/managers";

const name = "welcome";

export const Welcome: ICommand = {
    name,

    description: "Welcome",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction ) => {
        await guiManager.get( "Dynamico/UI/EmbedTest" ).sendUser( interaction.user, {} );
    }
};

