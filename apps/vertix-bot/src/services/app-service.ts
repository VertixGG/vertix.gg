import crypto from "node:crypto";

import * as fs from "fs";

import * as path from "path";

import process from "process";

import { CURRENT_VERSION } from "@vertix.gg/definitions/src/version";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { CommandsRegistrationModel } from "@vertix.gg/data/src/models/commands-registration-model";

import { zFindRootPackageJsonPath } from "@zenflux/utils/workspace";

import { ownsSingletonWork } from "@vertix.gg/bot/src/definitions/sharding";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";

import type { Client } from "discord.js";

interface PackageJson {
    version: string;

    [key: string]: any;
}

const packageJsonPath = path.resolve( path.dirname( zFindRootPackageJsonPath() ), "apps/vertix-bot/package.json" );
const packageJsonString = fs.readFileSync( packageJsonPath, { encoding: "utf8" } );
const packageJson: PackageJson = JSON.parse( packageJsonString );

/**
 * What the slash command set is hashed with.
 *
 * Only ever compared with an earlier hash of its own, so it is chosen for being cheap rather than
 * hard to forge. Changing it sends the set once, since no stored hash matches any more.
 */
const COMMANDS_HASH_ALGORITHM = "md5";

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

        await this.registerCommands( client, Commands );

        await this.ensureBackwardCompatibility();

        const username = client.user.username,
            id = client.user.id;

        this.logger.log(
            this.onReady,
            `Ready handle is set, bot: '${ username }', id: '${ id }' is online.`
        );

        this.pingInterval();

        this.isActive = true;

        await Promise.all( this.onceReadyCallbacks.map( callback => callback() ) );

        // Not awaited: everything below is catching up on what the previous process left behind,
        // and none of it has to finish before the bot can answer an interaction. Awaited, it put
        // work proportional to the number of guilds the bot has ever been added to in front of
        // being usable at all.
        //
        // Voice roles are no longer swept here. `VoiceRoleManager.ensureGuildReconciled()` does one
        // guild the first time that guild sees voice activity, which is both when the stale role
        // could first be noticed and the only time it matters.
        void this.refreshControlPanels( client ).catch( ( error ) => {
            this.logger.error( this.onReady, "Failed to refresh control panels", error );
        } );
    }

    private async refreshControlPanels( client: Client<true> ) {
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        if ( !dynamicChannelService ) {
            this.logger.warn( this.refreshControlPanels, "DynamicChannelService not available, skipping panel refresh" );
            return;
        }

        await dynamicChannelService.refreshControlPanels( client );
    }

    /**
     * Function registerCommands() :: Tells discord what the slash commands are - only when that
     * changed.
     *
     * Every restart used to send the whole set, from every shard, and the bot did not count as ready
     * until discord answered. The set is global and rarely changes, and discord rate limits the
     * route: with deploys minutes apart one of those waits ran to thirty-seven seconds, all of it
     * spent re-sending what discord already had.
     *
     * A hash of the set is kept per application, and the set is sent only when it no longer matches.
     * Everything a command is defined by - its name, description, permissions, where it works, its
     * subcommands - is in the hash, so changing any of it sends the set once.
     *
     * One process sends it. The set belongs to the application rather than to a shard, and two
     * processes starting together would both see the same change and both send it.
     */
    private async registerCommands( client: Client<true>, commands: ICommand[] ) {
        if ( ! ownsSingletonWork() ) {
            return;
        }

        const applicationId = client.application.id,
            hash = this.getCommandsHash( commands );

        // A registration that cannot be read counts as one that never happened: the price is sending
        // a set discord may already have, which is what every restart used to do.
        const registeredHash = await CommandsRegistrationModel.$.getRegisteredHash( applicationId )
            .catch( ( error ) => {
                this.logger.error( this.registerCommands, "", error );

                return null;
            } );

        if ( hash === registeredHash ) {
            this.logger.log( this.registerCommands, "Commands are unchanged since they were last registered" );

            return;
        }

        await client.application.commands.set( commands );

        // Not fatal when it fails: the next start sends the set once more, and nothing else happens.
        await CommandsRegistrationModel.$.setRegisteredHash( applicationId, hash )
            .catch( ( error ) => this.logger.error( this.registerCommands, "", error ) );

        this.logger.log( this.registerCommands, `Commands are registered, ${ commands.length } in all` );
    }

    /**
     * Function getCommandsHash() :: The command set, reduced to something that can be stored and
     * compared.
     *
     * `run` is a function and drops out of the JSON on its own. Permissions are bigints, which JSON
     * refuses outright, so they are written out as strings.
     */
    private getCommandsHash( commands: ICommand[] ) {
        const serialized = JSON.stringify( commands, ( _key, value ) =>
            "bigint" === typeof value ? value.toString() : value
        );

        return crypto.createHash( COMMANDS_HASH_ALGORITHM ).update( serialized ).digest( "hex" );
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
            // The guild cache is reported here rather than at startup because startup is the one
            // moment it cannot be read honestly: rest fetches are still landing, so a process can
            // look clean for no better reason than that its line printed early. Sampled every
            // thirty seconds it settles, and a count that keeps climbing is a process still being
            // handed guilds it was not sharded to hold.
            const byShard = new Map<number, number>();

            for ( const guild of this.client.guilds.cache.values() ) {
                byShard.set( guild.shardId, ( byShard.get( guild.shardId ) ?? 0 ) + 1 );
            }

            const breakdown = [ ... byShard ]
                .sort( ( [ a ], [ b ] ) => a - b )
                .map( ( [ shardId, count ] ) => `${ shardId }:${ count }` )
                .join( " " );

            this.logger.log(
                this.pingInterval,
                `Ping: ${ this.client.ws.ping }ms, guilds: ${ this.client.guilds.cache.size } ` +
                `(by shard - ${ breakdown || "none" })`
            );
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
