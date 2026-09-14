import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";

import { VERSION_NAMING_CONFIG_V1 } from "@vertix.gg/data/src/config/naming-config";

import type { NamingConfigInterface } from "@vertix.gg/data/src/interfaces/naming-config";

/**
 * Function `getNaming()` :: What the bot calls the things it makes.
 *
 * Asked for where it is needed rather than held, because a configuration is read from its row when
 * the bot starts and answers the same thing for the rest of the run.
 */
export function getNaming() {
    return ConfigManager.$.get<NamingConfigInterface>( "Vertix/Config/Naming", VERSION_NAMING_CONFIG_V1 ).data;
}
