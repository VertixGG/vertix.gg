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
 * What a generator reads live, rather than what it was given.
 *
 * The other half of a configuration is `settings`, which is copied into each generator's own row
 * at creation. Which of the two a value belongs in decides what happens when somebody changes it:
 * a global reaches every server at the next restart, a setting reaches only the generators made
 * after it.
 */
export interface MasterChannelGlobalsInterface {
    dynamicChannelsCategoryName: string;
    dynamicChannelControlChannelName: string;

    dynamicChannelStatePrivate: string;
    dynamicChannelStatePublic: string;

    masterChannelName: string;
}

export interface MasterChannelGlobalsInterfaceV3 extends MasterChannelGlobalsInterface {
    dynamicChannelPrimaryMessageTitle: string;
    dynamicChannelPrimaryMessageDescription: string;
}

export interface MasterChannelConfigInterface
    extends ConfigBaseInterface<{
        globals: MasterChannelGlobalsInterface;
        settings: MasterChannelSettingsInterface;
    }> {}

export interface MasterChannelConfigInterfaceV3
    extends ConfigBaseInterface<{
        globals: MasterChannelGlobalsInterfaceV3;
        settings: MasterChannelSettingsInterface;
    }> {}

export interface ScalingChannelSettingsInterface {
    scalingChannelPrefix: string;
    scalingChannelMaxMembersPerChannel: number;
    scalingChannelMinAvailableChannels: number;
    scalingChannelCategoryId: string | null;
}

export interface ScalingChannelGlobalsInterface {
    scalingChannelCategoryName: string;
    masterChannelName: string;
}

export interface ScalingChannelConfigInterface
    extends ConfigBaseInterface<{
        globals: ScalingChannelGlobalsInterface;
        settings: ScalingChannelSettingsInterface;
    }> {}
