import * as fs from "fs";

import * as path from "path";

import process from "process";

import { CURRENT_VERSION } from "@vertix.gg/definitions/src/version";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { zFindRootPackageJsonPath } from "@zenflux/utils/workspace";

import { VoiceRoleManager } from "@vertix.gg/bot/src/managers/voice-role-manager";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

import type { Client } from "discord.js";

interface PackageJson {
    version: string;

    [key: string]: any;
}

const packageJsonPath = path.resolve( path.dirname( zFindRootPackageJsonPath() ), "apps/vertix-bot/package.json" );
const packageJsonString = fs.readFileSync( packageJsonPath, { encoding: "utf8" } );
const packageJson: PackageJson = JSON.parse( packageJsonString );

export class AppService extends ServiceBase {
    private client!: Client<true>;

    private isActive = false;

    private onceReadyCallbacks: Array<() => Promise<void>> = [];

    public static getName() {
        return "VertixBot/Services/App";
    }

    public static getVersion() {
        return CURRENT_VERSION;
    }

    public static getBuildVersion() {
        return packageJson.version;
    }

    public constructor() {
        super();

        EventBus.$.register( this, [ this.onReady ] );

        this.printVersion();
    }

    public getClient() {
        return this.client;
    }

    public onceReady( onceReady: () => Promise<void> ) {
        if ( this.isActive ) {
            onceReady();
            return;
        }

        this.onceReadyCallbacks.push( onceReady );
    }

    public async onReady( client: Client<true> ) {
        if ( this.client ) {
            this.logger.error( this.onReady, "Client is already set" );

            process.exit( 1 );
        }

        this.client = client;

        if ( !client.user || !client.application ) {
            this.logger.error( this.onReady, "Client is not ready" );

            process.exit( 1 );
        }

        const { Commands } = await import( "@vertix.gg/bot/src/commands" );

        await client.application.commands.set( Commands );

        this.logger.info( this.onReady, "Abandoned channels are handled." );

        await this.ensureBackwardCompatibility();

        const username = client.user.username,
            id = client.user.id;

        this.logger.log(
            this.onReady,
            `Ready handle is set, bot: '${ username }', id: '${ id }' is online, commands is set.`
        );

        this.pingInterval();

        this.isActive = true;

        await Promise.all( this.onceReadyCallbacks.map( callback => callback() ) );

        await this.refreshControlPanels( client );

        await this.reconcileVoiceRoles( client );
    }

    /**
     * Function reconcileVoiceRoles() :: Reclaims the voice role from anyone who is no longer in a
     * dynamic channel.
     *
     * The role is handed out on join and taken back on leave, so a process that dies in between
     * leaves it behind permanently - discord has no notion of a temporary role.
     */
    private async reconcileVoiceRoles( client: Client<true> ) {
        for ( const guild of client.guilds.cache.values() ) {
            await VoiceRoleManager.$.reconcileGuild( guild ).catch( ( error ) => {
                this.logger.error(
                    this.reconcileVoiceRoles,
                    `Guild id: '${ guild.id }' - Failed to reconcile voice roles`,
                    error
                );
            } );
        }
    }

    private async refreshControlPanels( client: Client<true> ) {
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        if ( !dynamicChannelService ) {
            this.logger.warn( this.refreshControlPanels, "DynamicChannelService not available, skipping panel refresh" );
            return;
        }

        await dynamicChannelService.refreshControlPanels( client );
    }

    private async ensureBackwardCompatibility() {
        // const { PrismaBotClient } = await import("@vertix.gg/prisma/bot-client");
        // const client = PrismaBotClient.getPrismaClient();
        //
        // const checkVersion = (version: string) => {
        //     const [major, minor, patch] = version.split(".");
        //     return Number(major) === 0 && Number(minor) === 0 && Number(patch) <= 7;
        // };
        //
        // async function ensueDataVersionMatchesNewUIMechanism( this: AppService ) {
        //     const updateData = async ( dataModel: any ) => {
        //         const entities = await dataModel.findMany( {
        //             where: {
        //                 version: {
        //                     lte: "0.0.7",
        //                 }
        //             }
        //         } );
        //
        //         let count = 0;
        //         for ( const entity of entities ) {
        //             if ( entity.version.length === 5 && checkVersion( entity.version ) ) {
        //                 count++;
        //                 await dataModel.update( {
        //                     where: {
        //                         id: entity.id,
        //                     },
        //                     data: {
        //                         version: VERSION_UI_V2,
        //                     },
        //                 } );
        //             }
        //         }
        //
        //         this.logger.log( ensueDataVersionMatchesNewUIMechanism, `Updated ${ count } entities in ${ dataModel.name }` );
        //     };
        //
        //     await updateData( client.guildData );
        //     await updateData( client.channelData );
        //     await updateData( client.userData );
        // }
        //
        // await ensueDataVersionMatchesNewUIMechanism.call( this );
    }

    private pingInterval() {
        setInterval( () => {
            this.logger.log( this.pingInterval, `Ping: ${ this.client.ws.ping }ms` );
        }, 30000 );
    }

    private printVersion() {
        this.logger.info(
            this.printVersion,
            `Version: '${ AppService.getVersion() }' Build version: ${ AppService.getBuildVersion() }'`
        );
    }
}

export default AppService;
