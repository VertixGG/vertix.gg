/**
 * A standing "looking for members" post, as it survives a restart.
 *
 * Held in the database rather than only in memory, unlike the knock requests this feature was
 * otherwise modelled on. A knock is invisible and losing one costs somebody a second press; a post
 * is a message sitting in a channel other people read, and a process that forgets one leaves it
 * there advertising a room that may no longer exist, with nothing left that could ever take it
 * down.
 */
export interface IDynamicChannelLfmStoredPost {
    channelId: string;
    lfmChannelId: string;
    messageId: string;
    note: string | null;
    pingContent: string;
    expiresAt: number;
}

/**
 * How long a generator has to wait before any of its rooms may advertise again.
 *
 * Held against the master channel rather than the room that posted, because a room is disposable:
 * it is deleted the moment it empties, so a clock kept there is escaped by leaving and rejoining
 * the generator, which takes about fifteen seconds. The master channel is the thing a member
 * cannot get a fresh copy of.
 *
 * In the database rather than only in memory for the same reason the post is - a restart that
 * forgets it hands back a feature the generator was supposed to be resting from, which on a bot
 * that restarts on deploy is the difference between a cooldown and a suggestion.
 */
export interface IDynamicChannelLfmStoredCooldown {
    masterChannelId: string;
    until: number;
}

/**
 * When each destination channel may next be pinged, by channel id.
 *
 * Held against the generator that does the pinging, so the clock and the number that sets it sit
 * at the same level - a generator set to five minutes waits five minutes rather than inheriting a
 * window another generator started.
 */
export type TDynamicChannelLfmPingCooldowns = Record<string, number>;
