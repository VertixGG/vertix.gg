/**
 * @see https://discord.com/developers/docs/topics/gateway#sharding-for-very-large-bots
 * @see https://discord.com/api/oauth2/authorize?client_id=1091272387493908561&permissions=286346256&scope=bot%20applications.commands - Dynamico Beta
 * @see https://discord.com/api/oauth2/authorize?client_id=1079487067932868608&permissions=286346256&scope=bot%20applications.commands - LegendAI
 */
import path from "path";
import process from "process";

import dotenv from "dotenv";

import GlobalLogger from "@dynamico/global-logger";

function entryPoint() {
    GlobalLogger.$.info( entryPoint, "Database is connected" );

    import( "./dynamico" ).then( ( { default: botInitialize } ) => {
        botInitialize().then( () => {
            GlobalLogger.$.info( entryPoint, "Bot is initialized" );
        } );
    } );
}

function main() {
    dotenv.config( { path: path.join( process.cwd(), ".env" ) } );

    //GlobalLogger.$.info( main, "Environment variables are loaded:", process.env );

    import( "./prisma" ).then( ( { PrismaInstance } ) => {
        PrismaInstance.$.connect().then( entryPoint );
    } );
}

console.log( "Starting..."  );

setTimeout( main, 0 );
