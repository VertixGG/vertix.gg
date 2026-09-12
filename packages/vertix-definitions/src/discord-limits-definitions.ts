/**
 * The limits Discord itself enforces, kept here so the bot that hits them and the dashboard that
 * reports on them read the same number.
 */

/**
 * Discord allows this many channels inside one category, and a master channel keeps its generator,
 * its control panel and every dynamic channel it creates in the same one.
 */
export const DISCORD_CATEGORY_CHANNELS_LIMIT = 50;
