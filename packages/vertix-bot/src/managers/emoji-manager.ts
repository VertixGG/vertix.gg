import { InitializeBase } from "@vertix.gg/base/src/bases/index";
import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { gToken } from "@vertix.gg/base/src/discord/login";

import { GatewayVersion } from "discord-api-types/gateway/v10";
import { Routes } from "discord-api-types/v10";

import { REST } from "discord.js";

import type { Client } from "discord.js";

import type { RESTGetAPIApplicationEmojisResult } from "discord-api-types/v9";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

export class EmojiManager extends InitializeBase {
    private static instance: EmojiManager;

    private appService: AppService;

    private debugger: Debugger;

    private initPromise: Promise<void>;

    private emojis: RESTGetAPIApplicationEmojisResult;

    public static getName () {
        return "VertixBot/Managers/Emoji";
    }

    public static get $ () {
        if ( !EmojiManager.instance ) {
            EmojiManager.instance = new EmojiManager();
        }

        return EmojiManager.instance;
    }

    public constructor () {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "MANAGER", EmojiManager.getName() ) );
    }

    protected async initialize () {
        this.appService = await ServiceLocator.$.waitFor( "VertixBot/Services/App", {
            silent: true,
            timeout: 30000
        } );

        // Wait for client to be ready using AppService's onceReady
        await new Promise<void>( ( resolve ) => {
            this.appService.onceReady( resolve );
        } );

        const rest = new REST( { version: GatewayVersion } ).setToken( gToken );

        this.emojis = ( await rest.get(
            Routes.applicationEmojis( this.appService.getClient().user.id )
        ) ) as RESTGetAPIApplicationEmojisResult;

        this.debugger.dumpDown( this.initialize, this.emojis, "emojis" );
    }

    public async awaitInitialization () {
        return this.initPromise;
    }

    public async getMarkdown ( baseName: string, fromCache = true ) {
        if ( !fromCache ) {
            await this.initialize();
        }

        await this.initPromise;

        return this.getCachedMarkdown( baseName );
    }

    public getCachedMarkdown ( baseName: string ) {
        const emoji = this.emojis?.items?.find( ( emoji ) => emoji.name!.includes( baseName ) );

        if ( emoji ) {
            return `<:${ emoji.name }:${ emoji.id }>`;
        }

        throw new Error( `Emoji: '${ baseName }' not found` );
    }
}
