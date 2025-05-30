import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

export interface MasterChannelSettingsInterface {
    dynamicChannelAutoSave: boolean;
    dynamicChannelButtonsTemplate: string[];
    dynamicChannelLogsChannelId: string | null;
    dynamicChannelMentionable: boolean;
    dynamicChannelNameTemplate: string;
    dynamicChannelVerifiedRoles: string[];
    type?: string;
    maxMembersPerChannel?: number;
    categoryId?: string;
}

export interface MasterChannelConstantsInterface {
    dynamicChannelsCategoryName: string;

    dynamicChannelStatePrivate: string;
    dynamicChannelStatePublic: string;

    masterChannelMaximumFreeChannels: number;
    masterChannelName: string;
}

export interface MasterChannelConstantsInterfaceV3 extends MasterChannelConstantsInterface {
    dynamicChannelPrimaryMessageTitle: string;
    dynamicChannelPrimaryMessageDescription: string;
}

export interface MasterChannelConfigInterface
    extends ConfigBaseInterface<{
        constants: MasterChannelConstantsInterface;
        settings: MasterChannelSettingsInterface;
    }> {}

export interface MasterChannelConfigInterfaceV3
    extends ConfigBaseInterface<{
        constants: MasterChannelConstantsInterfaceV3;
        settings: MasterChannelSettingsInterface;
    }> {}
