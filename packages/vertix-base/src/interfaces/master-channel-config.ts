import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";
import type { EMasterChannelType } from "@vertix.gg/base/src/definitions/master-channel";

export type TMasterChannelSettings = {
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

export type TMasterChannelDynamicSettings = Extract<TMasterChannelSettings, { type: EMasterChannelType.DYNAMIC }>;
export type TMasterChannelAutoScalingChannelSettings = Extract<TMasterChannelSettings, { type: EMasterChannelType.AUTO_SCALING }>;

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

export interface MasterChannelConfigInterface<T extends TMasterChannelSettings = TMasterChannelSettings>
    extends ConfigBaseInterface<{
        constants: MasterChannelConstantsInterface;
        settings: T;
    }> {}

export interface MasterChannelConfigInterfaceV3<T extends TMasterChannelSettings = TMasterChannelSettings>
    extends ConfigBaseInterface<{
        constants: MasterChannelConstantsInterfaceV3;
        settings: T;
    }> {}
