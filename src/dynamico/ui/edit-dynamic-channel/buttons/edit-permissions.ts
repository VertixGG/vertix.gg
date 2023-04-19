import { ButtonStyle, ChannelType, Interaction, VoiceChannel } from "discord.js";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { guiManager } from "@dynamico/managers";

import Logger from "@internal/modules/logger";

export default class EditPermissions extends UIElement {
    protected static dedicatedLogger = new Logger( this );

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

            // Set permissions for @everyone to '/'.
            await dynamicChannel.permissionOverwrites.edit( interaction.guildId, {
                ViewChannel: null,
                Connect: null,
            } );

            EditPermissions.dedicatedLogger.admin( this.makeChannelPrivate,
                `🌐 Dynamic Channel has been set to public - "${ interaction.channel.name }" (${ interaction.guild?.name })`
            );

            await guiManager.get( "Dynamico/UI/EditUsersPermissions/EditUsersChannelPublicEmbed" )
                .sendContinues( interaction, {} );
        }
    }

    private async makeChannelPrivate( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.guildId && interaction.isButton() ) {
            const dynamicChannel = interaction.channel as VoiceChannel;

            await dynamicChannel.permissionOverwrites.edit( interaction.guildId, {
                ViewChannel: null,
                Connect: false,
            } );

            EditPermissions.dedicatedLogger.admin( this.makeChannelPrivate,
                `🚫 Dynamic Channel has been set to private - "${ interaction.channel.name }" (${ interaction.guild?.name })`
            );

            await guiManager.get( "Dynamico/UI/EditUserPermissions" ).sendContinues( interaction, {
                title: uiUtilsWrapAsTemplate( "private" ),
            } );
        }
    }

    private async displayManageUsers( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.isButton() ) {
            EditPermissions.dedicatedLogger.admin( this.displayManageUsers,
                `👥 Manage Users button has been clicked - "${ interaction.channel.name }" (${ interaction.guild?.name })`
            );

            await guiManager.get( "Dynamico/UI/EditUserPermissions" ).sendContinues( interaction, {
                title: uiUtilsWrapAsTemplate( "mange" ),
            } );
        }
    }
}
