import { VERSION_UI_V0 } from "@vertix.gg/base/src/definitions/version";
import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import type { MasterChannelScalingConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-scaling-config";

class MasterChannelScalingConfig extends ConfigBase<MasterChannelScalingConfigInterface> {
    public static getName() {
        return "VertixBase/UI-V3/MasterChannelScalingConfig";
    }

    public getConfigName() {
        return "Vertix/Config/MasterChannelScaling";
    }

    public getVersion() {
        return VERSION_UI_V0;
    }

    protected getDefaults(): MasterChannelScalingConfigInterface["defaults"] {
        return {
            constants: {
                channelPrefixDefault: "Team",
                masterScalingChannelName: "➕ Master Scaling"
            },
            settings: {
                type: "auto-scaling",
                maxMembersPerChannel: 5,
                categoryId: null
            }
        };
    }
}

export default MasterChannelScalingConfig;

