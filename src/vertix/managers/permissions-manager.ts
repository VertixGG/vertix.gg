import {
    Guild,
    Interaction,
    PermissionOverwriteOptions,
    PermissionResolvable,
    PermissionsBitField,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";

import { ChannelModel, ChannelResult } from "@vertix/models/channel-model";

import { DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS, } from "@vertix/definitions/master-channel";

import { permissionsConvertBitfieldToOverwriteOptions } from "@vertix/utils/permissions";

import { AppManager } from "@vertix/managers/app-manager";

import { Debugger } from "@internal/modules/debugger";

import { InitializeBase } from "@internal/bases/initialize-base";

export class PermissionsManager extends InitializeBase {
    private static instance: PermissionsManager;

    private channelModel: ChannelModel;

    private debugger: Debugger;

    private resetBotPermissionsDebounceMap = new Map<string, NodeJS.Timeout>();

    public static getName() {
        return "Vertix/Managers/Permissions";
    }

    public static getInstance(): PermissionsManager {
        if ( ! PermissionsManager.instance ) {
            PermissionsManager.instance = new PermissionsManager();
        }

        return PermissionsManager.instance;
    }

    public static get $() {
        return PermissionsManager.getInstance();
    }

    public constructor() {
        super();

        this.channelModel = ChannelModel.getInstance();

        this.debugger = new Debugger( this, "", AppManager.isDebugOn( "MANAGER", PermissionsManager.getName() ) );
    }

    public async onChannelPermissionsUpdate( oldState: VoiceChannel, newState: VoiceChannel ) {
        this.logger.log( this.onChannelPermissionsUpdate,
            `Guild id: '${ oldState.guildId }', channel id: '${ oldState.id }' - Permissions were updated`
        );

        // Print debug new permissions.
        this.debugger.log( this.onChannelPermissionsUpdate, `Guild id: '${ oldState.guildId }' - New permissions for channel id: '${ oldState.id }'` );
        this.debugger.debugPermissions( this.onChannelPermissionsUpdate, newState.permissionOverwrites );

        const channel = await ChannelModel.$.getByChannelId( newState.id, true );

        if ( ! channel ) {
            return this.logger.debug( this.onChannelPermissionsUpdate,
                `Guild id: '${ oldState.guildId }', channel id: '${ newState.id }' - Not found in the database`
            );
        }

        if ( channel.isMaster || channel.isDynamic ) {
            const botId = newState.client.user.id,
                isBotPermissionsRemovedFromChannel = ! newState.permissionOverwrites.cache.get( botId );

            if ( isBotPermissionsRemovedFromChannel ) {
                this.logger.admin( this.onChannelPermissionsUpdate,
                    `🔐 Bot permissions were removed from channel id: '${ newState.id }', channel name: '${ newState.name }' - (${ newState.guild.name }) (${ newState.guild?.memberCount })`
                );
            }
        }
    }

    public getRolesPermissions( context: Guild, userId = context.client.user.id ) {
        const result = new PermissionsBitField();

        for ( const role of context.roles.cache.values() ) {
            // Skip if user is not in role.
            if ( ! role.members.get( userId ) ) {
                continue;
            }

            const rolePermissions = context.roles.cache.get( role.id )?.permissions;

            // Skip non-effected roles, or user not in role.
            if ( ! rolePermissions || ! rolePermissions.bitfield ) {
                continue;
            }

            // Add permissions that are allowed.
            result.add( rolePermissions.bitfield );
        }

        return result;
    }

    public getMissingRolePermissions( permissions: bigint[], context: Guild, userId = context.client.user.id ): string[] {
        const resultMissingPermissions: PermissionOverwriteOptions = {},
            requiredPermissionsField = new PermissionsBitField( permissions );

        // Determine which roles are missing.
        requiredPermissionsField.toArray().forEach( ( permission ) => {
            resultMissingPermissions[ permission ] = true;
        } );

        // Get all roles in the guild;
        const roles = context.roles.cache.values();

        for ( const role of roles ) {
            // Skip if user is not in role.
            if ( ! role.members.get( userId ) ) {
                continue;
            }

            const rolePermissions = context.roles.cache.get( role.id )?.permissions;

            // Skip non-effected roles, or user not in role.
            if ( ! rolePermissions || ! rolePermissions.bitfield ) {
                continue;
            }

            const rolePermissionsField = new PermissionsBitField( rolePermissions.bitfield );

            rolePermissionsField.toArray().forEach( ( permission ) => {
                delete resultMissingPermissions[ permission ];
            } );

            // If resultMissingPermissions is empty.
            if ( ! Object.keys( resultMissingPermissions ).length ) {
                break;
            }
        }

        return Object.keys( resultMissingPermissions );
    }

    public getMissingChannelPermissions( permissions: bigint[], context: VoiceBasedChannel, userId = context.client.user.id ): string[] {
        const resultMissingPermissions: PermissionOverwriteOptions = {},
            requiredPermissionsField = new PermissionsBitField( permissions );

        // Determine which roles are missing.
        requiredPermissionsField.toArray().forEach( ( permission ) => {
            resultMissingPermissions[ permission ] = true;
        } );

        // Get user permissions that are defined in the voice channel.
        const channelPermissions = context.permissionOverwrites.cache.get( userId ),
            permissionFieldAllow = new PermissionsBitField( channelPermissions?.allow.bitfield );

        permissionFieldAllow.toArray().forEach( ( permission ) => {
            delete resultMissingPermissions[ permission ];
        } );

        return Object.keys( resultMissingPermissions );
    }

    public async hasMemberPermissions( guildId: string, userId: string, permissions: PermissionResolvable ) {
        const guild = AppManager.$.getClient().guilds.cache.get( guildId );

        if ( ! guild ) {
            this.logger.error( this.hasMemberPermissions,
                `Guild id: '${ guildId }' - Guild not found`
            );
            return false;
        }

        const member = await guild.members.fetch( userId );

        return member.permissions.has( permissions );
    }

    public hasMemberAdminPermission( interaction: Interaction, logFunctionOwner?: Function ) {
        if ( ! interaction.guild ) {
            this.logger.error( this.hasMemberAdminPermission,
                `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - Is not a guild interaction.`
            );
            return false;
        }

        const hasPermission = interaction.guild.ownerId === interaction.user.id ||
            interaction.memberPermissions?.has( PermissionsBitField.Flags.Administrator ) || false;

        if ( logFunctionOwner && ! hasPermission ) {
            this.logger.warn( logFunctionOwner,
                `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - User: '${ interaction.user.id }' is not the guild owner`
            );
        }

        return hasPermission;
    }

    public isSelfAdministratorRole( guild: Guild ): boolean {
        const botMember = guild.members.cache.get( guild.client.user.id );

        if ( ! botMember ) {
            return false;
        }

        return botMember.permissions.has( PermissionsBitField.Flags.Administrator );
    }

    /**
     * Function getMissingPermissions() :: Return missing permissions names.
     */
    public getMissingPermissions( permissions: bigint[], context: VoiceBasedChannel ): string[];
    public getMissingPermissions( permissions: bigint[], context: Guild ): string[];
    public getMissingPermissions( permissions: bigint[], context: VoiceBasedChannel | Guild ): string[] {
        if ( context instanceof Guild ) {
            return this.getMissingRolePermissions( permissions, context );
        }

        return this.getMissingChannelPermissions( permissions, context );
    }

    public async editChannelRolesPermissions( channel: VoiceBasedChannel, roles: string[], permissions: PermissionOverwriteOptions ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            for ( const roleId of roles ) {
                const role = channel.guild.roles.cache.get( roleId );

                if ( ! role ) {
                    this.logger.warn( this.editChannelRolesPermissions,
                        `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Role id: '${ roleId }' not found` );
                    continue;
                }

                channel.permissionOverwrites.edit( role, permissions ).catch( reject );
            }

            resolve();
        } );
    }

    private resetBotUserPermissionsDebounce( channel: VoiceChannel, channelResult: ChannelResult, delay = 1500 ) {
        this.logger.log( this.resetBotUserPermissionsDebounce,
            `Guild id: '${ channel.guildId }' - Requesting reset bot permissions for channel id: '${ channel.id }'`
        );

        const callback = async () => {
            await this.resetBotUserPermissions( channel, channelResult );

            this.resetBotPermissionsDebounceMap.delete( channel.id );
        };

        const key = channel.id;

        let timeoutId = this.resetBotPermissionsDebounceMap.get( key );

        if ( timeoutId ) {
            this.resetBotPermissionsDebounceMap.delete( channel.id );
            clearTimeout( timeoutId );
        }

        timeoutId = setTimeout( callback, delay );

        this.resetBotPermissionsDebounceMap.set( key, timeoutId );
    }

    /**
     * Function resetBotUserPermissions() :: Called when the bot has removed from the channel permissions.
     * The function will try to re-add the bot permissions to the channel.
     */
    private async resetBotUserPermissions( channel: VoiceChannel, channelResult: ChannelResult ) {
        this.logger.info( this.resetBotUserPermissions,
            `Guild id: '${ channel.guildId }' - Bot permissions were removed from: '${ channelResult.internalType }' channel: '${ channel.id }'`
        );

        const requiredPermissionsOptions = permissionsConvertBitfieldToOverwriteOptions(
            DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow
        );

        await channel.permissionOverwrites.edit( channel.client.user.id, requiredPermissionsOptions ).catch(
            ( e ) => this.logger.warn( this.resetBotUserPermissions, "", e )
        );
    }
}
