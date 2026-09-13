import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import { ChannelDataModelBase } from "@vertix.gg/data/src/models/channel/channel-data-model-base";

import type { IDynamicChannelLfmStoredPost } from "@vertix.gg/data/src/interfaces/dynamic-channel-lfm";

const DYNAMIC_CHANNEL_LFM_POST_DATA_KEY = "DynamicChannelLfm/Post";

export class DynamicChannelLfmPostModel extends ChannelDataModelBase {
    private static instance: DynamicChannelLfmPostModel;

    public static getName() {
        return "VertixData/Models/DynamicChannelLfmPost";
    }

    public static get $() {
        if ( !this.instance ) {
            this.instance = new DynamicChannelLfmPostModel();
        }

        return this.instance;
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", DynamicChannelLfmPostModel.getName() ),
            isDebugEnabled( "MODEL", DynamicChannelLfmPostModel.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }

    public async getPost( channelDBId: string ): Promise<IDynamicChannelLfmStoredPost | null> {
        const result = await this.dataGet<IDynamicChannelLfmStoredPost>( {
            ownerId: channelDBId,
            key: DYNAMIC_CHANNEL_LFM_POST_DATA_KEY
        } );

        return result ?? null;
    }

    public async setPost( channelDBId: string, post: IDynamicChannelLfmStoredPost ) {
        return this.dataUpsert<IDynamicChannelLfmStoredPost>(
            {
                ownerId: channelDBId,
                key: DYNAMIC_CHANNEL_LFM_POST_DATA_KEY
            },
            post
        );
    }

    public async removePost( channelDBId: string ) {
        return this.dataDelete( {
            ownerId: channelDBId,
            key: DYNAMIC_CHANNEL_LFM_POST_DATA_KEY
        } );
    }

    /**
     * Every post the process was holding when it stopped.
     *
     * Walks the dynamic channels rather than the data rows, because that is the only way in - and
     * it is the right way round anyway: a post whose channel row is gone was cleaned up with the
     * channel, and a post whose row remains is exactly the one nobody is left to take down.
     */
    public async getAllPosts(): Promise<IDynamicChannelLfmStoredPost[]> {
        const result = await this.getAll<IDynamicChannelLfmStoredPost>(
            { where: { internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL } },
            { key: DYNAMIC_CHANNEL_LFM_POST_DATA_KEY }
        );

        return result ?? [];
    }
}

export default DynamicChannelLfmPostModel;
