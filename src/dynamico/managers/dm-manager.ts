import { EmbedBuilder, Message } from "discord.js";

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
            case "!welcome": {
                if ( command.length < 2 || command.length > 2 ) {
                    await message.reply( "Syntax: !welcome #channel_id <message_url>" );
                }

                const channel = await dynamicoManager.getClient()?.channels.fetch( command[ 1 ] );

                if ( ! channel ) {
                    await message.reply( "Channel is invalid!" );
                }

                const content = await fetch( command[ 2 ] ).then( ( response ) => response.text() );

                if ( ! content ) {
                    await message.reply( "Message is invalid!" );
                }

                if ( channel && channel.isTextBased() ) {
                    await channel.send( content );
                    await message.reply( "Message sent!" );
                } else {
                    await message.reply( "Channel is invalid!" );
                }
            }
        }
    }
}

export default DMManager;
