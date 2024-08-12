import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ManagerDataBase } from "@vertix.gg/base/src/bases/manager-data-base";

import { UserModel } from "@vertix.gg/base/src/models/user-model";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import type { Interaction, VoiceChannel } from "discord.js";

export class UserDataManager extends ManagerDataBase<UserModel> {
    public static getName() {
        return "VertixBase/Managers/UserData";
    }

    public static get $() {
        return UserDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", UserDataManager.getName() ) ) {
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

    /**
     * Function `setUserMasterData()` - This method sets master data for a given user and voice channel.
     * The function logs the guild and user information.
     * It also attempts to retrieve the master channel database
     * based on the dynamic channel ID.
     * If it is unable to find the master channel, it logs an error and returns.
     *
     * Next, the function ensures that the user exists in the database by creating or updating the user details.
     * It then generates a key based on the master channel's ID. If the data exists for the user and key, it calls
     * the `setMasterData` method to set the user's master data in the master channel.
     *
     * TODO: Remove and use `UserChannelDataModelV3` instead.
     **/
    public async setUserMasterData( initiator: Interaction, channel: VoiceChannel, data: any ) {
        this.logger.log( this.setUserMasterData,
            `Guild id: '${ channel.guildId }' - Initiator: '${ initiator.user.id }' - Channel: '${ channel.id }'`
        );

        this.debugger.dumpDown( this.setUserMasterData, data,
            `Guild id: '${ channel.guildId }' - Initiator: '${ initiator.user.id }' - Channel: '${ channel.id }' - Data:`
        );

        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        if ( ! masterChannelDB ) {
            this.logger.error( this.setUserMasterData,
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
