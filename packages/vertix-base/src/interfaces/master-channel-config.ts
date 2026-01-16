import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

export interface MasterChannelSettingsInterface {
    dynamicChannelAutoSave: boolean;
    dynamicChannelButtonsTemplate: string[];
    dynamicChannelButtonsTemplateByRole?: Record<string, string[]>;
    dynamicChannelControlChannelId: string | null;
    dynamicChannelLogsChannelId: string | null;
    dynamicChannelMentionable: boolean;
    dynamicChannelNameTemplate: string;
    dynamicChannelVerifiedRoles: string[];
}

export interface MasterChannelConstantsInterface {
    dynamicChannelsCategoryName: string;
    dynamicChannelControlChannelName: string;

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

export interface ScalingChannelSettingsInterface {
    scalingChannelPrefix: string;
    scalingChannelMaxMembersPerChannel: number;
    scalingChannelMinAvailableChannels: number;
    scalingChannelCategoryId: string | null;
}

export interface ScalingChannelConstantsInterface {
    scalingChannelDefaultPrefix: string;
    scalingChannelDefaultMaxMembers: number;
    scalingChannelCategoryName: string;
    masterChannelName: string;
}

export interface ScalingChannelConfigInterface
    extends ConfigBaseInterface<{
        constants: ScalingChannelConstantsInterface;
        settings: ScalingChannelSettingsInterface;
    }> {}
