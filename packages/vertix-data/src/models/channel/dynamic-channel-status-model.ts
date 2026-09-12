import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import { ChannelDataModelBase } from "@vertix.gg/data/src/models/channel/channel-data-model-base";

const DYNAMIC_CHANNEL_STATUS_DATA_KEY = "DynamicChannelStatus/Custom";

/**
 * Holds the owner-defined voice channel status of a dynamic channel.
 *
 * @note Absence of an entry means the status is composed automatically from the channel state,
 * the presence of one means the owner pinned it and the automatic writer stands down.
 */
export class DynamicChannelStatusModel extends ChannelDataModelBase {
    private static instance: DynamicChannelStatusModel;

    public static getName() {
        return "VertixData/Models/DynamicChannelStatus";
    }

    public static get $() {
        if ( !this.instance ) {
            this.instance = new DynamicChannelStatusModel();
        }

        return this.instance;
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", DynamicChannelStatusModel.getName() ),
            isDebugEnabled( "MODEL", DynamicChannelStatusModel.getName() )
        );
    }

    public async getCustomStatus( channelDBId: string ): Promise<string | null> {
        const result = await this.dataGet<string>( {
            ownerId: channelDBId,
            key: DYNAMIC_CHANNEL_STATUS_DATA_KEY
        } );

        return result ?? null;
    }

    public async setCustomStatus( channelDBId: string, status: string ) {
        return this.dataUpsert<string>(
            {
                ownerId: channelDBId,
                key: DYNAMIC_CHANNEL_STATUS_DATA_KEY
            },
            status
        );
    }

    public async removeCustomStatus( channelDBId: string ) {
        return this.dataDelete( {
            ownerId: channelDBId,
            key: DYNAMIC_CHANNEL_STATUS_DATA_KEY
        } );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }
}

export default DynamicChannelStatusModel;
