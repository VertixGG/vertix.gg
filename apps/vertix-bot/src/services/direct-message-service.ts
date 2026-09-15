import fetch from "cross-fetch";

import { ChannelType, EmbedBuilder } from "discord.js";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { VERTIX_OWNERS_IDS } from "@vertix.gg/bot/src/definitions/app";

import type { Channel, Guild, Message, MessageCreateOptions } from "discord.js";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

const OWNER_COMMAND_SYNTAX = {
    embed: "!embed <#channel_id> <https://message_url.com>",
    edit_embed: "!edit_embed <#channel_id> <message_id> <https://message_url.com>"
};

/**
 * How long somebody handed the feedback screen is left alone before being handed it again.
 *
 * In the environment because it is a judgement about how often a person should hear the same thing
 * from us, not something the code depends on. A day: long enough that writing three lines in a row
 * is answered once, short enough that somebody coming back tomorrow is answered at all rather than
 * met with silence - and silence is what this used to be, for as long as the process happened to
 * live.
 */
const FEEDBACK_COOLDOWN = Number( process.env.DIRECT_MESSAGE_FEEDBACK_COOLDOWN ) || 86400000; // 24 hours.

export class DirectMessageService extends ServiceWithDependenciesBase<{
    appService: AppService;
    uiService: UIService;
}> {
    /**
     * When each member was last handed the feedback screen.
     *
     * A time rather than the bare set of ids it was. A set never let anybody go: somebody answered
     * once was never answered again while the process lived, and it grew by one for every new
     * person who ever wrote in, with nothing that could ever take one out.
     *
     * Held rather than written down, because what it prevents is a burst. Losing it on a restart
     * costs somebody one more copy of a screen they were due to be shown again anyway.
     */
    private feedbackSentAt: Map<string, number> = new Map();

    public static getName() {
        return "VertixBot/Services/DirectMessage";
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            uiService: "VertixGUI/UIService"
        };
    }

    protected async initialize(): Promise<void> {
        await super.initialize();

        const { appService } = this.services;

        appService.onceReady( async() => {
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

        this.logger.admin(
            this.onMessage,
            `💬 Vertix received DM from '${ message.author.tag }' content: '${ message.content }'`
        );

        if ( VERTIX_OWNERS_IDS.includes( message.author.id ) ) {
            return this.onOwnerMessage( message );
        }

        if ( this.wasFeedbackSentRecently( message.author.id ) ) {
            return;
        }

        const adapter = this.services.uiService.get( "VertixBot/UI-General/FeedbackAdapter" );

        if ( !adapter ) {
            this.logger.error( this.sendLeaveMessageToOwner, "Failed to get feedback adapter!" );
            return;
        }

        this.rememberFeedbackSent( message.author.id );

        // Check what happens with zero
        await adapter.sendToUser( "direct-message", message.author.id, {} );
    }

    /**
     * Function wasFeedbackSentRecently() :: Whether this member has already been answered lately.
     *
     * Drops the entry it finds expired on the way past, so somebody who comes back after a day is
     * not left taking up room for a second one.
     */
    private wasFeedbackSentRecently( userId: string ) {
        const sentAt = this.feedbackSentAt.get( userId );

        if ( undefined === sentAt ) {
            return false;
        }

        if ( Date.now() - sentAt < FEEDBACK_COOLDOWN ) {
            return true;
        }

        this.feedbackSentAt.delete( userId );

        return false;
    }

    /**
     * Function rememberFeedbackSent() :: Notes that this member has just been answered.
     *
     * Everyone whose day is up goes at the same time. Swept here rather than on a timer because
     * somebody writing in is the only thing that ever adds to this, so it is also the only moment
     * there is anything new to tidy - and a bot nobody is writing to should not be waking up to
     * sweep an empty room.
     */
    private rememberFeedbackSent( userId: string ) {
        const now = Date.now();

        for ( const [ id, sentAt ] of this.feedbackSentAt ) {
            if ( now - sentAt >= FEEDBACK_COOLDOWN ) {
                this.feedbackSentAt.delete( id );
            }
        }

        this.feedbackSentAt.set( userId, now );
    }

    public async onOwnerMessage( message: Message ) {
        const command = message.content.split( " " ).filter( ( entry ) => entry.length );

        switch ( command[ 0 ] ) {
            case "!embed":
                await this.handleEmbedCommand( command, message );
                break;

            case "!edit_embed":
                await this.handleEditEmbedCommand( command, message );
                break;

            default:
                let syntaxMessage = "Available commands:\n\n";

                Object.values( OWNER_COMMAND_SYNTAX ).forEach( ( syntax ) => ( syntaxMessage += `${ syntax }\n` ) );

                await message.reply( syntaxMessage );
        }
    }

    private async handleEmbedCommand( command: string[], message: Message ) {
        if ( command.length < 2 || command.length > 3 || !command[ 1 ]?.length || !command[ 2 ]?.length ) {
            return await message.reply( OWNER_COMMAND_SYNTAX.embed );
        }

        const channel = await this.services.appService.getClient().channels.fetch( command[ 1 ] );

        if ( !channel || !channel.isTextBased() ) {
            return await message.reply( "Invalid channel!" );
        }

        const response = await this.fetchEmbed( command[ 2 ], message );

        if ( response ) {
            await this.sendEmbedCommand( channel, response, message );
        }
    }

    private async handleEditEmbedCommand( command: string[], message: Message ) {
        if (
            command.length < 3 ||
            command.length > 4 ||
            !command[ 1 ]?.length ||
            !command[ 2 ]?.length ||
            !command[ 3 ]?.length
        ) {
            return await message.reply( OWNER_COMMAND_SYNTAX.edit_embed );
        }

        const channel = await this.services.appService.getClient().channels.fetch( command[ 1 ] );

        if ( !channel || !channel.isTextBased() ) {
            return await message.reply( "Invalid channel!" );
        }

        // Find message.
        const messageToEdit = await channel.messages.fetch( command[ 2 ] ).catch( () => null );

        if ( !messageToEdit ) {
            await message.reply( "Message not found!" );
        }

        const response = await this.fetchEmbed( command[ 3 ], message );

        if ( response && messageToEdit ) {
            await messageToEdit
                .edit( { embeds: [ this.buildEmbed( response ) ] } )
                .catch( async() => {
                    await message.reply( "Message was not edited!" );
                } )
                .then( async() => {
                    await message.reply( "Message edited!" );
                } );
        }
    }

    private async sendEmbedCommand( channel: Channel, response: any, message: Message ) {
        if ( !channel.isSendable() ) {
            await message.reply( "Message was not sent!" );
            return;
        }

        channel
            .send( { embeds: [ this.buildEmbed( response ) ] } )
            .catch( async() => {
                await message.reply( "Message was not sent!" );
            } )
            .then( async() => {
                await message.reply( "Message sent!" );
            } );
    }

    public async sendLeaveMessageToOwner( guild: Guild ) {
        const adapter = this.services.uiService.get( "VertixBot/UI-General/FeedbackAdapter" );

        if ( !adapter ) {
            this.logger.error( this.sendLeaveMessageToOwner, "Failed to get feedback adapter!" );
            return;
        }

        await adapter.sendToUser( guild.id, guild.ownerId, {} );
    }

    public async sendToOwner( guild: Guild, message: MessageCreateOptions ) {
        const appService = this.services.appService;

        await ( await appService.getClient().users.fetch( guild.ownerId ) ).send( message ).catch( () => {
            this.logger.error(
                this.sendToOwner,
                `Guild id: '${ guild.id } - Failed to send message to guild ownerId: '${ guild.ownerId }'`
            );
        } );
    }

    /**
     * Function sendToUser() :: Sends a direct message, reporting whether it landed.
     *
     * A closed inbox is the ordinary outcome rather than a fault - it is the member's own setting -
     * so it is answered rather than thrown, leaving the caller to decide whether anything else has
     * to be said. The fetch is covered too: an id that no longer resolves fails the same way.
     */
    public async sendToUser( userId: string, message: MessageCreateOptions ): Promise<boolean> {
        const appService = this.services.appService;

        const user = await appService.getClient().users.fetch( userId ).catch( () => null );

        if ( ! user ) {
            this.logger.error( this.sendToUser, `Failed to fetch user, userId: '${ userId }'` );

            return false;
        }

        return user.send( message )
            .then( () => true )
            .catch( () => {
                this.logger.error( this.sendToUser, `Failed to send message to user, userId: '${ userId }'` );

                return false;
            } );
    }

    private async fetchEmbed( url: string, message: Message ) {
        let response: any;

        try {
            const request = fetch( url );

            response = await request.then( async( _response ) => {
                if ( !_response.ok ) {
                    throw _response;
                }

                return _response.json();
            } );
        } catch( e: any ) {
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
