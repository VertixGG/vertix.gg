import type { ConfigBaseInterface } from "@vertix.gg/data/src/bases/config-base";

/**
 * What the bot calls the things it makes, and the marks it puts on them.
 *
 * One value each for the whole bot rather than one per generator, which is what separates these
 * from a generator's own settings: a generator carries its settings in its own row and answers
 * with them, while these are read from here every time something is created or renamed.
 *
 * Read live, but most of them are only ever read while creating something - a category, a control
 * panel, a generator channel - so changing one of those names reaches the next setup rather than
 * the ones already standing, whose names live in discord by then. The two prefixes and the primary
 * message pair are the exception: they are read on every rename and every panel, so a change
 * reaches every channel that already exists.
 */
export interface NamingConfigDefaultsInterface {
    dynamicChannelsCategoryName: string;
    dynamicChannelControlPanelName: string;
    dynamicChannelGeneratorName: string;

    /** Prefixed onto a dynamic channel's name while it is private, and while it is public. */
    dynamicChannelPrivatePrefix: string;
    dynamicChannelPublicPrefix: string;

    /** What the v3 panel says when its owner has written nothing of their own. */
    dynamicChannelPrimaryMessageTitle: string;
    dynamicChannelPrimaryMessageDescription: string;

    scalingChannelsCategoryName: string;
    scalingChannelGeneratorName: string;
}

export interface NamingConfigInterface extends ConfigBaseInterface<NamingConfigDefaultsInterface> {}
