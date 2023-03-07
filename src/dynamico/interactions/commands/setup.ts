import {
    ApplicationCommandType,
    ButtonStyle,
    Client,
    Colors,
    CommandInteraction,
    EmbedBuilder,
    PermissionsBitField,
} from "discord.js";

import { ICommand } from "@dynamico/interfaces/command";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@dynamico/constants/master-channel";

import ChannelModel from "@dynamico/models/channel";

import MasterChannelManager from "@dynamico/managers/master-channel";

const masterChannelManager = MasterChannelManager.getInstance();

export const Setup: ICommand = {
    name: "setup",
    description: "Setting up Dynamico",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction ) => {
        const embed = new EmbedBuilder(),
            guildId = interaction.guildId;

        if ( guildId && await ChannelModel.getInstance().isReachedMasterLimit( guildId ) ) {
            embed
                .setTitle( "You have reached your Master Channels limit" )
                .setDescription( `You can create up to ${ DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } Master Channels in total.` )
                .setColor( Colors.Red );
        } else if ( interaction.guild ){
            const { masterCategory, masterCreateChannel }
                = await masterChannelManager.createDefaultMasters( interaction.guild, interaction.user.id );

            let description = `**Category**: ${ masterCategory.name }\n`;

            description += `**Create Channel**: <#${ masterCreateChannel.id }>\n`;

            embed
                .setTitle( "Dynamico has been set up successfully !" )
                .setDescription( description )
                .setColor( Colors.Blue );
        } else {
            embed
                .setTitle( "Something went wrong" )
                .setDescription( "Please try again later." )
                .setColor( Colors.Red );
        }

        await interaction.followUp( {
            ephemeral: true,
            embeds: [ embed ],
        } );
    }
};
