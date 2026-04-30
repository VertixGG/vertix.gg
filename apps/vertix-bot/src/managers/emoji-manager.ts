import { InitializeBase } from "@vertix.gg/base/src/bases/index";
import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { gToken } from "@vertix.gg/base/src/discord/login";
import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { GatewayVersion } from "discord-api-types/gateway/v10";
import { Routes } from "discord-api-types/v10";

import { REST } from "discord.js";

import { getEmojiFromPreviewCache } from "@vertix.gg/utils/src/emoji-preview-cache";

import type { RESTGetAPIApplicationEmojisResult } from "discord-api-types/v9";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

export class EmojiManager extends InitializeBase {
    private static instance: EmojiManager;

    private appService: AppService;

    private debugger: Debugger;

    private initPromise: Promise<void>;

    private emojis: RESTGetAPIApplicationEmojisResult;

    public static getName() {
        return "VertixBot/Managers/Emoji";
    }

    public static get $() {
        if ( ! EmojiManager.instance ) {
            EmojiManager.instance = new EmojiManager();
        }

        return EmojiManager.instance;
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "MANAGER", EmojiManager.getName() ) );
    }

    protected async initialize() {
        // In headless mode (no bot services), fetch emojis directly via REST API.
        const appService = ServiceLocator.$.get( "VertixBot/Services/App", { silent: true } );
        if ( !appService ) {
            this.logger.info( this.initialize, "AppService not available (headless mode), fetching emojis via REST" );
            this.initPromise = this.fetchEmojisHeadless();
            return;
        }

        this.appService = await ServiceLocator.$.waitFor( "VertixBot/Services/App", {
            silent: true,
            timeout: 5000
        } );

        // Wait for client to be ready using AppService's onceReady
        this.initPromise = new Promise<void>( ( resolve ) => {
            this.appService.onceReady( async() => {
                const rest = new REST( { version: GatewayVersion } ).setToken( gToken );

                this.emojis = ( await rest.get(
                    Routes.applicationEmojis( this.appService.getClient().user.id )
                ) ) as RESTGetAPIApplicationEmojisResult;

                this.debugger.dumpDown( this.initialize, this.emojis, "emojis" );

                resolve();
            } );
        } );
    }

    private async fetchEmojisHeadless() {
        const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TEST_TOKEN || process.env.DISCORD_TOKEN;
        if ( !token ) {
            this.logger.warn( this.fetchEmojisHeadless, "No Discord token available, emoji markdown will use placeholders" );
            return;
        }

        try {
            const rest = new REST( { version: GatewayVersion } ).setToken( token );

            // Fetch application info to get the application ID
            const appInfo = await rest.get( Routes.currentApplication() ) as { id: string };

            this.emojis = ( await rest.get(
                Routes.applicationEmojis( appInfo.id )
            ) ) as RESTGetAPIApplicationEmojisResult;

            this.logger.info( this.fetchEmojisHeadless, `Fetched ${ this.emojis.items?.length ?? 0 } emojis in headless mode` );
            this.debugger.dumpDown( this.fetchEmojisHeadless, this.emojis, "emojis (headless)" );
        } catch( error ) {
            this.logger.warn( this.fetchEmojisHeadless, `Failed to fetch emojis in headless mode: ${ error }` );
        }
    }

    public async promise() {
        if ( ! this.initPromise ) {
            await this.initialize();
        }
        return this.initPromise;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getMarkdown( baseName: string, fromCache = true ) {
        const emoji = this.emojis?.items?.find( ( emoji ) => emoji.name!.includes( baseName ) );

        if ( this.emojis ) {
            if ( emoji ) {
                return `<:${ emoji.name }:${ emoji.id }>`;
            }

            throw new Error( `Emoji: '${ baseName }' not found` );
        }

        const previewEmoji = getEmojiFromPreviewCache( baseName );
        if ( previewEmoji ) {
            return previewEmoji.markdown;
        }

        return `:${ baseName }:`; // Fallback placeholder
    }
}
