/**
 * The limits Discord itself enforces, kept here so the code that runs into one and the message that
 * explains it to a member read the same number.
 */

/**
 * Discord allows this many channels inside one category, and a master channel keeps its generator,
 * its control panel and every dynamic channel it creates in the same one.
 */
export const DISCORD_CATEGORY_CHANNELS_LIMIT = 50;

/** The most characters an embed's description holds. */
export const DISCORD_EMBED_DESCRIPTION_LIMIT = 4096;

/** The most members one request for a scheduled event's "Interested" list returns. */
export const DISCORD_SCHEDULED_EVENT_SUBSCRIBERS_PAGE_LIMIT = 100;
