import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { MasterChannelDataModelBase } from "@vertix.gg/base/src/models/data/base/master-channel-data-model-base";

import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { MasterChannelConfigInterface } from "src/interfaces/master-channel-config";

export class MasterChannelDataModel extends MasterChannelDataModelBase<MasterChannelConfigInterface> {
    private static instance: MasterChannelDataModel;

    public static get $() {
        if ( ! this.instance ) {
            this.instance = new MasterChannelDataModel();
        }

        return this.instance;
    }

    public static getName() {
        return "VertixBase/Models/MasterChannelDataModel";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", MasterChannelDataModel.getName() ),
            isDebugEnabled( "MODEL", MasterChannelDataModel.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }

    protected getConfig() {
        return ConfigManager.$
            .get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );
    }
}
