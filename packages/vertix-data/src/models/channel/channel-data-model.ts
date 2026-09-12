import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import { ChannelDataModelBase } from "@vertix.gg/data/src/models/channel/channel-data-model-base";

export class ChannelDataModel extends ChannelDataModelBase {
    public static getName() {
        return "VertixData/Models/ChannelData";
    }

    public constructor(
        showCacheDebug = isDebugEnabled( "CACHE", ChannelDataModel.getName() ),
        showModelDebug = isDebugEnabled( "MODEL", ChannelDataModel.getName() )
    ) {
        super( showCacheDebug, showModelDebug );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }
}
