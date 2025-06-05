export {};

import * as PrismaModule from "../src/prisma-bot-client/index";

declare global {
    export import PrismaBot = PrismaModule;
}

export { PrismaModule as PrismaBot };

export { PrismaClient as PrismaBotClient } from "../src/prisma-bot-client/index";
