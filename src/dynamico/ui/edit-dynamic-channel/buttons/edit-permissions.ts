import {
    ButtonStyle,
    ChannelType,
    Interaction,
    VoiceChannel
} from "discord.js";

import UIElement from "@dynamico/ui/base/ui-element";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

import { guiManager } from "@dynamico/managers";

export default class EditPermissions extends UIElement {
    public static getName() {
        return "Dynamico/UI/EditDynamicChannel/Buttons/EditPermissions";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected async getBuilders( interaction: Interaction ) {
        const publicButton = this.getButtonBuilder( this.makeChannelPublic.bind( this ) ),
            privateButton = this.getButtonBuilder( this.makeChannelPrivate.bind( this ) ),
            usersButton = this.getButtonBuilder( this.displayManageUsers.bind( this ) ),
            specialButton = this.getButtonBuilder( async () => {} );

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

    private async makeChannelPublic( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.guildId && interaction.isButton() ) {
            const dynamicChannel = interaction.channel as VoiceChannel;

            // Set connect permissions for @everyone to '/'.
            await dynamicChannel.permissionOverwrites.edit( interaction.guildId, {
                Connect: null,
            } );

            await guiManager.get( "Dynamico/UI/EditUsersPermissions/EditUsersChannelPublicEmbed" )
                .sendContinues( interaction, {} );
        }
    }

    private async makeChannelPrivate( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.guildId && interaction.isButton() ) {
            const dynamicChannel = interaction.channel as VoiceChannel;

            // If user didn't set any basic roles, then we apply the changes on @everyone.
            // TODO: If user set basic roles, then we apply all the changes for each basicRole, except for @everyone.
            await dynamicChannel.permissionOverwrites.edit( interaction.guildId, {
                Connect: false,
            } );

            await guiManager.get( "Dynamico/UI/EditUserPermissions" ).sendContinues( interaction, {
                title: uiUtilsWrapAsTemplate( "private" ),
            } );
        }
    }

    private async displayManageUsers( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.isButton() ) {
            await guiManager.get( "Dynamico/UI/EditUserPermissions" ).sendContinues( interaction, {
                title: uiUtilsWrapAsTemplate( "mange" ),
            } );
        }
    }
}
