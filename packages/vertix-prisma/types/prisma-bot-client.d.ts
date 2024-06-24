export {};

import * as Prisma from "../src/prisma-bot-client/index";

declare global {
    namespace globalThis {
        export import PrismaBot = Prisma;
    }
}

export { PrismaBot }
