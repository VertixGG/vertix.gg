import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";

const LANGUAGE_KEY = "language";

const config = E2EConfig.$;

const guild = await PrismaBotClient.getPrismaClient().guild.findUnique( {
    where: { guildId: config.guildId },
    select: { id: true }
} );

// The value lives in `values`, not `value` - the data rows carry a string list and a scalar, and a
// language is written into the list. Reading the obvious column returns null and reads as "no
// language set", which is indistinguishable from english and exactly the wrong conclusion.
const stored = guild
    ? await PrismaBotClient.getPrismaClient().guildData.findFirst( {
        where: { ownerId: guild.id, key: LANGUAGE_KEY },
        select: { value: true, values: true }
    } )
    : null;

const language = stored?.values?.at( 0 ) ?? stored?.value ?? null;

process.stdout.write( JSON.stringify( { language } ) + "\n" );

process.exit( 0 );
