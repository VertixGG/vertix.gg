import { ChannelData } from ".prisma/client";

import ChannelModel from "../models/channel";
import Debugger from "@dynamico/utils/debugger";

import {
    IChannelDataGetArgs,
    IChannelDataSelectUniqueArgs,
    IChannelDataUpsertArgs
} from "@dynamico/interfaces/channel";

import { InitializeBase } from "@internal/bases";

export class ChannelDataManager extends InitializeBase {
    private static instance: ChannelDataManager;

    private cache = new Map<string, any>();

    private debugger: Debugger;

    private channelModel: ChannelModel;

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

        this.channelModel = ChannelModel.getInstance();
    }

    public async getData( args: IChannelDataGetArgs ) {
        const { ownerId, key, cache } = args,
            cacheKey = `${ ownerId }-${ key }`;

        this.logger.info( this.getData,
            `Getting channel data for ownerId: '${ ownerId }', key: '${ key }'` );

        // Get from cache.
        if ( cache ) {
            const cached = this.cache.get( cacheKey );

            if ( cached ) {
                this.debugger.log( this.getData, `Getting cached data from key: ${ cacheKey }`, cached );
                return cached;
            }
        }

        // Get from database.
        const channel = await this.channelModel.getChannelDataByChannelId( args );
        if ( ! channel ) {
            this.logger.debug( this.getData,
                `Could not find channel data for ownerId: '${ args.ownerId }' with key: '${ args.key }'`
            );
            return;
        }

        let data: ChannelData,
            message: string;

        // If not exist, create.
        if ( args.default !== null && ! channel?.data.length ) {
            data = await this.channelModel.createChannelData( {
                key: args.key,
                value: args.default,
                ownerId: channel.id,
            } );

            message = "Created new";
        } else if ( channel?.data.length ) {
            data = channel.data[ 0 ];

            message = "Getting";
        } else {
            this.logger.debug( this.getData,
                `Could not find channel data for ownerId: '${ args.ownerId }'`
            );
            return;
        }

        message += ` channel data for ownerId: '${ args.ownerId }', type: '${ data.type }' key: '${ args.key }' with values:\n`;

        this.debugger.log( this.getData, message, data.object || data.values );

        // Set cache.
        this.cache.set( cacheKey, data );

        if ( data.type === "object" ) {
            return data;
        }

        return data;
    }

    public async addData( args: IChannelDataUpsertArgs ) {
        this.logger.info( this.addData,
            `Adding channel data for ownerId: '${ args.ownerId }', key: '${ args.key }'` );

        args.cache = true;

        // Don't create on default.
        const channelData = await this.getData( {
            ... args,
            default: null,
        } );

        // If exist, replace.
        if ( channelData ) {
            this.logger.debug( this.addData,
                `Channel data for ownerId: '${ args.ownerId }', key: '${ args.key }' already exist, replacing...` );

            return this.setData( args );
        }

        // If not exist, create.
        if ( null !== args.default ) {
            this.logger.debug( this.addData,
                `Channel data for ownerId: '${ args.ownerId }', key: '${ args.key }' does not exist, creating...` );

            const data = await this.channelModel.createChannelData( {
                key: args.key,
                value: args.default,
                ownerId: args.ownerId,
            } );

            // Set cache.
            this.cache.set( `${ args.ownerId }-${ args.key }`, data );

            return data;
        }
    }

    public async setData( args: IChannelDataUpsertArgs ) {
        const { ownerId, key } = args,
            cacheKey = `${ ownerId }-${ key }`;

        this.logger.info( this.setData,
            `Setting channel data for ownerId: '${ args.ownerId }', key: '${ args.key }'`
        );

        await this.channelModel.setChannelData( args );

        // Set cache.
        this.cache.set( cacheKey, args.default );

        this.logger.debug( this.setData,
            `Setting cache for key: '${ cacheKey }' with value:`, args.default );
    }

    public async deleteData( args: IChannelDataSelectUniqueArgs ) {
        this.logger.info( this.deleteData,
            `Removing channel data for ownerId: '${ args.ownerId }', key: '${ args.key }'` );

        this.removeFromCache( args.ownerId );

        return await this.channelModel.deleteChannelData( args );
    }

    public removeFromCache( ownerId: string ) {
        this.logger.info( this.removeFromCache,
            `Removing channel data from cache for ownerId: '${ ownerId }'` );

        for ( const [ key ] of this.cache.entries() ) {
            if ( key.startsWith( ownerId ) ) {
                this.debugger.log( this.removeFromCache, `Removing cache key: '${ key }'` );

                this.cache.delete( key );
            }
        }
    }
}

export default ChannelDataManager;
