import { Guild, PermissionOverwriteOptions, PermissionsBitField, User, VoiceChannel } from "discord.js";

import DynamicoManager from "@dynamico/managers/dynamico";

import { ObjectBase } from "@internal/bases";

export class Permissions extends ObjectBase {
    public static getName() {
        return "Dynamico/Utils/Permissions";
    }

    public static hasSelfAdminPermissions( guild: Guild ) {
        const client = DynamicoManager.getInstance().getClient(),
            botMember = guild.members.cache.get( client?.user?.id || "" );

        return botMember?.permissions.has( PermissionsBitField.Flags.Administrator );
    }

    public static getSelfRoleId( guild: Guild ) {
        const client = DynamicoManager.getInstance().getClient(),
            botMember = guild.members.cache.get( client?.user?.id || "" ),
            id = botMember?.roles.highest.id;

        if ( ! id ) {
            throw new Error( "Bot role not found." );
        }

        return id;
    }

    /**
     * Function getMissingPermissions() :: Return missing permissions names.
     */
    public static getMissingPermissions( permissions: bigint[], context: VoiceChannel, user: User ): string[];
    public static getMissingPermissions( permissions: bigint[], context: VoiceChannel ): string[];
    public static getMissingPermissions( permissions: bigint[], context: Guild ): string[];
    public static getMissingPermissions( permissions: bigint[], context: VoiceChannel | Guild, user?: User ) {
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

export default Permissions;
