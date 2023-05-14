import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { GUIManager } from "@dynamico/managers/gui";
import { ChannelManager } from "@dynamico/managers/channel";

import { ICommand } from "@dynamico/interfaces/command";
import { guildGetBadwordsFormatted } from "@dynamico/utils/badwords";

const name = "config";

export const Config: ICommand = {
    name,

    description: "Configure Dynamico",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction ) => {
        const guildId = interaction.guildId as string;

        await GUIManager.$.get( "Dynamico/UI/ConfigComponent" )
            .sendContinues( interaction, {
                badwords: await guildGetBadwordsFormatted( guildId ),
                masterChannels: await ChannelManager.$.getMasterCreateChannels( guildId, true )
            } );
    }
};
