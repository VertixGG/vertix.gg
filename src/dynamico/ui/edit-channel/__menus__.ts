import { APISelectMenuOption, ChannelType, OverwriteType, UserSelectMenuInteraction, VoiceChannel } from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIBase from "../base/ui-base";
import GUIManager from "@dynamico/managers/gui";

export default class EditChannelMenus extends UIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/Menus";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    getBuilders( interaction: VoiceChannel ) {
        const grantMenu = this.getUserMenuBuilder( this.grantUser.bind( this ) ),
            removeMenu = this.getMenuBuilder( this.removeUser.bind( this ) );

        grantMenu.setPlaceholder( "☝️ Grant User Access" );
        grantMenu.setMaxValues( 1 );
        grantMenu.setMinValues( 0 );

        removeMenu.setPlaceholder( "👇 Remove User From List" );

        // Check if interaction is from channel.
        if ( interaction ) {
            const members: { label: string; value: string; }[] = [];

            // Add all users in channel to grant menu.
            interaction.permissionOverwrites.cache.map( ( ( permission ) => {
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

            removeMenu.setOptions( members );
        }

        // TODO: Type safe validation.
        const result = [
            [ grantMenu ],
        ] as any[];

        if ( removeMenu.options.length > 0 ) {
            result.push( [ removeMenu ] );
        }

        return result;
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

    private async removeUser() {

    }

}
