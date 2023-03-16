import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { guiManager } from "@dynamico/managers";

import { commandsLogger } from "@dynamico/commands/index";

import { ICommand } from "@dynamico/interfaces/command";

import { MasterChannelManager } from "@dynamico/managers/master-channel";

const name = "setup";

export const Setup: ICommand = {
    name,

    description: "Setting up Dynamico",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction ) => {
        const guildId = interaction.guildId as string;

        const masterChannelManager = MasterChannelManager.getInstance(),
            result = await masterChannelManager.checkLimit( interaction, guildId ) &&
                await masterChannelManager.createDefaultMasters( interaction, interaction.user.id );

        if ( ! result ) {
            return commandsLogger.warn( name,
                `GuildId: ${ guildId } has not been set up, master channel creation failed`
            );
        }

        const { masterCategory, masterCreateChannel } = result;

        if ( ! masterCreateChannel ) {
            commandsLogger.error( name,
                `GuildId: ${ guildId } has not been set up, master channel creation failed`
            );

            return await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendFollowUp( interaction, {
                    globalResponse: "%{somethingWentWrong}%"
                } );
        }

        commandsLogger.info( name, `GuildId: ${ guildId } has been set up successfully` );

        await guiManager.get( "Dynamico/UI/NotifySetupSuccess" )
            .sendFollowUp( interaction, {
                masterCategoryName: masterCategory.name,
                masterChannelId: masterCreateChannel.id,
            } );
    }
};
