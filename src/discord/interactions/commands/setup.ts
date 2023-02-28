import {
    ApplicationCommandType,
    Client,
    Colors,
    CommandInteraction,
    EmbedBuilder,
    PermissionsBitField,
} from "discord.js";

import { ButtonStyle } from "discord.js/typings";

import { ICommand } from "@internal/discord/interfaces/command";

import MasterChannelManager, {
    DEFAULT_MAXIMUM_FREE_SUBSCRIPTION_MASTER_CHANNELS
} from "@internal/discord/managers/master-channel-manager";

const masterChannelManager = MasterChannelManager.getInstance();

export const Setup: ICommand = {
    name: "setup",
    description: "Setting up Dynamico",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ PermissionsBitField.Flags.Administrator ],

    run: async ( client: Client, interaction: CommandInteraction ) => {
        const embed = new EmbedBuilder(),
            guildId = interaction.guildId;

        if ( guildId && await masterChannelManager.isReachedMasterChannelLimit( guildId ) ) {
            embed
                .setTitle( "You have reached your Master Channels limit" )
                .setDescription( `You can create up to ${ DEFAULT_MAXIMUM_FREE_SUBSCRIPTION_MASTER_CHANNELS } Master Channels in total.` )
                .setColor( Colors.Red );
        } else if ( interaction.guild ){
            const result = await masterChannelManager.create( { guild: interaction.guild } );

            embed
                .setTitle( "Dynamico has been set up successfully !" )
                .setDescription( `**Category**: ${ result.parent?.name }\n**Master Channel**: <#${ result.id }>` )
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
