import type { ConfigBaseInterface } from "@vertix.gg/data/src/bases/config-base";

/**
 * What a guild is allowed, before any guild has been granted anything else.
 *
 * Guild wide rather than per generator, and so not in either master channel config: a generator's
 * configuration is version shaped - v2 and v3 each hold their own - while an allowance is counted
 * across every setup a guild has, of either kind. Held there, the same number had to be written
 * twice and only one of the two was ever read.
 */
export interface GuildGlobalsInterface {
    /** How many generators a guild may have, counting both kinds together. */
    masterChannelMaximumFreeChannels: number;
}

export interface GuildConfigInterface
    extends ConfigBaseInterface<{
        globals: GuildGlobalsInterface;
    }> {}
