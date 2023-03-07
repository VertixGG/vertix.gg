import { ButtonInteraction, ChannelType, EmbedBuilder, Interaction, PermissionsBitField } from "discord.js";

import GlobalLogger from "@dynamico/global-logger";

import guiManager from "./managers/gui";

const { Flags } = PermissionsBitField;

export async function sendManageUsersComponent( interaction: Interaction, title: string ) {
    if ( ! interaction.channel || interaction.channel.type !== ChannelType.GuildVoice ) {
        return GlobalLogger.getInstance().error( sendManageUsersComponent,
            `Interaction channel is not a voice channel. Channel type: ${interaction.channel?.type}`
        );
    }

    let description = "Allowed:\n";

    // Loop through the allowed users and add them to the description.
    for ( const user of interaction.channel.permissionOverwrites?.cache?.values() || [] ) {
        // Check if user has view channel and connect permissions.
        if ( user.allow.has( Flags.ViewChannel ) && user.allow.has( Flags.Connect ) ) {
            // Get username.

            description += `<@${user.id}>, `;
        }
    }

    // Remove the last comma.
    description = description.slice( 0, -2 );

    description += "\n\nWho should have access to your channel?";

    const embed = new EmbedBuilder()
        .setTitle( title )
        .setDescription( description );

    const message = guiManager
        .get( "Dynamico/UI/EditChannel/ManageUsers" )
        .getMessage( interaction );

    await guiManager.continuesMessage(
        interaction as ButtonInteraction,
        false,
        [ embed ],
        message.components
    );
}
