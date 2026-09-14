import { ConfigBase } from "@vertix.gg/data/src/bases/config-base";

import type { GuildConfigInterface } from "@vertix.gg/data/src/interfaces/guild-config";

export const VERSION_GUILD_CONFIG_V1 = "0.0.0.1" as const;

/**
 * Class `GuildConfig` - What every guild falls back to.
 *
 * Versioned on its own rather than with the interfaces: nothing here describes a generator, so a
 * guild's allowance does not change because its generators were built on a newer screen.
 *
 * A guild that was granted something of its own carries it in its own settings row, which is read
 * first; this is what the rest get. Overriding the number for every guild at once is done in the
 * overrides row, the way any other configuration is changed.
 */
export class GuildConfig extends ConfigBase<GuildConfigInterface> {
    public static getName() {
        return "VertixData/Config/Guild";
    }

    public getConfigName() {
        return "Vertix/Config/Guild";
    }

    public getVersion() {
        return VERSION_GUILD_CONFIG_V1;
    }

    protected getDefaults(): GuildConfigInterface[ "defaults" ] {
        return {
            constants: {
                masterChannelMaximumFreeChannels: 2
            }
        };
    }
}

export default GuildConfig;
