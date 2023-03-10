import {
    ChannelType,
    Interaction,
    OverwriteType,
    SelectMenuInteraction,
    UserSelectMenuInteraction,
    VoiceChannel
} from "discord.js";

import UIElement from "@dynamico/ui/base/ui-element";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import { MasterChannelManager } from "@dynamico/managers";

import guiManager from "@dynamico/managers/gui";

export default class UsersMenus extends UIElement {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions/UsersMenus";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected async getBuilders( interaction: Interaction ) {
        const grantMenu = this.getUserMenuBuilder( this.grantUser.bind( this ) ),
            removeMenu = this.getMenuBuilder( this.removeUser.bind( this ) );

        grantMenu.setPlaceholder( "☝️ Grant User Access" );
        grantMenu.setMaxValues( 1 );
        grantMenu.setMinValues( 0 );

        removeMenu.setPlaceholder( "👇 Remove User From List" );

        const members: { label: string; value: string; }[] = [];

        const masterChannel = await MasterChannelManager.getInstance().getByDynamicChannel( interaction );

        if ( ! masterChannel ) {
            UsersMenus.logger.warn( this.getBuilders,
                `Master channel does not exist for dynamic channel '${ interaction.channel?.id }'` );

            if ( interaction.isRepliable() ) {
                await guiManager.get( "Dynamico/UI/GlobalResponse")
                    .sendContinues( interaction as SelectMenuInteraction, {
                        globalResponse: "%{masterChannelNotExist}%"
                    } );
            }

            return [];
        }

        const masterChannelCache = interaction.client.channels.cache.get( masterChannel.id );

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
                member = interaction.client.users.cache.get( interaction.values[ 0 ] ),
                editPermissionsComponent = guiManager.get( "Dynamico/UI/EditUserPermissions" );

            // If user tries to add himself, then we just ignore it.
            if ( member?.id === interaction.user.id ) {
                await editPermissionsComponent.sendContinues( interaction, {
                    title: "%{cannotAddYourSelf}%",
                } );

                return;
            }

            if ( member ) {
                // TODO: Move options to constants.
                await channel.permissionOverwrites.create( member, {
                    ViewChannel: true,
                    Connect: true,
                    ReadMessageHistory: true,
                } );

                await editPermissionsComponent.sendContinues( interaction, {
                    title: "%{canNowConnect}%",
                    username: member.username,
                } );

                return;
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
                    title: "%{removedFromYourList}%",
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
