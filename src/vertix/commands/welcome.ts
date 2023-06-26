import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
} from "discord.js";

import { ICommand } from "@vertix/interfaces/command";
import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix/definitions/master-channel";

const name = "welcome";

export const Welcome: ICommand = {
    name,

    description: "Displaying Vertix welcome message in ephemeral mode.",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ DEFAULT_SETUP_PERMISSIONS ],

    run: async ( client: Client, interaction: CommandInteraction<"cached"> ) => {
        UIAdapterManager.$.get( "Vertix/UI-V2/WelcomeAdapter" )?.ephemeral( interaction );
    }
};
