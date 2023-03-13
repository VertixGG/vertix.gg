import { Guild, PermissionsBitField, VoiceChannel } from "discord.js";

import DynamicoManager from "@dynamico/managers/dynamico";

import { DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS } from "@dynamico/constants/master-channel";

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
    public static getMissingPermissions( context: Guild, permissions?: bigint[] ): string[];
    public static getMissingPermissions( context: VoiceChannel, permissions?: bigint[] ): string[];
    public static getMissingPermissions( context: VoiceChannel|Guild, permissions: bigint[] = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow ) {
        const result: string[] = [];

        let guild: Guild;

        if ( ! permissions.length ) {
            permissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow;
        }

        if ( context instanceof Guild ) {
            guild = context;
        } else {
            guild = context.guild;
        }

        const selfRoleId = this.getSelfRoleId( guild );

        if ( ! selfRoleId ) {
            return result;
        }

        // Get guild role permissions.
        const guildRolePermissions = guild.roles.cache.get( selfRoleId )?.permissions,
            guildRolePermissionsField = new PermissionsBitField( guildRolePermissions ),
            missingGuildRolePermissions = guildRolePermissionsField.missing( permissions );

        if ( missingGuildRolePermissions.length ) {
            result.push( ... missingGuildRolePermissions );
        }

        if ( context instanceof VoiceChannel ) {
            // Ensure there are no overwrites that effect the bot role.
            const permissionOverwrites = context.permissionOverwrites.cache.get( selfRoleId );

            if ( permissionOverwrites ) {
                // Loop through the permissions that are defined in the overwrites.
                for ( const permission of permissionOverwrites.deny.toArray() ) {
                    if ( guildRolePermissionsField.has( permission ) && ! result.includes( permission ) ) {
                        result.push( permission );
                    }
                }
            }
        }

        return result;
    }
}

export default Permissions;
