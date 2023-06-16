import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { ICommand } from "@vertix/interfaces/command";
import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";

const name = "welcome";

export const Welcome: ICommand = {
    name,

    description: "Displaying Vertix welcome message in ephemeral mode.",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction<"cached"> ) => {
        UIAdapterManager.$.get( "Vertix/UI-V2/WelcomeAdapter" )?.ephemeral( interaction );
    }
};
