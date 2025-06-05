import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";
import type { EMasterChannelType } from "@vertix.gg/base/src/definitions/master-channel";

export type MasterChannelSettings = {
    type: EMasterChannelType.DYNAMIC;

    dynamicChannelAutoSave: boolean;
    dynamicChannelButtonsTemplate: string[];
    dynamicChannelLogsChannelId: string | null;
    dynamicChannelMentionable: boolean;
    dynamicChannelNameTemplate: string;
    dynamicChannelVerifiedRoles: string[];
} | {
    type: EMasterChannelType.AUTO_SCALING;

    scalingChannelMaxMembersPerChannel: number;
    scalingChannelCategoryId: string;
    scalingChannelPrefix: string;
};

export type MasterChannelDynamicSettings = Extract<MasterChannelSettings, { type: EMasterChannelType.DYNAMIC }>;
export type MasterChannelAutoScalingChannelSettings = Extract<MasterChannelSettings, { type: EMasterChannelType.AUTO_SCALING }>;

export interface MasterChannelDynamicConstants {
    dynamicChannelsCategoryName: string;

    dynamicChannelStatePrivate: string;
    dynamicChannelStatePublic: string;

    masterChannelMaximumFreeChannels: number;
    masterChannelName: string;
}

export interface MasterChannelConstantsV3 extends MasterChannelDynamicConstants {
    dynamicChannelPrimaryMessageTitle: string;
    dynamicChannelPrimaryMessageDescription: string;
}

export interface MasterChannelScalingConstants {
    masterChannelName: string
}

export interface MasterChannelDynamicConfig
    extends ConfigBaseInterface<{
        constants: MasterChannelDynamicConstants;
        settings: MasterChannelDynamicSettings;
    }> {}

export interface MasterChannelDynamicConfigV3
    extends ConfigBaseInterface<{
        constants: MasterChannelConstantsV3;
        settings: MasterChannelDynamicSettings;
    }> {}

export interface MasterChannelScalingConfig
    extends ConfigBaseInterface<{
        constants: MasterChannelScalingConstants;
        settings: MasterChannelAutoScalingChannelSettings;
    }> {}
