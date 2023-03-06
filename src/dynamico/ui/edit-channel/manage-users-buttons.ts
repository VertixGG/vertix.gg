import UIBase from "@dynamico/ui/base/ui-base";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import { ButtonStyle, ChannelType, Interaction, UserSelectMenuInteraction, VoiceChannel } from "discord.js";
import GUIManager from "@dynamico/managers/gui";

export default class ManageUsersButtons extends UIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/ManageUsersButtons";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getBuilders( interaction: Interaction ) {
        const publicButton = this.getButtonBuilder( this.publicChannel.bind( this ) ),
            privateButton = this.getButtonBuilder( this.privateChannel.bind( this ) ),
            usersButton = this.getButtonBuilder( this.manageUsers.bind( this ) ),
            specialButton = this.getButtonBuilder( async () => {
            } );

        publicButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "🌐" )
            .setLabel( "Public" );

        privateButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "🚫" )
            .setLabel( "Private" );

        usersButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "👥" )
            .setLabel( "Manage Users" );

        specialButton
            .setStyle( ButtonStyle.Primary )
            .setEmoji( "🌟" )
            .setLabel( "Special Channel" )
            .setDisabled( true );

        return [
            [ publicButton, privateButton, usersButton ],
            [ specialButton ]
        ];
    }

    private async publicChannel( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.guildId && interaction.isButton() ) {
            const dynamicChannel = interaction.channel as VoiceChannel;

            // Set connect permissions for @everyone to false.
            // TODO: If user set basic roles, then we apply all the changes for each basicRole, except for @everyone.
            await dynamicChannel.permissionOverwrites.create( interaction.guildId, {
                Connect: true,
            } );

            await GUIManager.getInstance().continuesMessage( interaction, "Channel is public now." );
        }
    }

    private async privateChannel( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.guildId && interaction.isButton() ) {
            const dynamicChannel = interaction.channel as VoiceChannel;

            // If user didn't set any basic roles, then we apply the changes on @everyone.
            // TODO: If user set basic roles, then we apply all the changes for each basicRole, except for @everyone.
            await dynamicChannel.permissionOverwrites.create( interaction.guildId, {
                Connect: false,
            } );

            await GUIManager.getInstance().continuesMessage( interaction, "Channel is private now." );
        }
    }

    private async manageUsers( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.isButton() ) {
            const dynamicChannel = interaction.channel as VoiceChannel;

            // @ts-ignore
            const component = GUIManager.getInstance().get( "Dynamico/UI/EditChannel/ManageUsers" );
            const message = component.getMessage( interaction );

            await GUIManager.getInstance().continuesMessage( interaction, false, [], message.components );
        }
    }
}
