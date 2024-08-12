import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

export interface MasterChannelSettingsInterface {
    dynamicChannelAutoSave: boolean;
    dynamicChannelButtonsTemplate: string[];
    dynamicChannelLogsChannelId: string | null;
    dynamicChannelMentionable: boolean;
    dynamicChannelNameTemplate: string;
    dynamicChannelVerifiedRoles: string[];
}

export interface MasterChannelDefaultsInterface {
    dynamicChannelStateVar: string;
    dynamicChannelUserVar: string;
    dynamicChannelsCategoryName: string;

    dynamicChannelStatePrivate: string;
    dynamicChannelStatePublic: string;

    masterChannelMaximumFreeChannels: number;
    masterChannelName: string;
}

export interface MasterChannelDefaultsInterfaceV3 extends MasterChannelDefaultsInterface {
    dynamicChannelPrimaryMessageTitle: string;
    dynamicChannelPrimaryMessageDescription: string;
}

export interface MasterChannelConfigInterface extends ConfigBaseInterface<{
    masterChannelDefaults: MasterChannelDefaultsInterface,
    masterChannelSettings: MasterChannelSettingsInterface,
}> {
}

export interface MasterChannelConfigInterfaceV3 extends ConfigBaseInterface<{
    masterChannelDefaults: MasterChannelDefaultsInterfaceV3,
    masterChannelSettings: MasterChannelSettingsInterface,
}> {
}
