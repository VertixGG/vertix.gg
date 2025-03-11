import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ChannelDataModelBase } from "@vertix.gg/base/src/models/channel/channel-data-model-base";

import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";

export class ChannelDataModel extends ChannelDataModelBase {
    public static getName() {
        return "VertixBase/Models/ChannelData";
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
