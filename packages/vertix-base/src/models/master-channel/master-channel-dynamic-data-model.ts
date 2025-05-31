import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { MasterChannelDataModelBase } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-base";

import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { MasterChannelDynamicConfig } from "@vertix.gg/base/src/interfaces/master-channel-config";

export class MasterChannelDynamicDataModel extends MasterChannelDataModelBase<MasterChannelDynamicConfig> {
    private static instance: MasterChannelDynamicDataModel;

    public static get $() {
        if ( !this.instance ) {
            this.instance = new MasterChannelDynamicDataModel();
        }

        return this.instance;
    }

    public static getName() {
        return "VertixBase/Models/MasterChannelDataModel";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", MasterChannelDynamicDataModel.getName() ),
            isDebugEnabled( "MODEL", MasterChannelDynamicDataModel.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }

    protected getConfig() {
        return ConfigManager.$.get<MasterChannelDynamicConfig>( "Vertix/Config/MasterChannelDynamic", VERSION_UI_V2 );
    }
}
