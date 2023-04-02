import { EmbedBuilder, Message } from "discord.js";

import { dynamicoManager } from "@dynamico/managers";

import { DYNAMICO_DEFAULT_SURVEY_COLLECTOR_ID } from "@dynamico/constants/dynamico";

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

        const target = await dynamicoManager.getClient()?.users.fetch( DYNAMICO_DEFAULT_SURVEY_COLLECTOR_ID );

        if ( target ) {
            const embedBuilder = new EmbedBuilder();

            embedBuilder.setTitle( "Message from " + message.author.tag );
            embedBuilder.setDescription( message.content );
            embedBuilder.setColor("Random");

            await target.send( {
                embeds: [ embedBuilder ]
            } );
        }
    }
}

export default DMManager;
