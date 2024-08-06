import fetch from "cross-fetch";

import { ChannelType, EmbedBuilder } from "discord.js";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { VERTIX_OWNERS_IDS } from "@vertix.gg/bot/src/definitions/app";

import type { Guild, Message, MessageCreateOptions, TextBasedChannel } from "discord.js";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

const OWNER_COMMAND_SYNTAX = {
    embed: "!embed <#channel_id> <https://message_url.com>",
    edit_embed: "!edit_embed <#channel_id> <message_id> <https://message_url.com>"
};

export class DirectMessageService extends ServiceWithDependenciesBase<{
    appService: AppService,
    uiService: UIService,
}> {
    private feedbackSentIds: Map<string, string> = new Map();

    public static getName() {
        return "VertixBot/Services/DirectMessage";
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            uiService: "VertixGUI/UIService",
        };
    }

    protected async initialize(): Promise<void> {
        await super.initialize();

        const { appService } = this.services;

        appService.onceReady( () => {
            appService.getClient().on( "messageCreate", this.onMessage.bind( this ) );
        } );
    }

    public async onMessage( message: Message ) {
        if ( message.author.bot ) {
            return;
        }

        if ( message.channel.type !== ChannelType.DM ) {
            return;
        }

        this.logger.admin( this.onMessage,
            `💬 Vertix received DM from '${ message.author.tag }' content: '${ message.content }'`
        );

        if ( VERTIX_OWNERS_IDS.includes( message.author.id ) ) {
            return this.onOwnerMessage( message );
        }

        if ( this.feedbackSentIds.has( message.author.id ) ) {
            return;
        }

        const adapter = this.services.uiService
            .get( "VertixBot/UI-General/FeedbackAdapter" );

        if ( ! adapter ) {
            this.logger.error( this.sendLeaveMessageToOwner, "Failed to get feedback adapter!" );
            return;
        }

        this.feedbackSentIds.set( message.author.id, message.author.id );

        // Check what happens with zero
        await adapter.sendToUser( "direct-message", message.author.id, {} );
    }

    public async onOwnerMessage( message: Message ) {
        const command = message.content.split( " " )
            .filter( ( entry ) => entry.length );

        switch ( command[ 0 ] ) {
            case "!embed":
                await this.handleEmbedCommand( command, message );
                break;

            case "!edit_embed":
                await this.handleEditEmbedCommand( command, message );
                break;

            default:
                let syntaxMessage = "Available commands:\n\n";

                Object.values( OWNER_COMMAND_SYNTAX ).forEach(
                    ( syntax ) => syntaxMessage += `${ syntax }\n`
                );

                await message.reply( syntaxMessage );
        }
    }

    private async handleEmbedCommand( command: string[], message: Message ) {
        if ( command.length < 2 || command.length > 3 || ! command[ 1 ]?.length || ! command[ 2 ]?.length ) {
            return await message.reply( OWNER_COMMAND_SYNTAX.embed );
        }

        const channel = await this.services.appService
            .getClient().channels.fetch( command[ 1 ] );

        if ( ! channel || ! channel.isTextBased() ) {
            return await message.reply( "Invalid channel!" );
        }

        const response = await this.fetchEmbed( command[ 2 ], message );

        if ( response ) {
            await this.sendEmbedCommand( channel, response, message );
        }
    }

    private async handleEditEmbedCommand( command: string[], message: Message ) {
        if ( command.length < 3 || command.length > 4 || ! command[ 1 ]?.length || ! command[ 2 ]?.length || ! command[ 3 ]?.length ) {
            return await message.reply( OWNER_COMMAND_SYNTAX.edit_embed );
        }

        const channel = await this.services.appService
            .getClient().channels.fetch( command[ 1 ] );

        if ( ! channel || ! channel.isTextBased() ) {
            return await message.reply( "Invalid channel!" );
        }

        // Find message.
        const messageToEdit = await channel.messages.fetch( command[ 2 ] ).catch( () => null );

        if ( ! messageToEdit ) {
            await message.reply( "Message not found!" );
        }

        const response = await this.fetchEmbed( command[ 3 ], message );

        if ( response && messageToEdit ) {
            await messageToEdit.edit( { embeds: [ this.buildEmbed( response ) ] } )
                .catch( async () => {
                    await message.reply( "Message was not edited!" );
                } )
                .then( async () => {
                    await message.reply( "Message edited!" );
                } );
        }
    }

    private async sendEmbedCommand( channel: TextBasedChannel, response: any, message: Message ) {
        channel.send( { embeds: [ this.buildEmbed( response ) ] } )
            .catch( async () => {
                await message.reply( "Message was not sent!" );
            } )
            .then( async () => {
                await message.reply( "Message sent!" );
            } );
    }

    public async sendLeaveMessageToOwner( guild: Guild ) {
        const adapter = this.services.uiService
            .get( "VertixBot/UI-General/FeedbackAdapter" );

        if ( ! adapter ) {
            this.logger.error( this.sendLeaveMessageToOwner, "Failed to get feedback adapter!" );
            return;
        }

        await adapter.sendToUser( guild.id, guild.ownerId, {} );
    }

    public async sendToOwner( guild: Guild, message: MessageCreateOptions ) {
        const appService = this.services.appService;

        await ( await appService.getClient().users.fetch( guild.ownerId ) ).send( message ).catch( () => {
            this.logger.error( this.sendToOwner, `Guild id: '${ guild.id } - Failed to send message to guild ownerId: '${ guild.ownerId }'` );
        } );
    }

    public async sendToUser( userId: string, message: MessageCreateOptions ) {
        const appService = this.services.appService;

        await ( await appService.getClient().users.fetch( userId ) ).send( message ).catch( () => {
            this.logger.error( this.sendToUser, `Failed to send message to user, userId: '${ userId }'` );
        } );
    }

    private async fetchEmbed( url: string, message: Message ) {
        let response: any;

        try {
            const request = fetch( url );

            response = await request.then( async ( _response ) => {
                if ( ! _response.ok ) {
                    throw _response;
                }

                return _response.json();
            } );
        } catch ( e: any ) {
            await message.reply( e.message as string );
            response = null;
        }

        return response;
    }

    private buildEmbed( response: any ) {
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

        return embedBuilder;
    }
}

export default DirectMessageService;
