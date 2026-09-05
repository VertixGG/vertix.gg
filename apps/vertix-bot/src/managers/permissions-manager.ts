import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { PermissionsBitField, Guild } from "discord.js";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type {
    Interaction,
    OverwriteResolvable,
    PermissionOverwriteOptions,
    PermissionResolvable,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

export class PermissionsManager extends InitializeBase {
    private static instance: PermissionsManager;

    private appService: AppService;

    private debugger: Debugger;

    public static getName() {
        return "VertixBot/Managers/Permissions";
    }

    public static get $() {
        if ( !PermissionsManager.instance ) {
            PermissionsManager.instance = new PermissionsManager();
        }

        return PermissionsManager.instance;
    }

    public constructor() {
        super();

        this.appService = ServiceLocator.$.get( "VertixBot/Services/App" );

        this.debugger = new Debugger( this, "", isDebugEnabled( "MANAGER", PermissionsManager.getName() ) );
    }

    public async onChannelPermissionsUpdate( oldState: VoiceChannel, newState: VoiceChannel ) {
        this.logger.log(
            this.onChannelPermissionsUpdate,
            `Guild id: '${ oldState.guildId }', channel id: '${ oldState.id }' - Permissions were updated`
        );

        // Print debug new permissions.
        this.debugger.log(
            this.onChannelPermissionsUpdate,
            `Guild id: '${ oldState.guildId }' - New permissions for channel id: '${ oldState.id }'`
        );
        this.debugger.debugPermissions( this.onChannelPermissionsUpdate, newState.permissionOverwrites );
    }

    public getRolesPermissions( context: Guild, userId = context.client.user.id ) {
        const result = new PermissionsBitField();

        for ( const role of context.roles.cache.values() ) {
            // Skip if user is not in role.
            if ( !role.members.get( userId ) ) {
                continue;
            }

            const rolePermissions = context.roles.cache.get( role.id )?.permissions;

            // Skip non-effected roles, or user not in role.
            if ( !rolePermissions || !rolePermissions.bitfield ) {
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
            if ( !role.members.get( userId ) ) {
                continue;
            }

            const rolePermissions = context.roles.cache.get( role.id )?.permissions;

            // Skip non-effected roles, or user not in role.
            if ( !rolePermissions || !rolePermissions.bitfield ) {
                continue;
            }

            const rolePermissionsField = new PermissionsBitField( rolePermissions.bitfield );

            rolePermissionsField.toArray().forEach( ( permission ) => {
                delete resultMissingPermissions[ permission ];
            } );

            // If resultMissingPermissions is empty.
            if ( !Object.keys( resultMissingPermissions ).length ) {
                break;
            }
        }

        return Object.keys( resultMissingPermissions );
    }

    public getMissingChannelPermissions(
        permissions: bigint[],
        context: VoiceBasedChannel,
        userId = context.client.user.id
    ): string[] {
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

    /**
     * Function getChannelDefaultInheritedPermissions() :: Returns the master channel overwrites a
     * dynamic channel is created from.
     *
     * `SendMessages` is dropped from every one of them. The master channel is a generator whose
     * text chat is deliberately closed, but its dynamic channels are meant to be talked in - the
     * whole point of the `Clear Chat` feature. Scoping this to the everyone overwrite alone used to
     * let any other role carrying the deny - a verified role, or anything an admin set on the
     * master channel - inherit it and end up silenced in every dynamic channel.
     */
    public getChannelDefaultInheritedPermissions( channel: VoiceBasedChannel ) {
        const { permissionOverwrites } = channel,
            result = [];

        for ( const overwrite of permissionOverwrites.cache.values() ) {
            const { id, allow, type } = overwrite,
                deny = overwrite.deny.remove( PermissionsBitField.Flags.SendMessages );

            this.debugger.debugPermission( this.getChannelDefaultInheritedPermissions, overwrite );

            result.push( { id, allow, deny, type } );
        }

        return result;
    }

    /**
     * Function mergeChannelPermissionOverwrites() :: Merges overwrite lists by id, a later entry
     * replacing an earlier one for the same role or member.
     *
     * Discord keeps one entry per id, so two entries for the same id is ambiguous, and merging them
     * positionally - as `Object.assign()` over the array does - overwrites whichever unrelated
     * entries happen to sit at those indexes.
     */
    public mergeChannelPermissionOverwrites( ...lists: OverwriteResolvable[][] ): OverwriteResolvable[] {
        const byId = new Map<string, OverwriteResolvable>();

        for ( const list of lists ) {
            for ( const overwrite of list ) {
                byId.set( "string" === typeof overwrite.id ? overwrite.id : overwrite.id.id, overwrite );
            }
        }

        return [ ... byId.values() ];
    }

    public getChannelDefaultInheritedPermissionsWithUser( channel: VoiceBasedChannel, userId: string, overrides = {} ) {
        const inheritedPermissions = this.getChannelDefaultInheritedPermissions( channel );

        return [
            ...inheritedPermissions,
            {
                id: userId,
                ...overrides
            }
        ];
    }

    public getChannelDefaultPermissions( userId: string, channel: VoiceBasedChannel, overrides = {} ) {
        const inheritedPermissions = this.getChannelDefaultInheritedPermissionsWithUser( channel, userId, overrides );

        return {
            permissionOverwrites: inheritedPermissions
        };
    }

    public async ensureChannelBotConnectivityPermissions( channel: VoiceChannel ): Promise<void> {
        if ( this.isSelfAdministratorRole( channel.guild ) ) {
            return;
        }

        await this.ensureChannelBotPermissions(
            channel,
            new PermissionsBitField( [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect ] )
        ).catch( ( error ) => {
            this.logger.error(
                this.ensureChannelBotConnectivityPermissions,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - ${ error }`
            );
        } );
    }

    public async hasMemberPermissions( guildId: string, userId: string, permissions: PermissionResolvable ) {
        const guild = this.appService.getClient().guilds.cache.get( guildId );

        if ( !guild ) {
            this.logger.error( this.hasMemberPermissions, `Guild id: '${ guildId }' - Guild not found` );
            return false;
        }

        const member = await guild.members.fetch( userId );

        return member.permissions.has( permissions );
    }

    public hasMemberAdminPermission( interaction: Interaction, logFunctionOwner?: Function ) {
        if ( !interaction.guild ) {
            this.logger.error(
                this.hasMemberAdminPermission,
                `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - Is not a guild interaction.`
            );
            return false;
        }

        const hasPermission =
            interaction.guild.ownerId === interaction.user.id ||
            interaction.memberPermissions?.has( PermissionsBitField.Flags.Administrator ) ||
            false;

        if ( logFunctionOwner && !hasPermission ) {
            this.logger.warn(
                logFunctionOwner,
                `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - User: '${ interaction.user.id }' is not the guild owner`
            );
        }

        return hasPermission;
    }

    public isSelfAdministratorRole( guild: Guild ): boolean {
        const botMember = guild.members.cache.get( guild.client.user.id );

        if ( !botMember ) {
            return false;
        }

        return botMember.permissions.has( PermissionsBitField.Flags.Administrator );
    }

    /**
     * Function ensureChannelBotPermissions() :: Grants the bot the given permissions on the channel,
     * on its own member overwrite.
     *
     * That is the same overwrite a master channel grants and a dynamic channel inherits, so the bot
     * ends up with one entry instead of a member one and a role one that have to agree. It used to
     * write to `botMember.roles.cache.first()`, which is not reliably the integration role.
     *
     * `permissionOverwrites.edit()` merges, so the permissions already granted are left alone.
     */
    public async ensureChannelBotPermissions(
        channel: VoiceBasedChannel,
        permissions: PermissionsBitField
    ): Promise<void> {
        const botMember = channel.guild.members.cache.get( channel.guild.client.user.id );

        if ( !botMember ) {
            this.logger.error(
                this.ensureChannelBotPermissions,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Bot member not found`
            );
            return;
        }

        if ( channel.permissionOverwrites.cache.get( botMember.id )?.allow.has( permissions ) ) {
            return;
        }

        const permissionsOptions: PermissionOverwriteOptions = {};

        for ( const permission of permissions.toArray() ) {
            permissionsOptions[ permission ] = true;
        }

        await channel.permissionOverwrites.edit( botMember, permissionsOptions ).catch( ( error ) => {
            this.logger.error(
                this.ensureChannelBotPermissions,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to grant bot permissions`,
                error
            );
        } );
    }

    /**
     * Function editChannelAudiencePermissions() :: Applies a state change to the channel's audience.
     *
     * The verified roles receive the change as given. `@everyone` mirrors the restrictions only:
     *
     * - a deny has to reach it as well, or a channel whose audience is narrower than `@everyone`
     *   would report itself private while anyone outside that audience could still walk straight in
     * - a grant must not, since widening access back to everyone is the very thing choosing a
     *   narrower audience rules out, so lifting a restriction clears `@everyone` to the server
     *   default instead of granting it
     *
     * When `@everyone` is itself a verified role the two collapse into one and it is left to the
     * verified pass, which is what gives the default audience its documented "everyone can see and
     * join" behaviour.
     */
    public async editChannelAudiencePermissions(
        channel: VoiceBasedChannel,
        roles: string[],
        permissions: PermissionOverwriteOptions
    ): Promise<void> {
        await this.editChannelRolesPermissions( channel, roles, permissions );

        const everyoneRoleId = channel.guild.roles.everyone.id;

        if ( roles.includes( everyoneRoleId ) ) {
            return;
        }

        const everyonePermissions: PermissionOverwriteOptions = {};

        for ( const permission of Object.keys( permissions ) as ( keyof PermissionOverwriteOptions )[] ) {
            everyonePermissions[ permission ] = false === permissions[ permission ] ? false : null;
        }

        await this.editChannelRolesPermissions( channel, [ everyoneRoleId ], everyonePermissions );
    }

    public async editChannelRolesPermissions(
        channel: VoiceBasedChannel,
        roles: string[],
        permissions: PermissionOverwriteOptions
    ): Promise<void> {
        this.debugger.dumpDown( this.editChannelRolesPermissions, permissions, "Permissions" );

        const updatePromises: Promise<void>[] = [];

        for ( const roleId of roles ) {
            const role = channel.guild.roles.cache.get( roleId );

            if ( !role ) {
                this.logger.warn(
                    this.editChannelRolesPermissions,
                    `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Role id: '${ roleId }' not found`
                );
                continue;
            }

            updatePromises.push(
                channel.permissionOverwrites
                    .edit( role, permissions )
                    .then( () => {
                        this.logger.log(
                            this.editChannelRolesPermissions,
                            `Successfully updated permissions for role: ${ roleId } in channel: ${ channel.id }`
                        );
                    } )
                    .catch( ( error ) => {
                        this.logger.error(
                            this.editChannelRolesPermissions,
                            `Failed to update permissions for role: ${ roleId } in channel: ${ channel.id }`,
                            error
                        );
                        throw error; // Re-throw to mark the overall operation as failed
                    } )
            );
        }

        if ( updatePromises.length === 0 ) {
            this.logger.warn(
                this.editChannelRolesPermissions,
                `No valid roles found to update permissions for channel: ${ channel.id }`
            );
            return;
        }

        // Wait for all permission updates to complete
        await Promise.all( updatePromises );
    }
}
