import { test as setup } from "@playwright/test";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DiscordSession, secondMemberProfile } from "@vertix.gg/bot-e2e/src/discord/discord-session";

/**
 * Signs in the second member, and is never a dependency of anything.
 *
 * Most of the suite needs one account. A handful of features need two, because the bot is reacting to
 * two people rather than to one person twice - a claim opens only when the owner leaves a channel
 * somebody else is still in, a knock is answered by whoever owns the channel, a transfer needs a
 * recipient. Those tests skip themselves when this session is absent, so nobody is forced to keep a
 * second account to run the rest.
 *
 * Run it on purpose: `bun run vertix:bot:e2e:login:second`.
 */
setup( "second member session is usable", async() => {
    setup.setTimeout( E2EConfig.$.interactiveLoginTimeoutMs + E2E_TIMEOUTS.APP_READY_MS * 2 );

    await DiscordSession.$.ensureAuthenticated( secondMemberProfile() );
} );
