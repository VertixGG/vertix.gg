import { PermissionsBitField } from "discord.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";
import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { ROLE_UNASSIGNABLE_REASONS } from "@vertix.gg/definitions/src/ipc-definitions";

import type { TRoleUnassignableReason } from "@vertix.gg/definitions/src/ipc-definitions";

import type { Guild, GuildMember, Role, Snowflake, VoiceState } from "discord.js";

export class VoiceRoleManager extends InitializeBase {
    private static instance: VoiceRoleManager;

    /**
     * Guilds this process has already reconciled, by id.
     *
     * Holds the in-flight promise rather than a flag so that concurrent voice events in one guild
     * join the same reconcile instead of racing several. It grows with guilds that are *used*, not
     * with guilds the bot is in.
     */
    private readonly reconciledGuilds = new Map<string, Promise<void>>();

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

        // Not awaited: the reconcile is a cleanup of what a previous process left behind, and this
        // member's own role should not wait on it. Order does not matter either way - a member who
        // is in the channel reads as `shouldHold`, so a reconcile running alongside this cannot
        // take back the role it is about to hand out.
        void this.ensureGuildReconciled( newState.guild ?? oldState.guild );

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
     * Function ensureGuildReconciled() :: Reconciles a guild once, the first time this process sees
     * voice activity in it.
     *
     * This used to run for every guild the bot was in, serially, before the bot finished starting.
     * That is a database read per guild whether or not the guild has a voice role configured, and
     * it is work proportional to how many servers the bot was ever added to rather than to how many
     * are being used - the cost that makes a restart take longer the more successful the bot gets.
     *
     * Deferring it loses nothing that matters: the role it reclaims is one held by somebody who is
     * *not* in a voice channel, and the only way that becomes visible to anyone is through voice
     * activity in that guild - which is exactly what triggers this.
     */
    public async ensureGuildReconciled( guild: Guild ): Promise<void> {
        const inFlight = this.reconciledGuilds.get( guild.id );

        if ( inFlight ) {
            return inFlight;
        }

        // Stored before it is awaited so that a burst of joins in one guild starts one reconcile
        // rather than one per event, and dropped again on failure so a later event can retry -
        // a guild left un-reconciled goes on handing out a role nobody should hold.
        const work = this.reconcileGuild( guild ).catch( ( error ) => {
            this.reconciledGuilds.delete( guild.id );

            this.logger.error(
                this.ensureGuildReconciled,
                `Guild id: '${ guild.id }' - Failed to reconcile voice roles`,
                error
            );
        } );

        this.reconciledGuilds.set( guild.id, work );

        return work;
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
    public isRoleAssignable( role: Role ): { assignable: boolean; reason?: TRoleUnassignableReason } {
        const botMember = role.guild.members.me;

        if ( ! botMember ) {
            return { assignable: false, reason: ROLE_UNASSIGNABLE_REASONS.UNKNOWN_BOT_MEMBER };
        }

        if ( ! botMember.permissions.has( PermissionsBitField.Flags.ManageRoles ) ) {
            return { assignable: false, reason: ROLE_UNASSIGNABLE_REASONS.MISSING_MANAGE_ROLES };
        }

        if ( role.managed ) {
            return { assignable: false, reason: ROLE_UNASSIGNABLE_REASONS.MANAGED_ROLE };
        }

        if ( role.id === role.guild.id ) {
            return { assignable: false, reason: ROLE_UNASSIGNABLE_REASONS.EVERYONE_ROLE };
        }

        if ( botMember.roles.highest.comparePositionTo( role ) <= 0 ) {
            return { assignable: false, reason: ROLE_UNASSIGNABLE_REASONS.ROLE_ABOVE_BOT };
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
