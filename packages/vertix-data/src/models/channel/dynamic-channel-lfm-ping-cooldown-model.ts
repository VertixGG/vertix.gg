import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import { ChannelDataModelBase } from "@vertix.gg/data/src/models/channel/channel-data-model-base";

import type { TDynamicChannelLfmPingCooldowns } from "@vertix.gg/data/src/interfaces/dynamic-channel-lfm";

const DYNAMIC_CHANNEL_LFM_PING_COOLDOWN_DATA_KEY = "DynamicChannelLfm/PingCooldowns";

/**
 * When each destination may next be pinged, held against the generator that pings it.
 *
 * Owned by the master channel rather than the guild so that the clock sits at the same level as
 * the number that sets it: a generator whose admin chose five minutes waits five minutes, instead
 * of inheriting whatever window another generator happened to start.
 *
 * The cost of that is real and deliberate - two generators pointing at one destination each hold
 * their own clock, so that channel can be pinged once per generator per window rather than once.
 */
export class DynamicChannelLfmPingCooldownModel extends ChannelDataModelBase {
    private static instance: DynamicChannelLfmPingCooldownModel;

    public static getName() {
        return "VertixData/Models/DynamicChannelLfmPingCooldown";
    }

    public static get $() {
        if ( !this.instance ) {
            this.instance = new DynamicChannelLfmPingCooldownModel();
        }

        return this.instance;
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", DynamicChannelLfmPingCooldownModel.getName() ),
            isDebugEnabled( "MODEL", DynamicChannelLfmPingCooldownModel.getName() )
        );
    }

    protected getDataVersion() {
        return VERSION_UI_V2;
    }

    /**
     * Function getPingCooldowns() :: The destinations this generator is still resting.
     *
     * Entries whose moment has passed are dropped on the way out rather than reported as expired,
     * so every caller sees the same thing and the pruning on write has nothing to disagree with.
     */
    public async getPingCooldowns( masterChannelDBId: string ): Promise<TDynamicChannelLfmPingCooldowns> {
        const stored = await this.dataGet<TDynamicChannelLfmPingCooldowns>( {
            ownerId: masterChannelDBId,
            key: DYNAMIC_CHANNEL_LFM_PING_COOLDOWN_DATA_KEY
        } );

        if ( ! stored || "object" !== typeof stored || Array.isArray( stored ) ) {
            return {};
        }

        const now = Date.now(),
            cooldowns: TDynamicChannelLfmPingCooldowns = {};

        Object.entries( stored as Record<string, unknown> ).forEach( ( [ lfmChannelId, until ] ) => {
            if ( "number" === typeof until && until > now ) {
                cooldowns[ lfmChannelId ] = until;
            }
        } );

        return cooldowns;
    }

    public async canPing( masterChannelDBId: string, lfmChannelId: string ) {
        const cooldowns = await this.getPingCooldowns( masterChannelDBId );

        return ! cooldowns[ lfmChannelId ];
    }

    /**
     * Function setPingCooldown() :: Starts one destination's clock for this generator.
     *
     * Writes back only what is still running, so the row holds at most one entry per destination
     * the generator actually uses instead of every channel ever picked.
     */
    public async setPingCooldown( masterChannelDBId: string, lfmChannelId: string, until: number ) {
        const cooldowns = await this.getPingCooldowns( masterChannelDBId );

        cooldowns[ lfmChannelId ] = until;

        await this.dataUpsert<TDynamicChannelLfmPingCooldowns>(
            {
                ownerId: masterChannelDBId,
                key: DYNAMIC_CHANNEL_LFM_PING_COOLDOWN_DATA_KEY
            },
            cooldowns
        );

        return cooldowns;
    }
}

export default DynamicChannelLfmPingCooldownModel;
