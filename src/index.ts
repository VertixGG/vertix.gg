/**
 * @see https://discord.com/developers/docs/topics/gateway#sharding-for-very-large-bots
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=8&scope=bot%20applications.commands - Vertix Administrator
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=286354576&scope=bot%20applications.commands - Vertix
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=286346264&scope=bot%20applications.commands - Vertix + Admin
 * @see https://discord.com/api/oauth2/authorize?client_id=1114586106491572254&permissions=286346264&scope=bot%20applications.commands - Vertix Test
 */
import path from "path";
import process from "process";

import { config } from "dotenv";

import GlobalLogger from "@vertix/global-logger";

function entryPoint() {
    GlobalLogger.$.info( entryPoint, "Database is connected" );

    import( "./vertix" ).then( ( { default: botInitialize } ) => {
        botInitialize().then( () => {
            GlobalLogger.$.info( entryPoint, "Bot is initialized" );
        } );
    } );
}

function main() {
    config( { path: path.join( process.cwd(), ".env" ) } );

    import( "./prisma" ).then( ( { PrismaInstance } ) => {
        PrismaInstance.$.connect().then( entryPoint );
    } );
}

Error.stackTraceLimit = Infinity;

setTimeout( main, 0 );
