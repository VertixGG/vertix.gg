import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";

export class DynamicChannelDataManager extends ChannelDataManager {
    private static _instance: DynamicChannelDataManager;

    public static getName() {
        return "VertixBase/Managers/DynamicChannelData";
    }

    public static getInstance(): DynamicChannelDataManager {
        if ( ! DynamicChannelDataManager._instance ) {
            DynamicChannelDataManager._instance = new DynamicChannelDataManager();
        }
        return DynamicChannelDataManager._instance;
    }

    public static get $() {
        return DynamicChannelDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", DynamicChannelDataManager.getName() ) ) {
        super( shouldDebugCache );
    }
}
