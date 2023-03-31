/**
 * @see https://discord.com/developers/docs/topics/gateway#sharding-for-very-large-bots
 * @see https://discord.com/api/oauth2/authorize?client_id=1079487067932868608&permissions=286346256&scope=bot%20applications.commands - LegendAI
 * @see https://discord.com/api/oauth2/authorize?client_id=1091272387493908561&permissions=286346256&scope=bot%20applications.commands - Ancient AI
 */

import botInitialize from "./dynamico";
import Prisma from "./prisma";

import GlobalLogger from "@dynamico/global-logger";

function entryPoint() {
    GlobalLogger.getInstance().info( entryPoint, "Database is connected" );

    botInitialize();
}

Prisma.getConnectPromise().then( entryPoint );
