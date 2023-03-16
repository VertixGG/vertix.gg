import {
    Guild,
    PermissionOverwriteOptions,
    PermissionsBitField,
    PermissionsString,
    User,
    VoiceChannel
} from "discord.js";

import ChannelModel, { ChannelResult } from "../models/channel";

import Debugger from "@dynamico/utils/debugger";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS_FIELDS
} from "@dynamico/constants/master-channel";

import { channelDataManager, channelManager, guiManager, } from "@dynamico/managers";

import { DATA_CHANNEL_KEY_MISSING_PERMISSIONS } from "@dynamico/constants/channel-data";

import { InitializeBase } from "@internal/bases/initialize-base";

export default class PermissionsManager extends InitializeBase {
    private static instance: PermissionsManager;

    private channelModel: ChannelModel;

    private debugger: Debugger;

    public static getInstance(): PermissionsManager {
        if ( ! PermissionsManager.instance ) {
            PermissionsManager.instance = new PermissionsManager();
        }

        return PermissionsManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/Permissions";
    }

    public constructor() {
        super();

        this.channelModel = ChannelModel.getInstance();

        this.debugger = new Debugger( this );
    }

    public async onChannelPermissionsUpdate( oldChannel: VoiceChannel, newChannel: VoiceChannel ) {
        this.logger.info( this.onChannelPermissionsUpdate,
            `Channel '${ oldChannel.id }' permissions were updated.` );

        // Print debug new permissions.
        this.debugger.log( this.onChannelPermissionsUpdate, `New permissions for channel '${ oldChannel.id }'` );
        this.debugger.debugPermissions( this.onChannelPermissionsUpdate, newChannel.permissionOverwrites );

        const newMessage = await guiManager
            .get( "Dynamico/UI/EditDynamicChannel" )
            .getMessage( newChannel );

        await channelManager.editPrimaryMessage( newMessage, newChannel );

        const channel = await channelManager.getChannel( newChannel.guildId, newChannel.id, true );

        if ( ! channel ) {
            return this.logger.warn( this.onChannelPermissionsUpdate,
                `Channel '${ newChannel.id }' was not found in the database.` );
        }

        if ( channel.isMasterCreate ) {
            const botId = newChannel.client.user.id,
                isBotPermissionsRemovedFromChannel = ! newChannel.permissionOverwrites.cache.get( botId ) && (
                    channel.isMasterCreate ||
                    channel.isDynamic
                );

            if ( isBotPermissionsRemovedFromChannel ) {
                await this.botHasRemovedFromChannel( newChannel, channel );
            }

            await this.ensureChannelPermissions( newChannel, channel );
        }
    }

    private async ensureChannelPermissions( newChannel: VoiceChannel, channel: ChannelResult ) {
        const missingPermissions = await this.getChannelPermissionsThatAreMissingInRoles( newChannel, channel );

        if ( missingPermissions.length ) {
            this.logger.warn( this.ensureChannelPermissions,
                `Channel '${ newChannel.id }' is missing permissions: '${ missingPermissions.join( ", " ) }'` );

            await channelDataManager.addData( {
                ownerId: channel.id,
                key: DATA_CHANNEL_KEY_MISSING_PERMISSIONS,
                default: missingPermissions,
            } );

            const channelOwner = await newChannel.guild.members.fetch( channel.userOwnerId ),
                guildOwner = await newChannel.guild.members.fetch( newChannel.guild.ownerId ),
                targets = [];

            if ( guildOwner ) {
                targets.push( guildOwner );

                if ( channelOwner && channelOwner.id !== guildOwner.id ) {
                    targets.push( channelOwner );
                }
            }

            if ( targets.length ) {
                targets.forEach( ( target ) =>
                    target.createDM().then( ( dm ) => {
                        dm.send(
                            `Someone has changed the permissions for the channel '<#${ newChannel.id }>':\n` +
                            "Those are the missing permissions:\n" +
                            missingPermissions.join( "\n" )
                        );
                    } ) );
            } else {
                this.logger.warn( this.ensureChannelPermissions,
                    `Channel owners '${ channel.userOwnerId }' was not found in guild '${ newChannel.guildId }'` );
            }
        } else {
            // Clean, should refresh the database.
            const channel = await channelManager.getChannel( newChannel.guildId, newChannel.id, true );

            if ( ! channel ) {
                return this.logger.error( this.ensureChannelPermissions,
                    `Channel '${ newChannel.id }' was not found in the database.` );
            }

            const missingPermissionsData = await channelDataManager.getData( {
                ownerId: channel.id,
                key: DATA_CHANNEL_KEY_MISSING_PERMISSIONS,
                default: null,
                cache: false,
            } );

            // If there is missing permissions' data, remove it.
            if ( missingPermissionsData?.values ) {
                await channelDataManager.deleteData( {
                    ownerId: channel.id,
                    key: DATA_CHANNEL_KEY_MISSING_PERMISSIONS,
                } );
            }
        }
    }

    public async botHasRemovedFromChannel( channel: VoiceChannel, channelResult: ChannelResult ) {
        this.logger.info( this.botHasRemovedFromChannel,
            `Bot permissions were removed from: '${ channelResult.internalType }' channel: '${ channel.id }'` );

        await channel.permissionOverwrites.edit( channel.client.user.id,
            DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS_FIELDS
        ).catch(
            ( e ) => this.logger.warn( this.botHasRemovedFromChannel, "", e )
        );
    }

    public async getChannelPermissionsThatAreMissingInRoles( channel: VoiceChannel, channelResult: ChannelResult ) {
        const situation: PermissionOverwriteOptions = {},
            allSituationsLength = Object.keys( PermissionsBitField.Flags ).length;

        // Loop through all permissions in the channel.
        channel.permissionOverwrites.cache
            .forEach( ( permission ) => {
                    // Add allowed permissions to situation.
                    const addSituation = ( permission: PermissionsString ) => {
                        if ( ! situation[ permission ] ) {
                            situation[ permission ] = true;
                        }

                        // Stop when situation is full.
                        return Object.keys( situation ).length === allSituationsLength;
                    };

                    permission.allow.toArray().some( addSituation );
                    permission.deny.toArray().some( addSituation );
                }
            );

        // Loop through all guild roles that has bot in it.
        const guildRoles = channel.guild.roles.cache.values();

        for ( const role of guildRoles ) {
            if ( 0n === role.permissions.bitfield ) {
                continue;
            }

            const isUserInRole = role.members.get( channel.client.user.id || "" );

            if ( isUserInRole ) {
                // Removed allowed permissions to situation since situation is used to determine which permissions are missing.
                role.permissions.toArray().forEach( ( permission ) => {
                    if ( situation[ permission ] ) {
                        delete situation[ permission ];
                    }
                } );
            }
        }

        return Object.keys( situation );
    }

    /**
     * Function getMissingPermissions() :: Return missing permissions names.
     */
    public getMissingPermissions( permissions: bigint[], context: Guild ): string[];
    public getMissingPermissions( permissions: bigint[], context: VoiceChannel, user: User ): string[];
    public getMissingPermissions( permissions: bigint[], context: VoiceChannel | Guild, user?: User ) {
        const resultMissingPermissions: PermissionOverwriteOptions = {},
            requiredPermissionsField = new PermissionsBitField( permissions );

        // Determine the context.
        let guild: Guild;
        if ( context instanceof VoiceChannel ) {
            guild = context.guild;
        } else {
            guild = context;
        }

        // Determine which roles are missing.
        requiredPermissionsField.toArray().forEach( ( permission ) => {
            resultMissingPermissions[ permission ] = true;
        } );

        if ( context instanceof VoiceChannel && user ) {
            // Get all permissions that are defined in the voice channel.
            const userChannelPermissions = context.permissionOverwrites.cache.get( user.id ),
                allow = userChannelPermissions?.allow.toArray(),
                deny = userChannelPermissions?.deny.toArray();

            deny && deny.forEach( ( permission ) => {
                resultMissingPermissions[ permission ] = false;
            } );

            allow && allow.forEach( ( permission ) => {
                delete resultMissingPermissions[ permission ];
            } );
        } else {
            // Get all roles in the guild;
            const roles = guild.roles.cache.values();

            // Iterate over all roles.
            for ( const role of roles ) {
                const isUserInRole = role.members.get( guild.client.user.id || "" );

                if ( isUserInRole ) {
                    const grantedRoles = role.permissions.toArray();

                    grantedRoles.forEach( ( permission ) => {
                        delete resultMissingPermissions[ permission ];
                    } );
                }

                // If the resultMissingPermissions is empty.
                if ( ! Object.keys( resultMissingPermissions ).length ) {
                    break;
                }
            }
        }

        // Transform the resultMissingPermissions object to the array.
        const result: string[] = [];

        for ( const permissionName in resultMissingPermissions ) {
            result.push( permissionName );
        }

        return result;
    }
}
