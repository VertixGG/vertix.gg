import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

export interface MasterChannelScalingSettingsInterface {
    type: string
    maxMembersPerChannel: number
    categoryId: string | null
}

export interface MasterChannelScalingConstantsInterface {
    channelPrefixDefault: string
    masterScalingChannelName: string
}

export interface MasterChannelScalingConfigInterface
    extends ConfigBaseInterface<{
        constants: MasterChannelScalingConstantsInterface
        settings: MasterChannelScalingSettingsInterface
    }> {}

