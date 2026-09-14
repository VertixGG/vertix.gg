import { ConfigBase } from "@vertix.gg/data/src/bases/config-base";

import type { NamingConfigInterface } from "@vertix.gg/data/src/interfaces/naming-config";

export const VERSION_NAMING_CONFIG_V1 = "0.0.0.1" as const;

/**
 * Class `NamingConfig` - The names the bot gives what it creates.
 *
 * Versioned on its own because none of it describes a generator: v2 and v3 called these the same
 * things, and held a copy each to do it - the only difference between the two sets was that v3
 * also carried the panel's own wording, which is here too and which a v2 generator never asks for.
 */
export class NamingConfig extends ConfigBase<NamingConfigInterface> {
    public static getName() {
        return "VertixData/Config/Naming";
    }

    public getConfigName() {
        return "Vertix/Config/Naming";
    }

    public getVersion() {
        return VERSION_NAMING_CONFIG_V1;
    }

    protected getDefaults(): NamingConfigInterface[ "defaults" ] {
        return {
            dynamicChannelsCategoryName: "༄ Dynamic Channels",
            dynamicChannelControlPanelName: "✨・control-panel",
            dynamicChannelGeneratorName: "➕ New Channel",

            dynamicChannelPrivatePrefix: "🔴",
            dynamicChannelPublicPrefix: "🟢",

            dynamicChannelPrimaryMessageTitle: "༄ Manage your Dynamic Channel",
            dynamicChannelPrimaryMessageDescription:
                "Embrace the responsibility of overseeing your dynamic channel," +
                "diligently customizing it according to your discerning preferences.\n\n" +
                "Please be advised that the privilege to make alterations is vested solely of the channel owner.",

            scalingChannelsCategoryName: "༄ Auto Scaling Channels",
            scalingChannelGeneratorName: "⤢⤡ Join free channels"
        };
    }
}

export default NamingConfig;
