import {
    ChannelType,
    Interaction,
    OverwriteType,
    SelectMenuInteraction,
    UserSelectMenuInteraction,
    VoiceChannel
} from "discord.js";

import { MasterChannelManager } from "@dynamico/managers/master-channel";
import { GUIManager } from "@dynamico/managers/gui";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import Logger from "@internal/modules/logger";

export default class EditPermissionsUsersMenus extends UIElement {
    protected static dedicatedLogger = new Logger( this );

    public static getName() {
        return "Dynamico/UI/EditUserPermissions/EditPermissionsUsersMenus";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected async getBuilders( interaction: Interaction, args: any ) {
        const grantMenu = this.getUserMenuBuilder( this.grantUser.bind( this ) ),
            removeMenu = this.getMenuBuilder( this.removeUser.bind( this ) );

        grantMenu.setPlaceholder( "☝️ Grant User Access" );
        grantMenu.setMaxValues( 1 );
        grantMenu.setMinValues( 0 );

        removeMenu.setPlaceholder( "👇 Remove User From List" );

        const members: { label: string; value: string; emoji: string }[] = [],
            masterChannel = await MasterChannelManager.$.getByDynamicChannel( interaction );

        if ( ! masterChannel ) {
            return [];
        }

        const masterChannelCache = interaction.client.channels.cache.get( masterChannel.id );

        // Add all users in channel to grant menu.
        if ( interaction.channel && ChannelType.GuildVoice === interaction.channel.type ) {
            // Loop through the allowed users and add them to the description.
            for ( const role of interaction.channel.permissionOverwrites?.cache?.values() || [] ) {
                if ( role.id === interaction.user.id ) {
                    continue;
                }

                // Show only users that are not in the master channel permission overwrites.
                if ( role.type !== OverwriteType.Member ) {
                    continue;
                }

                if ( masterChannelCache?.type === ChannelType.GuildVoice &&
                    masterChannelCache.permissionOverwrites.cache.has( role.id ) ) {
                    continue;
                }

                const member = interaction.guild?.members.cache.get( role.id );

                if ( member ) {
                    members.push( {
                        label: member.displayName + ` #${ member.user.discriminator }`,
                        value: member.id,
                        emoji: "👤",
                    } );
                }
            }
        }

        if ( ! members.length ) {
            removeMenu.setDisabled( true );
            members.push( {
                label: "No users found",
                value: "no-users-found",
                emoji: "👤",
            } );
        }

        removeMenu.setOptions( members );

        return [
            [ grantMenu ],
            [ removeMenu ],
        ];
    }

    // TODO: Find common on both methods, and make a single to avoid code duplication.

    private async grantUser( interaction: UserSelectMenuInteraction ) {
        if ( interaction.values.length === 0 ) {
            await interaction.deferUpdate( {} );

            return;
        }

        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            const channel = interaction.channel as VoiceChannel,
                member = interaction.client.users.cache.get( interaction.values[ 0 ] ),
                editPermissionsComponent = GUIManager.$.get( "Dynamico/UI/EditUserPermissions" );

            let nothingChanged = false;

            const memberId = member?.id;

            if ( memberId === interaction.user.id || memberId === interaction.client.user.id ) {
                // If user tries to add himself, then we just ignore it.
                nothingChanged = true;
            } else if ( channel.permissionOverwrites.cache.has( memberId as string ) ) {
                // If user is already in the list, then we just ignore it.
                nothingChanged = true;
            }

            if ( nothingChanged ) {
                EditPermissionsUsersMenus.logger.admin( this.grantUser,
                    `🤷 Grant user access did nothing - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
                );

                await editPermissionsComponent.sendContinues( interaction, {
                    title: uiUtilsWrapAsTemplate( "nothingChanged" ),
                } );

                return;
            }

            if ( member ) {
                try {
                    await channel.permissionOverwrites.create( member, {
                        ViewChannel: true,
                        Connect: true,
                        ReadMessageHistory: true,
                    } );

                    EditPermissionsUsersMenus.logger.admin( this.grantUser,
                        `☝️  User access has been granted - "${ channel.name }" (${ channel.guild.name }) (${ interaction.guild?.memberCount })`
                    );

                    await editPermissionsComponent.sendContinues( interaction, {
                        title: uiUtilsWrapAsTemplate( "canNowConnect" ),
                        username: member.username,
                    } );

                    return;
                } catch ( e ) {
                    await editPermissionsComponent.sendContinues( interaction, {
                        title: uiUtilsWrapAsTemplate( "couldNotAddUser" ),
                        username: member.username,
                    } );

                    EditPermissionsUsersMenus.dedicatedLogger.error( this.grantUser, "", e );
                }
            }
        }
    }

    private async removeUser( interaction: SelectMenuInteraction ) {
        if ( interaction.values.length === 0 ) {
            await interaction.deferUpdate( {} );

            return;
        }

        if ( ChannelType.GuildVoice === interaction.channel?.type && interaction ) {
            const channel = interaction.channel as VoiceChannel,
                member = interaction.client.users.cache.get( interaction.values[ 0 ] ),
                editPermissionsComponent = GUIManager.$.get( "Dynamico/UI/EditUserPermissions" );

            if ( member ) {
                try {
                    await channel.permissionOverwrites.delete( member );

                    EditPermissionsUsersMenus.logger.admin( this.removeUser,
                        `👇 User has been removed from list - "${ channel.name }" (${ channel.guild.name }) (${ interaction.guild?.memberCount })`
                    );

                    await editPermissionsComponent.sendContinues( interaction, {
                        title: uiUtilsWrapAsTemplate( "removedFromYourList" ),
                        username: member.username,
                    } );

                    return;
                } catch ( e ) {
                    await editPermissionsComponent.sendContinues( interaction, {
                        title: uiUtilsWrapAsTemplate( "couldNotRemoveUser" ),
                        username: member.username,
                    } );

                    EditPermissionsUsersMenus.dedicatedLogger.error( this.removeUser, "", e );
                }
            }
        }
    }
}
