import { channelDataManager } from "@dynamico/managers";
import { DATA_CHANNEL_KEY_SETTINGS } from "@dynamico/constants/data";

export const masterChannelGetSettingsData = async ( ownerId: string, defaultSettings: any ) => {
    return await channelDataManager.getData( {
        ownerId,
        key: DATA_CHANNEL_KEY_SETTINGS,
        cache: true,
        default: defaultSettings,
    } );
};

export const masterChannelSetSettingsData = async ( ownerId: string, settings: any ) => {
    return await channelDataManager.setData( {
        ownerId,
        key: DATA_CHANNEL_KEY_SETTINGS,
        default: settings
    } );
};
