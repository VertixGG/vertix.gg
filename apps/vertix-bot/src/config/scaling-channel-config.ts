import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import type { ScalingChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

export const VERSION_SCALING_CHANNEL_UI_V1 = "0.0.0.1" as const;

export class ScalingChannelConfig extends ConfigBase<ScalingChannelConfigInterface> {
    public static getName() {
        return "VertixBase/Config/ScalingChannel";
    }

    public getConfigName() {
        return "Vertix/Config/ScalingChannel";
    }

    public getVersion() {
        return VERSION_SCALING_CHANNEL_UI_V1;
    }

    protected getDefaults(): ScalingChannelConfigInterface[ "defaults" ] {
        return {
            settings: {
                scalingChannelPrefix: "### Room - {index} ###",
                scalingChannelMaxMembersPerChannel: 10,
                scalingChannelMinAvailableChannels: 1,
                scalingChannelCategoryId: null
            },

            constants: {
                scalingChannelDefaultPrefix: "### Room - {index} ###",
                scalingChannelDefaultMaxMembers: 10,
                scalingChannelCategoryName: "༄ Auto Scaling Channels",
                masterChannelName: "⤢⤡ Join free channels"
            }
        };
    }
}

export default ScalingChannelConfig;
