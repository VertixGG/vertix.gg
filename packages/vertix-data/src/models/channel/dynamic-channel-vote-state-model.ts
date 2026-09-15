import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import { ChannelDataModelBase } from "@vertix.gg/data/src/models/channel/channel-data-model-base";

import type { IDynamicChannelVoteStoredState } from "@vertix.gg/data/src/interfaces/dynamic-channel-vote";

const DYNAMIC_CHANNEL_VOTE_STATE_DATA_KEY = "DynamicChannelVote/State";

export class DynamicChannelVoteStateModel extends ChannelDataModelBase {
    private static instance: DynamicChannelVoteStateModel;

    public static getName() {
        return "VertixData/Models/DynamicChannelVoteState";
    }

    public static get $() {
        if ( !this.instance ) {
            this.instance = new DynamicChannelVoteStateModel();
        }

        return this.instance;
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", DynamicChannelVoteStateModel.getName() ),
            isDebugEnabled( "MODEL", DynamicChannelVoteStateModel.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }

    public async getState( channelDBId: string ): Promise<IDynamicChannelVoteStoredState | null> {
        const result = await this.dataGet<IDynamicChannelVoteStoredState>( {
            ownerId: channelDBId,
            key: DYNAMIC_CHANNEL_VOTE_STATE_DATA_KEY
        } );

        return result ?? null;
    }

    public async setState( channelDBId: string, state: IDynamicChannelVoteStoredState ) {
        return this.dataUpsert<IDynamicChannelVoteStoredState>(
            {
                ownerId: channelDBId,
                key: DYNAMIC_CHANNEL_VOTE_STATE_DATA_KEY
            },
            state
        );
    }

    public async removeState( channelDBId: string ) {
        return this.dataDelete( {
            ownerId: channelDBId,
            key: DYNAMIC_CHANNEL_VOTE_STATE_DATA_KEY
        } );
    }

    /**
     * Every vote that was running when the process stopped.
     *
     * Walks the dynamic channels rather than the data rows, the way the claim state and the lfm
     * posts do - a vote whose channel row is gone went with the channel, and one whose row remains
     * is exactly the vote nobody is left to finish.
     */
    public async getAllStates(): Promise<IDynamicChannelVoteStoredState[]> {
        const result = await this.getAll<IDynamicChannelVoteStoredState>(
            { where: { internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL } },
            { key: DYNAMIC_CHANNEL_VOTE_STATE_DATA_KEY }
        );

        return result ?? [];
    }
}

export default DynamicChannelVoteStateModel;
