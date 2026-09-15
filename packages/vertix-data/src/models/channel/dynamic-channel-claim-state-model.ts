import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import { ChannelDataModelBase } from "@vertix.gg/data/src/models/channel/channel-data-model-base";

import type { IDynamicChannelClaimStoredState } from "@vertix.gg/data/src/interfaces/dynamic-channel-claim";

const DYNAMIC_CHANNEL_CLAIM_STATE_DATA_KEY = "DynamicChannelClaim/State";

export class DynamicChannelClaimStateModel extends ChannelDataModelBase {
    private static instance: DynamicChannelClaimStateModel;

    public static getName() {
        return "VertixData/Models/DynamicChannelClaimState";
    }

    public static get $() {
        if ( !this.instance ) {
            this.instance = new DynamicChannelClaimStateModel();
        }

        return this.instance;
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", DynamicChannelClaimStateModel.getName() ),
            isDebugEnabled( "MODEL", DynamicChannelClaimStateModel.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }

    public async getState( channelDBId: string ): Promise<IDynamicChannelClaimStoredState | null> {
        const result = await this.dataGet<IDynamicChannelClaimStoredState>( {
            ownerId: channelDBId,
            key: DYNAMIC_CHANNEL_CLAIM_STATE_DATA_KEY
        } );

        return result ?? null;
    }

    public async setState( channelDBId: string, state: IDynamicChannelClaimStoredState ) {
        return this.dataUpsert<IDynamicChannelClaimStoredState>(
            {
                ownerId: channelDBId,
                key: DYNAMIC_CHANNEL_CLAIM_STATE_DATA_KEY
            },
            state
        );
    }

    public async removeState( channelDBId: string ) {
        return this.dataDelete( {
            ownerId: channelDBId,
            key: DYNAMIC_CHANNEL_CLAIM_STATE_DATA_KEY
        } );
    }

    /**
     * Every room the process was watching or offering when it stopped.
     *
     * Walks the dynamic channels rather than the data rows, the way the lfm posts do - it is the
     * only way in, and it is the right way round anyway: a record whose channel row is gone went
     * with the channel, and one whose row remains is exactly the room nobody is left to finish.
     */
    public async getAllStates(): Promise<IDynamicChannelClaimStoredState[]> {
        const result = await this.getAll<IDynamicChannelClaimStoredState>(
            { where: { internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL } },
            { key: DYNAMIC_CHANNEL_CLAIM_STATE_DATA_KEY }
        );

        return result ?? [];
    }
}

export default DynamicChannelClaimStateModel;
