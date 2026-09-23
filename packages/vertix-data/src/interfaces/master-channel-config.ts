import type { ConfigBaseInterface } from "@vertix.gg/data/src/bases/config-base";

/**
 * What a dynamic channel starts as. `hidden` is public plus not visible, which is how the privacy
 * button already models the three states.
 */
export type ChannelPrivacyStateDefault = "public" | "private" | "hidden";

export interface MasterChannelSettingsInterface {
    dynamicChannelAutoSave: boolean;
    /**
     * Whether the bot composes the voice channel status out of the channel state on its own.
     *
     * Off leaves the status to the owner alone, through the status button, and the bot writes
     * nothing of its own.
     */
    dynamicChannelAutoStatus: boolean;
    dynamicChannelDefaultPrivacyState: ChannelPrivacyStateDefault;
    dynamicChannelDefaultUserLimit: number | null;
    dynamicChannelButtonsTemplate: string[];
    dynamicChannelButtonsTemplateByRole?: Record<string, string[]>;
    /**
     * Where `dynamicChannelButtonsTemplate` is divided into rows - each entry is the index a row
     * starts at. Absent or empty means the set has no arrangement of its own and is drawn in rows
     * of five, which is how every generator behaved before rows could be arranged.
     */
    dynamicChannelButtonsRowBreaks?: number[];
    dynamicChannelControlChannelId: string | null;
    /**
     * The panel message itself, so it can be edited without being searched for.
     *
     * Redrawing the panel used to mean fetching a hundred messages out of the control channel and
     * picking the bot's earliest - a REST call per generator, on every restart, to rediscover
     * something that never moves. Remembering the id makes it one fetch by id, and it is written
     * back whenever the search or a fresh send establishes it, so a generator pays for the search
     * at most once.
     *
     * Null is not an error: it means nobody has established it yet. A stale id is not either - the
     * message can be deleted by hand - which is why the search is kept as the fallback rather than
     * removed.
     */
    dynamicChannelControlMessageId: string | null;
    /**
     * What the panel was last drawn with, hashed together with the channel it was drawn in.
     *
     * Startup redrew every panel on every restart - a fetch and an edit per generator - whether or
     * not anything on it had changed. A panel whose drawing still hashes to this is left alone, so a
     * restart costs discord nothing for it, and anything that changes the drawing - its buttons, its
     * text, its language, its customization, the channel it lives in - changes the hash and redraws.
     *
     * Written together with the id above, and only after the panel was actually drawn.
     */
    dynamicChannelControlMessageHash: string | null;
    dynamicChannelLfmChannelIds?: string[];
    /**
     * The roles an lfm post is allowed to mention, chosen by an admin.
     *
     * Empty is the default and means no post ever pings. A member picks the destination but never
     * the audience - a ping is the loudest thing the bot does on somebody else's behalf.
     */
    dynamicChannelLfmPingRoleIds?: string[];
    /**
     * The clocks this generator's lfm posts run on, in milliseconds.
     *
     * Absent means the generator never chose, and the shared fallback answers instead - which is
     * why these are optional rather than defaulted here: a generator that is following the default
     * should keep following it when the default moves.
     */
    dynamicChannelLfmPostCooldownMs?: number;
    dynamicChannelLfmPingCooldownMs?: number;
    dynamicChannelLfmPostExpiryMs?: number;
    dynamicChannelLfmOccupancyDebounceMs?: number;
    dynamicChannelLogsChannelId: string | null;
    dynamicChannelMentionable: boolean;
    dynamicChannelNameTemplate: string;
    dynamicChannelStaffRoles: string[];
    dynamicChannelVerifiedRoles: string[];
    dynamicChannelVoiceRoleId: string | null;
}

/**
 * A generator's configuration is the settings it is created with, and nothing else.
 *
 * That is not only a grouping: the same list is the whitelist `setStrictData()` filters a write
 * through, so what the configuration carries is exactly what a generator's own row may hold. The
 * names the bot gives what it creates used to sit beside it and are their own configuration now.
 */
export interface MasterChannelConfigInterface extends ConfigBaseInterface<MasterChannelSettingsInterface> {}

export interface MasterChannelConfigInterfaceV3 extends ConfigBaseInterface<MasterChannelSettingsInterface> {}

export interface ScalingChannelSettingsInterface {
    scalingChannelPrefix: string;
    scalingChannelMaxMembersPerChannel: number;
    scalingChannelMinAvailableChannels: number;
    scalingChannelCategoryId: string | null;
}

export interface ScalingChannelConfigInterface extends ConfigBaseInterface<ScalingChannelSettingsInterface> {}
