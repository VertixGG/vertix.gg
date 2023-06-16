import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { ICommand } from "@vertix/interfaces/command";
import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";

const name = "help";

export const Help: ICommand = {
    name,

    description: "Displaying Vertix help interface in ephemeral mode.",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction<"cached"> ) => {
        UIAdapterManager.$.get( "Vertix/UI-V2/FeedbackAdapter" )?.ephemeral( interaction );
    }
};
