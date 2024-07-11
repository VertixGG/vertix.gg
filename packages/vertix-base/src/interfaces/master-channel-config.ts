import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

export interface MasterChannelDataInterface {
    dynamicChannelAutoSave: boolean;
    dynamicChannelButtonsTemplate: number[];
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

export interface MasterChannelConfigInterface extends ConfigBaseInterface<{
    masterChannelData: MasterChannelDataInterface,
    masterChannelDefaults: MasterChannelDefaultsInterface,
    buttonsIdsEmojisMap: { [ id: number ]: string },
}> {
}
