import fetch from "cross-fetch";

import {
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    Interaction,
    SelectMenuInteraction,
    VoiceChannel
} from "discord.js";
import { Routes } from "discord-api-types/v10";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { guiManager, masterChannelManager, topGGManager } from "@dynamico/managers";

import {
    DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
    DEFAULT_DATA_USER_DYNAMIC_CHANNEL_TEMPLATE,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
} from "@dynamico/constants/master-channel";

import { gToken } from "@dynamico/login";

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
            resetButton = this.getButtonBuilder( this.resetChannel.bind( this ) ),
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

        resetButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "🔄" )
            .setLabel( "Reset Channel" );

        specialButton
            .setStyle( ButtonStyle.Primary )
            .setEmoji( "🌟" )
            .setLabel( "Special Channel" )
            .setDisabled( true );

        return [
            [ publicButton, privateButton, usersButton ],
            [ resetButton, specialButton ]
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

    private async resetChannel( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.isButton() ) {
            // Check if user voted.
            EditPermissions.dedicatedLogger.admin( this.displayManageUsers,
                `🔄 Reset Channel button has been clicked - "${ interaction.channel.name }" (${ interaction.guild?.name })`
            );

            if ( ! await topGGManager.isVoted( interaction.user.id ) ) {
                // Tell the user to vote.
                const embed = new EmbedBuilder(),
                    voteUrl = topGGManager.getVoteUrl();

                embed.setTitle( "👑 Vote for us to unlock this feature!" );
                embed.setDescription( `This is a premium feature, but you can unlock it for free! [**Vote for us on top.gg!**](${ voteUrl })` );

                await guiManager.sendContinuesMessage( interaction, {
                    embeds: [ embed ]
                } );

                return;
            }

            const getCurrent = ( interaction: any ) => {
                    return {
                        name: interaction.channel.name,
                        userLimit: interaction.channel.userLimit === 0 ? "Unlimited" : interaction.channel.userLimit,
                        state: masterChannelManager.isPrivate( interaction.channel ) ? "🚫 Private" : "🌐 Public",
                    };
                },
                previousData = getCurrent( interaction ),
                previousAllowedUsers = await masterChannelManager.getAllowedUserIds( interaction );

            let isBeingRateLimited = false;

            // Rename channel to default.
            const result = await fetch( "https://discord.com/api/v10/" + Routes.channel( interaction.channel.id ), {
                method: "PATCH",
                headers: {
                    "Authorization": `Bot ${ gToken }`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify( {
                    name: DEFAULT_DATA_DYNAMIC_CHANNEL_NAME.replace(
                        DEFAULT_DATA_USER_DYNAMIC_CHANNEL_TEMPLATE,
                        interaction.channel.members.get( interaction.user.id )?.displayName || "Unknown"
                    ),
                } )
            } )
                .then( ( response ) => response.json() )
                .catch( ( error ) => EditPermissions.dedicatedLogger.error( this.resetChannel, error ) );

            if ( result.retry_after ) {
                isBeingRateLimited = true;
            }

            // Find master channel.
            const masterChannel = await masterChannelManager.getByDynamicChannel( interaction );

            if ( ! masterChannel ) {
                return;
            }

            // Take defaults from master channel.
            const inheritedProperties = masterChannelManager.getDefaultInheritedProperties( masterChannel ),
                inheritedPermissions = masterChannelManager.getDefaultInheritedPermissions( masterChannel ),
                permissionOverwrites = [
                    ... inheritedPermissions,
                    {
                        id: interaction.user.id,
                        ... DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
                    }
                ];

            // Edit channel.
            await interaction.channel.edit( {
                ... inheritedProperties,
                permissionOverwrites,
            } );

            EditPermissions.dedicatedLogger.admin( this.resetChannel,
                `🔄 Dynamic Channel has been reset - "${ interaction.channel.name }" (${ interaction.guild?.name })`
            );

            const currentData = getCurrent( interaction ),
                currentAllowedUsers = await masterChannelManager.getAllowedUserIds( interaction );

            let description = "Settings has been reset to default:\n\n" +
                `Name: **${ currentData.name }**` + ( currentData.name === previousData.name ? " (Unchanged)" : "" ) + "\n" +
                `User limit: ✋**${ currentData.userLimit }**` + ( currentData.userLimit === previousData.userLimit ? " (Unchanged)" : "" ) + "\n" +
                `State: **${ currentData.state }**` + ( currentData.state === previousData.state ? " (Unchanged)" : "" ) + "\n" +
                "Allowed: " +  ( await masterChannelManager.getAllowedUserIds( interaction )).map( ( userId ) => {
                    return `<@${ userId }> ,`;
                } );

            // Remove last comma.
            description = description.slice( 0, -2 );

            if ( JSON.stringify( currentAllowedUsers ) === JSON.stringify( previousAllowedUsers ) ) {
                description += " (Unchanged)";
            }

            if ( isBeingRateLimited ) {
                description += "\n\n" +
                    "Rename was not made due to rate limit.\n" +
                    `Please wait **${ result.retry_after.toFixed( 0 ) }** or open a new channel:\n`;
                description += `<#${ masterChannel.id }>`;
            }

            const embed = new EmbedBuilder()
                .setTitle( "🔄 Dynamic Channel has been reset to default settings!" )
                .setDescription( description );

            await guiManager.sendContinuesMessage( interaction, {
                embeds: [ embed ]
            } );
        }
    }
}
