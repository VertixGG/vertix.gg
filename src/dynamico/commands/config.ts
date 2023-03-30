import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { channelManager, guiManager } from "@dynamico/managers";

import { ICommand } from "@dynamico/interfaces/command";
import { guildGetBadwordsFormatted } from "@dynamico/utils/guild";

const name = "config";

export const Config: ICommand = {
    name,

    description: "Configure up Dynamico",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction ) => {
        const guildId = interaction.guildId as string;

        await guiManager.get( "Dynamico/UI/Configure" )
            .sendContinues( interaction, {
                badwords: await guildGetBadwordsFormatted( guildId ),
                masterChannels: await channelManager.getMasterCreateChannels( guildId, true )
            } );
    }
};
