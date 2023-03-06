import UIBase from "@dynamico/ui/base/ui-base";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import {
    ChannelType,
    Interaction,
    OverwriteType,
    SelectMenuInteraction,
    UserSelectMenuInteraction,
    VoiceChannel
} from "discord.js";
import GUIManager from "@dynamico/managers/gui";

export default class ManageUsersMenus extends UIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/MangeUsersMenus";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getBuilders( interaction: Interaction ) {
        const grantMenu = this.getUserMenuBuilder( this.grantUser.bind( this ) ),
            removeMenu = this.getMenuBuilder( this.removeUser.bind( this ) );

        grantMenu.setPlaceholder( "☝️ Grant User Access" );
        grantMenu.setMaxValues( 1 );
        grantMenu.setMinValues( 0 );

        removeMenu.setPlaceholder( "👇 Remove User From List" );

        const members: { label: string; value: string; }[] = [];

        // Add all users in channel to grant menu.
        if ( interaction.channel && ChannelType.GuildVoice === interaction.channel.type ) {
            interaction.channel.permissionOverwrites.cache.map( ( ( permission ) => {
                if ( permission.type === OverwriteType.Member ) {
                    const member = interaction.guild?.members.cache.get( permission.id );

                    if ( member ) {
                        members.push( {
                            label: member.displayName,
                            value: member.id,
                        } );
                    }
                }
            } ) );
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
            const guiManager = GUIManager.getInstance(),
                channel = interaction.channel as VoiceChannel,
                member = interaction.client.users.cache.get( interaction.values[ 0 ] );

            if ( member ) {
                await channel.permissionOverwrites.create( member, {
                    ViewChannel: true,
                    Connect: true,
                } );

                await guiManager.continuesMessage( interaction,
                    `Granted ${ member.username } access to ${ channel.name }`, );
            } else {
                await guiManager.continuesMessage( interaction,
                    `Could not find user with id '${ interaction.values[ 0 ] }'`, );
            }
        }
    }

    private async removeUser( interaction: SelectMenuInteraction ) {
        if ( interaction.values.length === 0 ) {
            await interaction.deferUpdate( {} );

            return;
        }

        if ( ChannelType.GuildVoice === interaction.channel?.type && interaction ) {
            const guiManager = GUIManager.getInstance(),
                channel = interaction.channel as VoiceChannel,
                member = interaction.client.users.cache.get( interaction.values[ 0 ] );

            if ( member ) {
                await channel.permissionOverwrites.delete( member );

                await guiManager.continuesMessage( interaction,
                    `Granted ${ member.username } access to ${ channel.name }`, );
            } else {
                await guiManager.continuesMessage( interaction,
                    `Could not find user with id '${ interaction.values[ 0 ] }'`, );
            }
        }
    }
}
