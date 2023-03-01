/**
 * @see https://discord.com/api/oauth2/authorize?client_id=1079487067932868608&permissions=8&scope=bot%20applications.commands
 */
import Prisma from "./prisma";

import botInitialize from "./dynamico";

import GlobalLogger from "@dynamico/global-logger";

function entryPoint() {
    GlobalLogger.getInstance().info( entryPoint, "Database is connected" );

    botInitialize();
}

Prisma.getConnectPromise().then( entryPoint );
