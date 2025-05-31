import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { MasterChannelDataModelBase } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-base";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { MasterChannelDynamicConfigV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

export class MasterChannelDynamicDataModelV3 extends MasterChannelDataModelBase<MasterChannelDynamicConfigV3> {
    private static instance: MasterChannelDynamicDataModelV3;

    public static get $() {
        if ( !this.instance ) {
            this.instance = new MasterChannelDynamicDataModelV3();
        }

        return this.instance;
    }

    public static getName() {
        return "VertixBase/Models/MasterChannelDataV3";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", MasterChannelDynamicDataModelV3.getName() ),
            isDebugEnabled( "MODEL", MasterChannelDynamicDataModelV3.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V3;
    }

    protected getConfig() {
        return ConfigManager.$.get<MasterChannelDynamicConfigV3>( "Vertix/Config/MasterChannelDynamic", VERSION_UI_V3 );
    }
}
