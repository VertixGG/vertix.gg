/**
 * @see https://discord.com/api/oauth2/authorize?client_id=1079487067932868608&permissions=8&scope=bot%20applications.commands
 */
import GlobalLogger from "@dynamico/global-logger";

import botInitialize from "./dynamico";
import Prisma from "./prisma";

function entryPoint() {
    GlobalLogger.getInstance().info( entryPoint, "Database is connected" );

    botInitialize();
}

Prisma.getConnectPromise().then( entryPoint );
