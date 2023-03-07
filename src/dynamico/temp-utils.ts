import GlobalLogger from "@dynamico/global-logger";
import { MasterChannelManager } from "@dynamico/managers";
import {
    ButtonInteraction,
    ChannelType,
    EmbedBuilder,
    Interaction,
    OverwriteType,
    PermissionsBitField
} from "discord.js";

import guiManager from "./managers/gui";

const { Flags } = PermissionsBitField;

export async function sendManageUsersComponent( interaction: Interaction, title: string ) {
    if ( ! interaction.channel || interaction.channel.type !== ChannelType.GuildVoice ) {
        return GlobalLogger.getInstance().error( sendManageUsersComponent,
            `Interaction channel is not a voice channel. Channel type: ${interaction.channel?.type}`
        );
    }

    let description = "Allowed:\n";

    const masterChannel = await MasterChannelManager.getInstance().getByDynamicChannel( interaction, true ),
        masterChannelCache = interaction.client.channels.cache.get( masterChannel.id );

    // TODO: Logic repeated in src/dynamico/ui/edit-channel/mange-users-menus.ts
    // Loop through the allowed users and add them to the description.
    for ( const role of interaction.channel.permissionOverwrites?.cache?.values() || [] ) {
        if ( role.type !== OverwriteType.Member ) {
            continue;
        }
        
        // Show only users that are not in the master channel permission overwrites.
        if ( masterChannelCache?.type === ChannelType.GuildVoice &&
            masterChannelCache.permissionOverwrites.cache.has( role.id ) ) {
            continue;
        }

        description += `<@${role.id}>, `;
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
