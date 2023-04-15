import { EmbedBuilder, Message, TextBasedChannel } from "discord.js";

import { dynamicoManager } from "@dynamico/managers";

import { DYNAMICO_DEFAULT_SURVEY_COLLECTOR_ID, DYNAMICO_OWNERS_IDS } from "@dynamico/constants/dynamico";

import InitializeBase from "@internal/bases/initialize-base";

export class DMManager extends InitializeBase {
    private static instance: DMManager;

    public static getInstance() {
        if ( ! DMManager.instance ) {
            DMManager.instance = new DMManager();
        }

        return DMManager.instance;
    }

    public static getName() {
        return "Managers/DMManager";
    }

    public async onMessage( message: Message ) {
        this.logger.debug( this.onMessage,
            `Received message from '${ message.author.tag }', content: '${ message.content }'` );

        if ( DYNAMICO_OWNERS_IDS.includes( message.author.id ) ) {
            return this.onOwnerMessage( message );
        }

        const target = await dynamicoManager.getClient()?.users.fetch( DYNAMICO_DEFAULT_SURVEY_COLLECTOR_ID );

        if ( target ) {
            const embedBuilder = new EmbedBuilder();

            embedBuilder.setTitle( "Message from " + message.author.tag );
            embedBuilder.setDescription( message.content );
            embedBuilder.setColor( "Random" );

            await target.send( {
                embeds: [ embedBuilder ]
            } );
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

                        if ( response.description ) {
                            embedBuilder.setDescription( response.description );
                        }

                        if ( response.color ) {
                            embedBuilder.setColor( parseInt( response.color ) );
                        }

                        ( channel as TextBasedChannel ).send( {
                            embeds: [ embedBuilder ]
                        } );

                        await message.reply( "Message sent!" );
                    } catch ( e: any ) {
                        await message.reply( e.message as string );
                    }
                } else {
                    await message.reply( "Channel is wrong" );
                }
            }
        }
    }
}

export default DMManager;
