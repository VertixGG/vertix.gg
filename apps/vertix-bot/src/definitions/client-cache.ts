import { Options } from "discord.js";

import type {
    CacheFactory,
    ClientOptions,
    Guild,
    GuildMember,
    Presence,
    User
} from "discord.js";

/**
 * Bounds for the discord.js caches the bot leaves unbounded by default.
 *
 * discord.js 14 ships `{ MessageManager: 200 }` as its only cache limit and `{ threads: ... }` as
 * its only sweeper, so `UserManager`, `GuildMemberManager` and `PresenceManager` are plain
 * Collections that are never swept. With `GuildPresences` on the main client and `GuildMembers` on
 * the AI one, that makes the process' memory a function of *every distinct user seen since the last
 * restart* rather than of how many are active now - a curve with no ceiling, on a box that is not
 * restarted on a schedule.
 *
 * These are ceilings, not targets. They exist so the number stops growing, not to make it small.
 */
export const CLIENT_CACHE_MAX_USERS = 10_000;

export const CLIENT_CACHE_MAX_GUILD_MEMBERS = 10_000;

export const CLIENT_CACHE_MAX_PRESENCES = 10_000;

/**
 * Lower than the discord.js default of 200.
 *
 * Nothing reads a message out of this cache: `refreshControlPanel()` pulls the control panel with
 * `messages.fetch( { limit: 100 } )`, and a fetch builds its own Collection from the API response -
 * the cache limit is a side effect of storing them, not a cap on what comes back. So this only
 * needs to be large enough for the edit-after-fetch that follows.
 */
export const CLIENT_CACHE_MAX_MESSAGES_PER_CHANNEL = 50;

/**
 * Presences are swept most often because they are the firehose: a `PRESENCE_UPDATE` arrives for
 * every status, activity and custom-status change in every guild, and each one caches a Presence
 * plus a User. Members are swept on a longer interval because evicting one is more disruptive, and
 * users longest because a User is small and widely referenced.
 */
export const CLIENT_SWEEP_PRESENCES_INTERVAL_SECONDS = 900;

export const CLIENT_SWEEP_GUILD_MEMBERS_INTERVAL_SECONDS = 1_800;

export const CLIENT_SWEEP_USERS_INTERVAL_SECONDS = 3_600;

export const CLIENT_SWEEP_MESSAGES_INTERVAL_SECONDS = 600;

export const CLIENT_SWEEP_MESSAGES_LIFETIME_SECONDS = 1_800;

/**
 * Whether this entry is the bot's own.
 *
 * Every filter here has to answer this. `Sweepers` does not protect the client's own member or user
 * - `sweepGuildMembers()` only advises that you keep it - and `guild.members.me` is what
 * `isRoleAssignable()` and every permission check read, so sweeping it away breaks the voice role
 * silently rather than loudly.
 */
function isClientItself( item: User | GuildMember ): boolean {
    return item.id === item.client.user?.id;
}

/**
 * Whether discord currently has this user in a voice channel.
 *
 * Asked of the guild's voice states rather than of `member.voice`, because the voice state cache is
 * the thing the gateway actually maintains; `member.voice` is a lookup into it that constructs an
 * empty `VoiceState` on a miss. Reading the source directly also means a member that has already
 * been swept does not make its own presence look sweepable.
 */
function isInVoice( guild: Guild | null, userId: string ): boolean {
    return !! guild?.voiceStates.cache.get( userId )?.channelId;
}

/**
 * Function createClientCacheFactory() :: Ceilings for the managers discord.js leaves unbounded.
 *
 * `GuildManager`, `ChannelManager`, `GuildChannelManager`, `RoleManager` and
 * `PermissionOverwriteManager` are deliberately absent: discord.js documents that overriding those
 * **will** break functionality, and the bot reads all five constantly.
 *
 * The managers set to `0` are the ones nothing in this repo touches - a search for each of
 * `bans`, `stickers`, `scheduledEvents`, `autoModerationRules`, `invites` and `threads` returns no
 * reader. `GuildEmojiManager` is *not* among them: emoji are read in 28 places.
 */
export function createClientCacheFactory(): CacheFactory {
    return Options.cacheWithLimits( {
        ... Options.DefaultMakeCacheSettings,

        // `keepOverLimit` exempts an entry from eviction rather than reserving room for it, so the
        // ceiling here only ever applies to members nobody is currently looking at. Members in
        // voice are exempt because 30 of the 36 `members.cache.get()` call sites in the bot have no
        // `fetch` fallback - an evicted member is not a slower read there, it is an undefined.
        GuildMemberManager: {
            maxSize: CLIENT_CACHE_MAX_GUILD_MEMBERS,
            keepOverLimit: ( member: GuildMember ) =>
                isClientItself( member ) || isInVoice( member.guild, member.id )
        },

        // The only reader is `top-gg-manager.ts`, which already falls back to "Unknown", so this
        // one can be evicted freely.
        UserManager: {
            maxSize: CLIENT_CACHE_MAX_USERS,
            keepOverLimit: ( user: User ) => isClientItself( user )
        },

        // Every presence read in the bot - the game name on a dynamic channel's status - is about
        // somebody sitting in a voice channel, so a presence for anyone else is being stored and
        // never looked at.
        PresenceManager: {
            maxSize: CLIENT_CACHE_MAX_PRESENCES,
            keepOverLimit: ( presence: Presence ) =>
                isInVoice( presence.guild, presence.userId )
        },

        MessageManager: CLIENT_CACHE_MAX_MESSAGES_PER_CHANNEL,

        AutoModerationRuleManager: 0,
        GuildBanManager: 0,
        GuildInviteManager: 0,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0
    } );
}

/**
 * Function createClientSweepers() :: What actually returns memory.
 *
 * A ceiling stops a cache growing; only a sweeper gives anything back. The two are not
 * interchangeable - a cache sitting under its ceiling forever still holds everything it ever saw.
 *
 * The default `threads` sweeper is kept rather than replaced, which is what `DefaultSweeperSettings`
 * is spread in for.
 */
export function createClientSweepers(): ClientOptions[ "sweepers" ] {
    return {
        ... Options.DefaultSweeperSettings,

        presences: {
            interval: CLIENT_SWEEP_PRESENCES_INTERVAL_SECONDS,
            filter: () => ( presence: Presence ) =>
                ! isInVoice( presence.guild, presence.userId )
        },

        guildMembers: {
            interval: CLIENT_SWEEP_GUILD_MEMBERS_INTERVAL_SECONDS,
            filter: () => ( member: GuildMember ) =>
                ! isClientItself( member ) && ! isInVoice( member.guild, member.id )
        },

        users: {
            interval: CLIENT_SWEEP_USERS_INTERVAL_SECONDS,
            filter: () => ( user: User ) => ! isClientItself( user )
        },

        messages: {
            interval: CLIENT_SWEEP_MESSAGES_INTERVAL_SECONDS,
            lifetime: CLIENT_SWEEP_MESSAGES_LIFETIME_SECONDS
        }
    };
}
