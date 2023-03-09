import {
    ChannelType,
    Interaction,
    OverwriteType,
    SelectMenuInteraction,
    UserSelectMenuInteraction,
    VoiceChannel
} from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import { MasterChannelManager } from "@dynamico/managers";

import guiManager from "@dynamico/managers/gui";

import UIBase from "@dynamico/ui/base/ui-base";

import { sendManageUsersComponent } from "@dynamico/temp-utils";

export default class UsersMenus extends UIBase {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions/UsersMenus";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    // TODO: Determine visibility of this method.
    protected getBuilders( interaction: Interaction ) {
        const grantMenu = this.getUserMenuBuilder( this.grantUser.bind( this ) ),
            removeMenu = this.getMenuBuilder( this.removeUser.bind( this ) );

        grantMenu.setPlaceholder( "☝️ Grant User Access" );
        grantMenu.setMaxValues( 1 );
        grantMenu.setMinValues( 0 );

        removeMenu.setPlaceholder( "👇 Remove User From List" );

        const members: { label: string; value: string; }[] = [];

        const masterChannel = MasterChannelManager.getInstance().getByDynamicChannelSync( interaction ),
            masterChannelCache = interaction.client.channels.cache.get( masterChannel?.id );

        // Add all users in channel to grant menu.
        if ( interaction.channel && ChannelType.GuildVoice === interaction.channel.type ) {
            // Loop through the allowed users and add them to the description.
            for ( const role of interaction.channel.permissionOverwrites?.cache?.values() || [] ) {
                // Skip self.
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
                    } );
                }
            }
        }

        if ( ! members.length ) {
            removeMenu.setDisabled( true );
            members.push( {
                label: "No users found",
                value: "no-users-found",
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
                member = interaction.client.users.cache.get( interaction.values[ 0 ] );

            // If user tries to add himself, then we just ignore it.
            if ( member?.id === interaction.user.id ) {
                await sendManageUsersComponent( interaction,
                    "You cannot add your self"
                );

                return;
            }

            if ( member ) {
                // TODO: Move options to constants.
                await channel.permissionOverwrites.create( member, {
                    ViewChannel: true,
                    Connect: true,
                    ReadMessageHistory: true,
                } );

                await sendManageUsersComponent( interaction,
                    `☝ ${ member.username } can now connect to your channel`
                );

                return;
            }

            await guiManager.continuesMessage( interaction,
                `Could not find user with id '${ interaction.values[ 0 ] }'`, );
        }
    }

    private async removeUser( interaction: SelectMenuInteraction ) {
        if ( interaction.values.length === 0 ) {
            await interaction.deferUpdate( {} );

            return;
        }

        if ( ChannelType.GuildVoice === interaction.channel?.type && interaction ) {
            const channel = interaction.channel as VoiceChannel,
                member = interaction.client.users.cache.get( interaction.values[ 0 ] );

            // If user tries to remove himself, then we just ignore it.
            if ( member?.id === interaction.user.id ) {
                await sendManageUsersComponent( interaction,
                    "You cannot remove your self" );
            } else if ( member ) {
                await channel.permissionOverwrites.delete( member );

                await sendManageUsersComponent( interaction,
                    `👇 ${ member.username } removed from your list` );
            } else {
                await guiManager.continuesMessage( interaction,
                    `Could not find user with id '${ interaction.values[ 0 ] }'`, );
            }
        }
    }
}
