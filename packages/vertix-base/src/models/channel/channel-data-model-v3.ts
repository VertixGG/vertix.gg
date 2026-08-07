import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { ChannelDataModelBase } from "@vertix.gg/base/src/models/channel/channel-data-model-base";

export class ChannelDataModelV3 extends ChannelDataModelBase {
    public static getName() {
        return "VertixBase/Models/ChannelDataV3";
    }

    public constructor(
        showCacheDebug = isDebugEnabled( "CACHE", ChannelDataModelV3.getName() ),
        showModelDebug = isDebugEnabled( "MODEL", ChannelDataModelV3.getName() )
    ) {
        super( showCacheDebug, showModelDebug );
    }

    protected getDataVersion() {
        return VERSION_UI_V3;
    }
}
