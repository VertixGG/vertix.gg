import {
    ApplicationCommandType,
    Client,
    CommandInteraction,
    PermissionsBitField,
} from "discord.js";

import { guiManager } from "../managers/gui";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@dynamico/constants/master-channel";

import { commandsLogger } from "@dynamico/commands/index";

import { ICommand } from "@dynamico/interfaces/command";

import { MasterChannelManager } from "@dynamico/managers/master-channel";

import ChannelModel from "@dynamico/models/channel";

const name = "setup";

export const Setup: ICommand = {
    name,

    description: "Setting up Dynamico",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction ) => {
        const guildId = interaction.guildId;

        if ( ! guildId || ! interaction.guild ) {
            commandsLogger.error( name,
                `GuildId or guild is not defined. GuildId: ${ guildId }, guild: ${ interaction.guild }` );

            return await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendFollowUp( interaction, {
                    globalResponse: "%{somethingWentWrong}%"
                } );
        }

        if ( guildId && await ChannelModel.getInstance().isReachedMasterLimit( guildId ) ) {
            commandsLogger.debug( name, `GuildId: ${ guildId } has reached master limit.` );

            return await guiManager.get( "Dynamico/UI/NotifyMaxMasterChannels" )
                .sendFollowUp( interaction, { maxFreeMasterChannels: DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } );
        }

        const result = await MasterChannelManager.getInstance()
            .createDefaultMasters( interaction.guild, interaction.user.id );

        if ( ! result ) {
            commandsLogger.error( name,
                `GuildId: ${ guildId } has not been set up, master channel creation failed`
            );

            return await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendFollowUp( interaction, {
                    globalResponse: "%{somethingWentWrong}%"
                } );
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
