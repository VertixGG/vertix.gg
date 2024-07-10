import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ConfigBase  } from "@vertix.gg/base/src/bases/config-base";

import {
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_AUTOSAVE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE
} from "@vertix.gg/base/src/definitions/master-channel-data-keys";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

export class MasterChannelConfig extends ConfigBase<MasterChannelConfigInterface> {
    public static getName() {
        return "VertixBase/UI-V2/MasterChannelConfig";
    }

    public getConfigName() {
        return "Vertix/Config/MasterChannel";
    }

    public getVersion() {
        // UI-V2
        return "0.0.2" as const;
    }

    protected getDefaults() {
        const buttonsEmojis: MasterChannelConfigInterface["defaults"]["buttonsEmojis"] = {};

        DynamicChannelElementsGroup.getAll().forEach( async i => {
            buttonsEmojis[ i.getId() ] = await i.getEmoji();
        } );

        return {
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ]:
                uiUtilsWrapAsTemplate( "user" ) + "'s Channel",

            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ]:
                DynamicChannelElementsGroup.getAll().map( i => i.getId() ),

            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ]: true,

            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ]: [],

            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID ]: "",

            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_AUTOSAVE ]: false,

            buttonsEmojis,
        };
    }
}

export default MasterChannelConfig;
