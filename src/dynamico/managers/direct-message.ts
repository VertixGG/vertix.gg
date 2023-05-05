import fetch from "cross-fetch";

import { EmbedBuilder, Guild, Message, MessageCreateOptions, TextBasedChannel } from "discord.js";

import { dynamicoManager } from "@dynamico/managers";

import {
    DYNAMICO_DEFAULT_COLOR_BRAND,
    DYNAMICO_OWNERS_IDS
} from "@dynamico/constants/dynamico";

import InitializeBase from "@internal/bases/initialize-base";

export class DirectMessageManager extends InitializeBase {
    private static instance: DirectMessageManager;

    public static getInstance() {
        if ( ! DirectMessageManager.instance ) {
            DirectMessageManager.instance = new DirectMessageManager();
        }

        return DirectMessageManager.instance;
    }

    public static getName() {
        return "Managers/DirectMessage";
    }

    public async onMessage( message: Message ) {
        this.logger.admin( this.onMessage,
            `💬 Dynamico received DM from '${ message.author.tag }' content: '${ message.content }'`
        );

        if ( DYNAMICO_OWNERS_IDS.includes( message.author.id ) ) {
            return this.onOwnerMessage( message );
        }
    }

    public async onOwnerMessage( message: Message ) {
        const command = message.content.split( " " )
            .filter( ( entry ) => entry.length );

        switch ( command[ 0 ] ) {
            case "!embed": {
                if ( command.length < 2 || command.length > 3 || ! command[ 1 ]?.length || ! command[ 2 ]?.length ) {
                    return await message.reply( "Syntax: !embed <#channel_id> <https://message_url.com>" );
                }

                const channel = await dynamicoManager.getClient()?.channels.fetch( command[ 1 ] );

                if ( channel && channel.isTextBased() ) {
                    try {
                        const request = fetch( command[ 2 ] ),
                            response = await request.then( async ( _response ) => {
                                if ( ! _response.ok ) {
                                    throw _response;
                                }

                                return _response.json();
                            } );

                        const embedBuilder = new EmbedBuilder();

                        if ( response.title ) {
                            embedBuilder.setTitle( response.title );
                        }

                        if ( response.thumbnail ) {
                            embedBuilder.setThumbnail( response.thumbnail );
                        }

                        if ( response.image ) {
                            embedBuilder.setImage( response.image );
                        }

                        if ( response.description ) {
                            embedBuilder.setDescription( response.description );
                        }

                        if ( response.color ) {
                            embedBuilder.setColor( parseInt( response.color ) );
                        }

                        ( channel as TextBasedChannel ).send( {
                            embeds: [ embedBuilder ]
                        } ).catch( async () => {
                            await message.reply( "Message was not sent!" );
                        } )
                            .then( async () => {
                                await message.reply( "Message sent!" );
                            } );

                    } catch ( e: any ) {
                        await message.reply( e.message as string );
                    }
                } else {
                    await message.reply( "Channel is wrong" );
                }
            }
        }
    }

    public async sendLeaveMessageToOwner( guild: Guild ) {
        const embed = new EmbedBuilder();

        embed.setColor( DYNAMICO_DEFAULT_COLOR_BRAND );
        embed.setTitle( "We hope everything alright 🙏" );
        embed.setDescription( "If there was anything wrong with **Dynamico** functionality or if there's something we could improve upon, please let us know!\n" +
            "Join our [Community Support](https://discord.gg/Dynamico) and we will be glad to assist with anything you need." );

        await this.sendToOwner( guild, { embeds: [ embed ] } );
    }

    public async sendToOwner( guild: Guild, message: MessageCreateOptions ) {
        await ( await dynamicoManager.getClient()?.users.fetch( guild.ownerId ) )?.send( message ).catch( () => {
            this.logger.error( this.sendToOwner, `Guild id: '${ guild.id } - Failed to send message to guild ownerId: '${ guild.ownerId }'` );
        } );
    }

    public async sendToUser( userId: string, message: MessageCreateOptions ) {
        await ( await dynamicoManager.getClient()?.users.fetch( userId ) )?.send( message ).catch( () => {
            this.logger.error( this.sendToUser, `Failed to send message to user, userId: '${ userId }'` );
        } );
    }
}

export default DirectMessageManager;
