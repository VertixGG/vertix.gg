import { ChannelData } from ".prisma/client";

import ChannelModel from "../models/channel";
import Debugger from "@dynamico/utils/debugger";

import { IChannelDataGetArgs } from "@dynamico/interfaces/channel";

import { InitializeBase } from "@internal/bases";

const channelModel = ChannelModel.getInstance();

export class ChannelDataManager extends InitializeBase {
    private static instance: ChannelDataManager;

    private cache = new Map<string, any>();

    private debugger: Debugger;

    public static getInstance(): ChannelDataManager {
        if ( ! ChannelDataManager.instance ) {
            ChannelDataManager.instance = new ChannelDataManager();
        }
        return ChannelDataManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/ChannelData";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this );
    }

    public async getData( args: IChannelDataGetArgs ) {
        const { channelId, key, cache } = args,
            cacheKey = `${ channelId }-${ key }`;

        this.logger.info( this.getData,
            `Getting master channel data for channelId: '${ channelId }', key: '${ key }'` );

        if ( cache ) {
            const cached = this.cache.get( cacheKey );

            if ( cached ) {
                this.debugger.log( this.getData, `Getting cached data from key: ${ cacheKey }`, cached );
                return cached;
            }
        }

        const channel = await channelModel.getChannelDataByChannelId( args );

        if ( ! channel ) {
            this.logger.error( this.getData,
                `Could not find master channel data for channelId: '${ args.channelId }'`
            );
            return;
        }

        let data: ChannelData,
            message: string;

        if ( ! channel?.data.length ) {
            data = await channelModel.createChannelData( {
                id: channel.id,
                key: args.key,
                value: args.default,
            } );

            message = "Created new";
        } else {
            data = channel.data[ 0 ];

            message = "Getting";
        }

        message += ` channel data for channelId: '${ args.channelId }', type: '${ data.type }' key: '${ args.key }' with values:\n`;

        this.debugger.log( this.getData, message, data.object || data.values );

        // Set cache.
        this.cache.set( cacheKey, data );

        if ( data.type === "object" ) {
            return data;
        }

        return data;
    }

    public removeFromCache( channelId: string ) {
        this.logger.info( this.removeFromCache,
            `Removing channel data from cache for channelId: '${ channelId }'` );

        for ( const [ key ] of this.cache.entries() ) {
            if ( key.startsWith( channelId ) ) {
                this.debugger.log( this.removeFromCache, `Removing cache key: '${ key }'` );

                this.cache.delete( key );
            }
        }
    }
}
