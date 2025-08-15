import { VERSION_UI_UNSPECIFIED } from "@vertix.gg/base/src/definitions/version";

import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import { EMasterChannelType } from "@vertix.gg/base/src/definitions/master-channel";

import type { MasterChannelScalingConfig as MasterChannelScalingConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

export class MasterChannelScalingConfig extends ConfigBase<MasterChannelScalingConfigInterface> {
    public static getName() {
        return "Vertix/Config/MasterChannelScaling";
    }

    public getConfigName() {
        return "Vertix/Config/MasterChannelScaling";
    }

    public getVersion() {
        return VERSION_UI_UNSPECIFIED;
    }

    protected getDefaults(): MasterChannelScalingConfigInterface["defaults"] {
        return {
            settings: {
                type: EMasterChannelType.AUTO_SCALING,

                scalingChannelMaxMembersPerChannel: 10,
                scalingChannelCategoryId: "",
                scalingChannelPrefix: ""
            },

            constants: {
                masterChannelName: "Auto Scaling Master"
            }
        };
    }
}

export default MasterChannelScalingConfig;
