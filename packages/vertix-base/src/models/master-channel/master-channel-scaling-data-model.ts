import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { MasterChannelDataModelBase } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-base";

import { VERSION_UI_V0 } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { MasterChannelScalingConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-scaling-config";

export class MasterChannelScalingDataModel extends MasterChannelDataModelBase<MasterChannelScalingConfigInterface> {
    private static instance: MasterChannelScalingDataModel;

    public static get $() {
        if ( !this.instance ) {
            this.instance = new MasterChannelScalingDataModel();
        }

        return this.instance;
    }

    public static getName() {
        return "VertixBase/Models/MasterChannelScalingData";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", MasterChannelScalingDataModel.getName() ),
            isDebugEnabled( "MODEL", MasterChannelScalingDataModel.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V0;
    }

    protected getConfig() {
        return ConfigManager.$.get<MasterChannelScalingConfigInterface>( "Vertix/Config/MasterChannelScaling", VERSION_UI_V0 );
    }
}

export default MasterChannelScalingDataModel;

