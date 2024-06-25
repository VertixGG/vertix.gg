import { ManagerDataBase } from "@vertix.gg/base/src/bases/manager-data-base";

import { UserModel } from "@vertix.gg/base/src/models/user-model";

import { isDebugOn } from "@vertix.gg/base/src/utils/debug";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import type { Interaction, VoiceChannel } from "discord.js";

export class UserDataManager extends ManagerDataBase<UserModel> {
    private static instance: UserDataManager;

    public static getName() {
        return "VertixBase/Managers/UserData";
    }

    public static getInstance(): UserDataManager {
        if ( ! UserDataManager.instance ) {
            UserDataManager.instance = new UserDataManager();
        }
        return UserDataManager.instance;
    }

    public static get $() {
        return UserDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugOn( "CACHE", UserDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    public async getMasterData( ownerId: string, masterChannelDBId: string, defaultSettings: any, cache = false, isOwnerIdSourceId = false ) {
        this.debugger.log( this.getSettingsData,
            `Getting settings data for ownerId: '${ ownerId }', masterChannelDBId: '${ masterChannelDBId }', cache: '${ cache }' `
        );

        return await this.getData( {
            ownerId,
            key: "masterChannelData_" + masterChannelDBId,
            cache,
            default: defaultSettings,
        }, isOwnerIdSourceId );
    }

    public async ensureMasterData( ownerId: string, masterChannelDBId: string, data: any ) {
        const key =  "masterChannelData_" + masterChannelDBId;

        if ( ! await this.isExist( ownerId, key ) ) {
            await this.setMasterData( ownerId, masterChannelDBId, data, true );
        }
    }

    public async setMasterDataEnsheathed( initiator: Interaction, channel: VoiceChannel, data: any ) {
        this.logger.log( this.setMasterDataEnsheathed,
            `Guild id: '${ channel.guildId }' - Initiator: '${ initiator.user.id }' - Channel: '${ channel.id }'`
        );

        this.debugger.dumpDown( this.setMasterDataEnsheathed, data,
            `Guild id: '${ channel.guildId }' - Initiator: '${ initiator.user.id }' - Channel: '${ channel.id }' - Data:`
        );

        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        if ( ! masterChannelDB ) {
            this.logger.error( this.setMasterDataEnsheathed,
                `Guild id: '${ channel.guildId }' - Master channel not found for channel: '${ channel.id }'`
            );
            return;
        }

        // Ensure user exist.
        const user = await UserModel.$.ensure( {
            data: {
                userId: initiator.user.id,
                username: initiator.user.username,
            }
        } );

        const key =  "masterChannelData_" + masterChannelDB.id;

        if ( await this.isExist( user.id, key ) ) {
            await this.setMasterData( user.id, masterChannelDB.id, data );
        }
    }

    public async setMasterData( ownerId: string, masterChannelDBId: string, data: any, skipGetSettings = false ) {
        let oldData: any = {};

        if ( ! skipGetSettings ) {
            oldData = ( await this.getMasterData( ownerId, masterChannelDBId, null, true ) )?.object || {} as any;
        }

        Object.entries( data ).forEach( ( [ key, value ] ) => {
            oldData[ key ] = value;
        } );

        return await this.setData( {
            ownerId,
            key: "masterChannelData_" + masterChannelDBId,
            default: oldData,
            skipGet: skipGetSettings,
        } );
    }

    public removeFromCache( ownerId: string ) {
        this.logger.debug( this.removeFromCache,
            `Removing channel data from cache for ownerId: '${ ownerId }'`
        );

        this.deleteCacheWithPrefix( ownerId );
    }

    protected getSettingsKey() {
        return "settings";
    }

    protected getDataSourceModel() {
        return UserModel.getInstance();
    }
}
