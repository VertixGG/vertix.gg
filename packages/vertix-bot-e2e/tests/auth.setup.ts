import { test as setup } from "@playwright/test";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DiscordSession } from "@vertix.gg/bot-e2e/src/discord/discord-session";
import { assertAccountCanAdminister } from "@vertix.gg/bot-e2e/src/discord/account-check";

/**
 * The gate every other project waits behind.
 *
 * It either proves the saved session still works or opens a window for somebody to sign in. Nothing
 * downstream has to think about authentication again, and a scheduled run that finds a dead session
 * stops here with instructions rather than failing twenty feature tests on a login page.
 */
setup( "discord session is usable", async() => {
    setup.setTimeout( E2EConfig.$.interactiveLoginTimeoutMs + E2E_TIMEOUTS.APP_READY_MS * 2 );

    await DiscordSession.$.ensureAuthenticated();

    await assertAccountCanAdminister();
} );
