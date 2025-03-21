import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { MasterChannelDataModelBase } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-base";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

export class MasterChannelDataModelV3 extends MasterChannelDataModelBase<MasterChannelConfigInterfaceV3> {
    private static instance: MasterChannelDataModelV3;

    public static get $() {
        if ( !this.instance ) {
            this.instance = new MasterChannelDataModelV3();
        }

        return this.instance;
    }

    public static getName() {
        return "VertixBase/Models/MasterChannelDataV3";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", MasterChannelDataModelV3.getName() ),
            isDebugEnabled( "MODEL", MasterChannelDataModelV3.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V3;
    }

    protected getConfig() {
        return ConfigManager.$.get<MasterChannelConfigInterfaceV3>( "Vertix/Config/MasterChannel", VERSION_UI_V3 );
    }
}
