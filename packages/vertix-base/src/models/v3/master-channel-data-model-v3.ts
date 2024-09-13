import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelDataOwnerStrictDataBase } from "@vertix.gg/base/src/bases/model-data-owner-strict-data-base";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type {
    MasterChannelConfigInterfaceV3,
    MasterChannelSettingsInterface
} from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";

const client = PrismaBotClient.$.getClient();

export class MasterChannelDataModelV3 extends ModelDataOwnerStrictDataBase<
    typeof client.channel,
    typeof client.channelData,
    PrismaBot.UserData,
    TDataOwnerDefaultUniqueKeys,
    MasterChannelSettingsInterface
> {
    private static instance: MasterChannelDataModelV3;

    private configV3 = ConfigManager.$
        .get<MasterChannelConfigInterfaceV3>( "Vertix/Config/MasterChannel", VERSION_UI_V3 );

    public static get $() {
        if ( ! this.instance ) {
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

    protected getModel() {
        return client.channel;
    }

    protected getDataModel() {
        return client.channelData;
    }

    protected getDataVersion() {
        return VERSION_UI_V3;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }

    protected getStrictDataFactor(): MasterChannelSettingsInterface {
        return this.configV3.get( "masterChannelSettings" );
    }

    public async getMaster( id: string ) {
        return await this.getWithMeta<MasterChannelSettingsInterface>( { where: { id } }, { key: "settings" }  );
    }

    public async getSettings( id: string ) {
        return await this.get( { where: { id } }, { key: "settings" } ) as Promise<MasterChannelSettingsInterface | undefined>;
    }

    /**
     * Function `setSettings()` - This method is used to set the settings of a MasterChannel.
     * It allows updating the settings while optionally assigning default values to any undefined settings.
     **/
    public async setSettings( id: string, settings: Partial<MasterChannelSettingsInterface>, assignDefaults = false ) {
        const queryArgs = { where: { id } },
            keys =  { key: "settings" };

        return assignDefaults ?
            await this.setStrictDataWithDefaults( queryArgs, keys, settings ) :
            await this.setStrictData( queryArgs, keys, settings );
    }

}
