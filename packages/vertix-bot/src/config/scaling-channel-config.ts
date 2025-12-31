import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import type { ScalingChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

export const VERSION_SCALING_CHANNEL = "0.0.0.1" as const;

export class ScalingChannelConfig extends ConfigBase<ScalingChannelConfigInterface> {
    public static getName() {
        return "VertixBase/Config/ScalingChannel";
    }

    public getConfigName() {
        return "Vertix/Config/ScalingChannel";
    }

    public getVersion() {
        return VERSION_SCALING_CHANNEL;
    }

    protected getDefaults(): ScalingChannelConfigInterface["defaults"] {
        return {
            settings: {
                scalingChannelPrefix: "Voice",
                scalingChannelMaxMembersPerChannel: 10,
                scalingChannelCategoryId: null
            },

            constants: {
                scalingChannelDefaultPrefix: "Voice",
                scalingChannelDefaultMaxMembers: 10,
                scalingChannelCategoryName: "༄ Auto Scaling Channels",
                masterChannelName: "➕ Join to Create"
            }
        };
    }
}

export default ScalingChannelConfig;

