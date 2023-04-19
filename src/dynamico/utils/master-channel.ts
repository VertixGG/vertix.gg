import { channelDataManager } from "@dynamico/managers";

import { DATA_CHANNEL_KEY_SETTINGS } from "@dynamico/constants/data";
import {
    DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
    DEFAULT_DATA_MASTER_CHANNEL_SETTINGS
} from "@dynamico/constants/master-channel";

export const masterChannelGetSettingsData = async ( ownerId: string, defaultSettings: any ) => {
    return await channelDataManager.getData( {
        ownerId,
        key: DATA_CHANNEL_KEY_SETTINGS,
        cache: true,
        default: defaultSettings,
    } );
};

export const masterChannelGetDynamicChannelNameTemplate = async ( ownerId: string, returnDefault?: boolean ) => {
    const result = await masterChannelGetSettingsData( ownerId, DEFAULT_DATA_MASTER_CHANNEL_SETTINGS ),
        name = result?.object?.dynamicChannelNameTemplate;

    if ( ! name && returnDefault ) {
        return DEFAULT_DATA_DYNAMIC_CHANNEL_NAME;
    }

    return name;
};

export const masterChannelSetSettingsData = async ( ownerId: string, settings: any ) => {
    return await channelDataManager.setData( {
        ownerId,
        key: DATA_CHANNEL_KEY_SETTINGS,
        default: settings
    } );
};
