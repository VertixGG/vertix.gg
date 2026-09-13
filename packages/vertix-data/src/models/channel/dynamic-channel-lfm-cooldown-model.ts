import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import { ChannelDataModelBase } from "@vertix.gg/data/src/models/channel/channel-data-model-base";

import type { IDynamicChannelLfmStoredCooldown } from "@vertix.gg/data/src/interfaces/dynamic-channel-lfm";

const DYNAMIC_CHANNEL_LFM_COOLDOWN_DATA_KEY = "DynamicChannelLfm/Cooldown";

/**
 * The rest a generator owes after one of its rooms posts.
 *
 * Its own row on the master channel rather than a field on any post, because one generator has
 * many rooms and many posts standing at once - the clock belongs to the thing they were all
 * created from.
 */
export class DynamicChannelLfmCooldownModel extends ChannelDataModelBase {
    private static instance: DynamicChannelLfmCooldownModel;

    public static getName() {
        return "VertixData/Models/DynamicChannelLfmCooldown";
    }

    public static get $() {
        if ( !this.instance ) {
            this.instance = new DynamicChannelLfmCooldownModel();
        }

        return this.instance;
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", DynamicChannelLfmCooldownModel.getName() ),
            isDebugEnabled( "MODEL", DynamicChannelLfmCooldownModel.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }

    public async getCooldown( masterChannelDBId: string ): Promise<IDynamicChannelLfmStoredCooldown | null> {
        const result = await this.dataGet<IDynamicChannelLfmStoredCooldown>( {
            ownerId: masterChannelDBId,
            key: DYNAMIC_CHANNEL_LFM_COOLDOWN_DATA_KEY
        } );

        return result ?? null;
    }

    public async setCooldown( masterChannelDBId: string, cooldown: IDynamicChannelLfmStoredCooldown ) {
        return this.dataUpsert<IDynamicChannelLfmStoredCooldown>(
            {
                ownerId: masterChannelDBId,
                key: DYNAMIC_CHANNEL_LFM_COOLDOWN_DATA_KEY
            },
            cooldown
        );
    }
}

export default DynamicChannelLfmCooldownModel;
