import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { guiManager, masterChannelManager } from "@dynamico/managers";

import { DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME } from "@dynamico/constants/master-channel";

import { commandsLogger } from "@dynamico/commands/index";

import { guildGetBadwordsFormatted } from "@dynamico/utils/badwords";

import { ICommand } from "@dynamico/interfaces/command";

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
                `Guild id: '${ guildId }' - Master channel creation failed`
            );
        }

        await guiManager.get( "Dynamico/UI/SetupWizard" )
            .sendContinues( interaction, {
                step: "initial",
                channelNameTemplate: DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME,
                badwords: await guildGetBadwordsFormatted( guildId ),
            } );
    }
};
