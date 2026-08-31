import fs from "fs/promises";
import os from "os";
import path from "path";

import { randomUUID } from "crypto";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import type { Message } from "discord.js";

const TEMP_DIRECTORY_NAME = "vertix-ai-attachments";
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 10485760;

export type LocalAttachment = {
    name: string;
    contentType: string | null;
    path: string;
    /** Some providers attach images to the prompt itself rather than letting the agent open them. */
    isImage: boolean;
};

export type LocalAttachments = {
    /** Removed as a whole once the agent is done with the files. */
    directory: string | null;
    files: LocalAttachment[];
};

const NO_ATTACHMENTS: LocalAttachments = { directory: null, files: [] };

/**
 * What a user attaches to a mention lives on Discord's CDN, and the agent only has local-file
 * tools - handed the URL it can do nothing with it. The files are copied next to the bot for the
 * length of one turn, so the agent can open them, and deleted right after.
 */
export class AttachmentManager extends InitializeBase {
    private static instance: AttachmentManager;

    public static getName() {
        return "VertixBot/Managers/Attachment";
    }

    public static get $() {
        if ( ! AttachmentManager.instance ) {
            AttachmentManager.instance = new AttachmentManager();
        }

        return AttachmentManager.instance;
    }

    public async download( message: Message<boolean> ): Promise<LocalAttachments> {
        if ( ! message.attachments.size ) {
            return NO_ATTACHMENTS;
        }

        const attachments = [ ...message.attachments.values() ].slice( 0, MAX_ATTACHMENTS );

        if ( message.attachments.size > MAX_ATTACHMENTS ) {
            this.logger.warn(
                this.download,
                `Message '${ message.id }' has ${ message.attachments.size } attachments, taking the first ${ MAX_ATTACHMENTS }`
            );
        }

        const directory = path.join( os.tmpdir(), TEMP_DIRECTORY_NAME, randomUUID() );

        const created = await fs.mkdir( directory, { recursive: true } )
            .then( () => true )
            .catch( ( error: unknown ) => {
                this.logger.warn( this.download, `Could not create '${ directory }'`, error );

                return false;
            } );

        if ( ! created ) {
            return NO_ATTACHMENTS;
        }

        const files: LocalAttachment[] = [];

        for ( const attachment of attachments ) {
            if ( attachment.size > MAX_ATTACHMENT_BYTES ) {
                this.logger.warn(
                    this.download,
                    `Skipping '${ attachment.name }' - ${ attachment.size } bytes is over the ${ MAX_ATTACHMENT_BYTES } limit`
                );

                continue;
            }

            const file = await this.write( directory, attachment.name, attachment.url );

            if ( file ) {
                files.push( {
                    ...file,
                    contentType: attachment.contentType,
                    isImage: !! attachment.contentType?.startsWith( "image/" )
                } );
            }
        }

        if ( ! files.length ) {
            await this.cleanup( { directory, files } );

            return NO_ATTACHMENTS;
        }

        this.logger.log( this.download, `Downloaded ${ files.length } attachment(s) of '${ message.id }' to '${ directory }'` );

        return { directory, files };
    }

    public async cleanup( attachments: LocalAttachments ): Promise<void> {
        if ( ! attachments.directory ) {
            return;
        }

        await fs.rm( attachments.directory, { recursive: true, force: true } ).catch( ( error: unknown ) => {
            this.logger.warn( this.cleanup, `Could not remove '${ attachments.directory }'`, error );
        } );
    }

    private async write( directory: string, name: string, url: string ): Promise<Pick<LocalAttachment, "name" | "path"> | null> {
        // Discord allows names the local filesystem does not - keep the name recognizable, drop
        // everything that could walk out of the directory.
        const safeName = path.basename( name ).replace( /[^\w.\-]/g, "_" ) || "attachment";
        const filePath = path.join( directory, safeName );

        try {
            const response = await fetch( url );

            if ( ! response.ok ) {
                this.logger.warn( this.write, `Discord answered ${ response.status } for '${ name }'` );

                return null;
            }

            await fs.writeFile( filePath, Buffer.from( await response.arrayBuffer() ) );

            return { name, path: filePath };
        } catch( error ) {
            this.logger.warn( this.write, `Failed to download '${ name }'`, error );

            return null;
        }
    }
}

export default AttachmentManager;
