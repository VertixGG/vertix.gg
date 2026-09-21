export const E2E_PATHS = {
    WORK_DIR: ".e2e",
    BROWSER_CACHE: ".e2e/cache",
    AUTH_STATE: ".e2e/auth/discord-state.json",
    AUTH_STATE_SECOND: ".e2e/auth/discord-state-second.json",
    CATALOG: ".e2e/catalog/bot-catalog.json",
    REPORT: ".e2e/report",
    RESULTS: ".e2e/results",
    LANGUAGE_SOURCE: "apps/vertix-bot/assets/languages/en.json"
} as const;

export const E2E_TIMEOUTS = {
    APP_READY_MS: 90_000,
    COMMAND_SEARCH_MS: 10_000,
    CHAT_VISIBLE_MS: 15_000,
    ACTION_MS: 15_000,
    BOT_REPLY_MS: 20_000,
    MODAL_OPEN_MS: 15_000,
    VOICE_CONNECT_MS: 30_000,
    DYNAMIC_CHANNEL_CREATE_MS: 30_000,
    // A channel is gone the moment its last member leaves - the bot deletes on `members.size === 0`
    // with nothing in between, and a probe watching a spaced deletion read 404 on its first poll.
    // The minutes this once waited were the deletions crowding each other, which is paced now at the
    // other end, in `DISCORD_LIMITS.CHANNEL_OPEN_SPACING_MS`.
    //
    // It has to stay well under `TEST_MS`, and the two were briefly the same number: a wait that can
    // use the whole budget leaves nothing for the opening and the pacing that come before it, so the
    // test died on its own clock rather than on this one, saying only that time ran out.
    CHANNEL_REMOVED_MS: 60_000,

    // The same wait for the two tests whose whole subject is the deletion, run late in a suite that
    // has been churning channels for an hour. Discord rate limits channel operations per guild and
    // the deletes queue behind one another, so the bot's request is made at once and carried out
    // minutes later - both channels that failed this way were gone by the time the run finished. A
    // minute is the right patience for a channel being tidied up beside the thing under test; it is
    // the wrong patience when the tidying up *is* the thing under test.
    CHANNEL_REMOVED_SLOW_MS: 150_000,
    GUILD_RESET_MS: 120_000,
    INTERACTIVE_LOGIN_MS: 300_000,
    // A claim is not offered when the owner leaves, but when the owner has been gone long enough and
    // the sweep has come round to notice. The suite asks for the floors `GUILD_TIMINGS_BOUNDS`
    // allows - thirty seconds away, looked for every ten - so the offer lands within forty seconds of
    // the owner going. The rest is margin, and nothing like the twenty seconds allowed for the bot
    // simply answering a press.
    //
    // This said the bot floored the timeout at a minute and handed back sixty for the five it was
    // asked. It does neither: a value under the floor is refused outright and the guild keeps the ten
    // minute default, which is what made this wait look too short for years of it being far too long.
    CLAIM_OFFER_MS: 150_000,

    // A vote is not answered, it runs out. The bot redraws the message the vote is drawn on until the
    // duration the guild chose has passed and only then announces a winner, so what this waits for is
    // that duration elapsing rather than the bot replying to anything.
    CLAIM_VOTE_MS: 90_000,

    TEST_MS: 180_000,
    EXPECT_MS: 20_000
} as const;

export const E2E_RETRIES = {
    COMMAND_SEARCH: 3,
    CHANNEL_OPEN: 2
} as const;

/**
 * The bot's own limits, mirrored because they are not exported.
 *
 * `MAX_TIMEOUT_PER_CREATE` in `master-channel-service.ts` refuses a member a second dynamic channel
 * within ten seconds of their last one, answering "you are requesting channel too fast" instead of
 * creating one - which a test reads as a channel that never appeared. Tests join generators far
 * faster than a person would, so the suite waits the bot out rather than arguing with it.
 *
 * If that constant moves, this is the place that has to move with it.
 */
export const BOT_LIMITS = {
    DYNAMIC_CHANNEL_CREATE_THROTTLE_MS: 10_000,
    CREATE_THROTTLE_MARGIN_MS: 2_000
} as const;

export const E2E_INTERVALS = {
    POLL_MS: 500,

    // Listing every channel in the guild is a far heavier question than asking after one, and asking
    // it twice a second earns a rate limit whose back-off looks exactly like the suite hanging.
    LIST_POLL_MS: 1_500,
    SETTLE_MS: 1_500
} as const;

export const DISCORD_URLS = {
    BASE: "https://discord.com",
    LOGIN: "https://discord.com/login",
    API: "https://discord.com/api/v10"
} as const;

export const DISCORD_LIMITS = {
    CHANNEL_NAME_MAX: 100,
    REST_RETRY_LIMIT: 3,

    /**
     * The least time to leave between opening one dynamic channel and opening the next.
     *
     * Opening one is also undertaking to delete one, and deleting is the limited half. Two in quick
     * succession are taken away at once; the third has waited minutes, while the same deletion on a
     * quiet guild is done before the first poll comes back.
     *
     * Thirty seconds is read off where the line fell rather than from anything discord publishes:
     * the specs whose tests take that long or more have never failed this way, and the one whose
     * tests take ten seconds failed at its third. Treat it as the shape of the limit, not its value.
     *
     * It costs a slow spec nothing - the gap has already passed by the time it asks - so what it
     * paces is the bursts, which is what needed pacing.
     */
    CHANNEL_OPEN_SPACING_MS: 30_000
} as const;
