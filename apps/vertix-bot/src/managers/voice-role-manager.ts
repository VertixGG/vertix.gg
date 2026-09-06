import { PermissionsBitField } from "discord.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import type { Guild, GuildMember, Role, Snowflake, VoiceState } from "discord.js";

export class VoiceRoleManager extends InitializeBase {
    private static instance: VoiceRoleManager;

    public static getName() {
        return "VertixBot/Managers/VoiceRole";
    }

    public static get $() {
        if ( ! VoiceRoleManager.instance ) {
            VoiceRoleManager.instance = new VoiceRoleManager();
        }

        return VoiceRoleManager.instance;
    }

    /**
     * Function syncMember() :: Converges a member's voice role on where they are now.
     *
     * `ChannelService.onSwitch()` decomposes a channel switch into a join of the new channel
     * followed by a leave of the old one, and the event bus emits without awaiting its subscribers,
     * so the two arrive in no guaranteed order. Reacting to either one on its own would leave a
     * member who moved between two dynamic channels without the role.
     *
     * Both handlers therefore call this, which reads the states rather than the transition and
     * ends at the same answer whichever ran last.
     */
    public async syncMember( oldState: VoiceState, newState: VoiceState ) {
        const member = newState.member ?? oldState.member;

        if ( ! member ) {
            return;
        }

        const targetRoleId = await this.resolveRoleId( newState.guild, newState.channelId ),
            previousRoleId = await this.resolveRoleId( oldState.guild, oldState.channelId );

        if ( previousRoleId && previousRoleId !== targetRoleId ) {
            await this.removeRole( member, previousRoleId );
        }

        if ( targetRoleId ) {
            await this.addRole( member, targetRoleId );
        }
    }

    /**
     * Function reconcileGuild() :: Strips the voice role from anyone who is not in a dynamic
     * channel right now.
     *
     * A crash leaves the role on whoever held it, and discord never cleans it up, so without this
     * a restart is enough to hand out a permanent role.
     */
    public async reconcileGuild( guild: Guild ) {
        const roleIds = await this.getConfiguredRoleIds( guild );

        if ( ! roleIds.size ) {
            return;
        }

        let removed = 0;

        for ( const roleId of roleIds ) {
            const role = guild.roles.cache.get( roleId );

            if ( ! role ) {
                continue;
            }

            for ( const member of role.members.values() ) {
                const shouldHold = await this.resolveRoleId( guild, member.voice.channelId );

                if ( shouldHold === roleId ) {
                    continue;
                }

                await this.removeRole( member, roleId );

                removed++;
            }
        }

        if ( removed ) {
            this.logger.info(
                this.reconcileGuild,
                `Guild id: '${ guild.id }' - Reclaimed the voice role from ${ removed } member(s)`
            );
        }
    }

    /**
     * Function isRoleAssignable() :: Whether the bot can actually hand this role out.
     *
     * Used by the pickers so an admin is told at the moment they choose, rather than the feature
     * failing silently on every join afterwards.
     */
    public isRoleAssignable( role: Role ): { assignable: boolean; reason?: string } {
        const botMember = role.guild.members.me;

        if ( ! botMember ) {
            return { assignable: false, reason: "unknown-bot-member" };
        }

        if ( ! botMember.permissions.has( PermissionsBitField.Flags.ManageRoles ) ) {
            return { assignable: false, reason: "missing-manage-roles" };
        }

        if ( role.managed ) {
            return { assignable: false, reason: "managed-role" };
        }

        if ( role.id === role.guild.id ) {
            return { assignable: false, reason: "everyone-role" };
        }

        if ( botMember.roles.highest.comparePositionTo( role ) <= 0 ) {
            return { assignable: false, reason: "role-above-bot" };
        }

        return { assignable: true };
    }

    /**
     * Function resolveRoleId() :: The voice role that applies to a channel.
     *
     * A master channel's own setting wins, the guild wide default is the fallback, and a channel
     * that is not dynamic has none at all.
     */
    private async resolveRoleId( guild: Guild, channelId: Snowflake | null ): Promise<string | null> {
        if ( ! channelId || ! ( await ChannelModel.$.isDynamic( channelId ) ) ) {
            return null;
        }

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channelId );

        if ( masterChannelDB ) {
            const masterRoleId = await MasterChannelDataManager.$.getChannelVoiceRoleId( masterChannelDB );

            if ( masterRoleId ) {
                return masterRoleId;
            }
        }

        return GuildDataManager.$.getVoiceRoleId( guild.id );
    }

    private async getConfiguredRoleIds( guild: Guild ) {
        const result = new Set<string>();

        const guildRoleId = await GuildDataManager.$.getVoiceRoleId( guild.id );

        if ( guildRoleId ) {
            result.add( guildRoleId );
        }

        for ( const masterChannelDB of await ChannelModel.$.getMasters( guild.id, "settings" ) ) {
            const masterRoleId = await MasterChannelDataManager.$.getChannelVoiceRoleId( masterChannelDB );

            if ( masterRoleId ) {
                result.add( masterRoleId );
            }
        }

        return result;
    }

    private async addRole( member: GuildMember, roleId: string ) {
        if ( member.roles.cache.has( roleId ) ) {
            return;
        }

        const role = this.getAssignableRole( member.guild, roleId, member.id );

        if ( ! role ) {
            return;
        }

        await member.roles.add( role ).catch( ( error ) => {
            this.logger.error(
                this.addRole,
                `Guild id: '${ member.guild.id }' - Failed to add voice role '${ roleId }' to '${ member.id }'`,
                error
            );
        } );
    }

    private async removeRole( member: GuildMember, roleId: string ) {
        if ( ! member.roles.cache.has( roleId ) ) {
            return;
        }

        const role = this.getAssignableRole( member.guild, roleId, member.id );

        if ( ! role ) {
            return;
        }

        await member.roles.remove( role ).catch( ( error ) => {
            this.logger.error(
                this.removeRole,
                `Guild id: '${ member.guild.id }' - Failed to remove voice role '${ roleId }' from '${ member.id }'`,
                error
            );
        } );
    }

    private getAssignableRole( guild: Guild, roleId: string, memberId: string ) {
        const role = guild.roles.cache.get( roleId );

        if ( ! role ) {
            this.logger.warn(
                this.getAssignableRole,
                `Guild id: '${ guild.id }' - Voice role '${ roleId }' no longer exists`
            );

            return null;
        }

        const { assignable, reason } = this.isRoleAssignable( role );

        if ( ! assignable ) {
            this.logger.warn(
                this.getAssignableRole,
                `Guild id: '${ guild.id }' - Voice role '${ role.name }' cannot be applied to '${ memberId }' - ${ reason }`
            );

            return null;
        }

        return role;
    }
}

export default VoiceRoleManager;
