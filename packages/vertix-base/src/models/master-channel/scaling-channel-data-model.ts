import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { MasterChannelDataModelBase } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-base";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { ScalingChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

const VERSION_SCALING_CHANNEL_UI_V1 = "0.0.0.1" as const;

export class ScalingChannelDataModel extends MasterChannelDataModelBase<ScalingChannelConfigInterface> {
    private static instance: ScalingChannelDataModel;

    public static get $() {
        if ( !this.instance ) {
            this.instance = new ScalingChannelDataModel();
        }

        return this.instance;
    }

    public static getName() {
        return "VertixBase/Models/ScalingChannelData";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", ScalingChannelDataModel.getName() ),
            isDebugEnabled( "MODEL", ScalingChannelDataModel.getName() )
        );
    }

    public async getScalingSettings( ownerId: string, returnDefaults = true ) {
        return super.getSettings( ownerId, true, returnDefaults );
    }

    public async getAllScalingSettings() {
        const key = `${ this.getName() }/settings`;

        const results = await PrismaBotClient.$.getClient().channelData.findMany( {
            where: {
                key,
                version: this.getDataVersion()
            },
            include: {
                channel: true
            }
        } );

        return results.map( ( result ) => ( {
            masterChannel: result.channel,
            settings: result.object
        } ) );
    }

    public async setCategoryId( ownerId: string, categoryId: string | null ) {
        return this.setSettings( ownerId, { scalingChannelCategoryId: categoryId } );
    }

    public async setAllSettings( ownerId: string, settings: Partial<ScalingChannelConfigInterface[ "data" ][ "settings" ]> ) {
        return this.setSettings( ownerId, settings );
    }
    protected getDataVersion() {
        return VERSION_SCALING_CHANNEL_UI_V1;
    }

    protected getConfig() {
        return ConfigManager.$.get<ScalingChannelConfigInterface>(
            "Vertix/Config/ScalingChannel",
            VERSION_SCALING_CHANNEL_UI_V1
        );
    }
}
