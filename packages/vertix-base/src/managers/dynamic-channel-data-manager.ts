import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";

export class DynamicChannelDataManager extends ChannelDataManager {
    public static getName() {
        return "VertixBase/Managers/DynamicChannelData";
    }

    public static get $() {
        return DynamicChannelDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", DynamicChannelDataManager.getName() ) ) {
        super( shouldDebugCache );
    }
}
