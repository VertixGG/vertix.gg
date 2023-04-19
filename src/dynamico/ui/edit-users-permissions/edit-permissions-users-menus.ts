import {
    ChannelType,
    Interaction,
    OverwriteType,
    SelectMenuInteraction,
    UserSelectMenuInteraction,
    VoiceChannel
} from "discord.js";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { guiManager, masterChannelManager } from "@dynamico/managers";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

export default class EditPermissionsUsersMenus extends UIElement {
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
            masterChannel = await masterChannelManager.getByDynamicChannel( interaction );

        if ( ! masterChannel ) {
            EditPermissionsUsersMenus.logger.warn( this.getBuilders,
                `Master channel does not exist for dynamic channel '${ interaction.channel?.id }'` );

            if ( interaction.isRepliable() ) {
                await guiManager.get( "Dynamico/UI/NotifyMasterChannelNotExist" )
                    .sendContinues( interaction as SelectMenuInteraction, {} );
            }

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

    private async grantUser( interaction: UserSelectMenuInteraction ) {
        if ( interaction.values.length === 0 ) {
            await interaction.deferUpdate( {} );

            return;
        }

        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            const channel = interaction.channel as VoiceChannel,
                member = interaction.client.users.cache.get( interaction.values[ 0 ] ),
                editPermissionsComponent = guiManager.get( "Dynamico/UI/EditUserPermissions" );

            // If user tries to add himself, then we just ignore it.
            const memberId = member?.id;
            if ( memberId === interaction.user.id || memberId === interaction.client.user.id ) {
                await editPermissionsComponent.sendContinues( interaction, {
                    title: uiUtilsWrapAsTemplate( "nothingChanged" ),
                } );

                return;
            }

            // If user is already in the list, then we just ignore it.
            if ( channel.permissionOverwrites.cache.has( memberId as string ) ) {
                await editPermissionsComponent.sendContinues( interaction, {
                    title: uiUtilsWrapAsTemplate( "nothingChanged" ),
                    username: member?.username,
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

                    UIElement.logger.error( this.grantUser, "", e );
                }
            }

            await editPermissionsComponent.sendContinues( interaction, {
                title: `Could not find user with id '${ interaction.values[ 0 ] }'`,
            } );
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
                editPermissionsComponent = guiManager.get( "Dynamico/UI/EditUserPermissions" );

            // TODO: Properly some of the logic repeated.
            if ( member ) {
                await channel.permissionOverwrites.delete( member );

                await editPermissionsComponent.sendContinues( interaction, {
                    title: uiUtilsWrapAsTemplate( "removedFromYourList" ),
                    username: member.username,
                } );
            } else {
                await editPermissionsComponent.sendContinues( interaction, {
                    title: `Could not find user with id '${ interaction.values[ 0 ] }'`,
                } );
            }
        }
    }
}
