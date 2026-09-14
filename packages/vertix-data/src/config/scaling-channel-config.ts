import { ConfigBase } from "@vertix.gg/data/src/bases/config-base";

import type { ScalingChannelConfigInterface } from "@vertix.gg/data/src/interfaces/master-channel-config";

export const VERSION_SCALING_CHANNEL_UI_V1 = "0.0.0.1" as const;

export class ScalingChannelConfig extends ConfigBase<ScalingChannelConfigInterface> {
    public static getName() {
        return "VertixData/Config/ScalingChannel";
    }

    public getConfigName() {
        return "Vertix/Config/ScalingChannel";
    }

    public getVersion() {
        return VERSION_SCALING_CHANNEL_UI_V1;
    }

    protected getDefaults(): ScalingChannelConfigInterface[ "defaults" ] {
        return {
            // Copied into a generator's own row when it is created, and read from there
            // afterwards - which is also what makes this list the only thing a generator's row is
            // allowed to hold. Changing one reaches the generators made next, and none of the ones
            // already standing: they are carrying the answer they were given.
            scalingChannelPrefix: "### Room - {index} ###",
            scalingChannelMaxMembersPerChannel: 10,
            scalingChannelMinAvailableChannels: 1,
            scalingChannelCategoryId: null
        };
    }
}

export default ScalingChannelConfig;
