import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { PermissionsBitField, Guild } from "discord.js";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type {
    Interaction,
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
        if (!PermissionsManager.instance) {
            PermissionsManager.instance = new PermissionsManager();
        }

        return PermissionsManager.instance;
    }

    public constructor() {
        super();

        this.appService = ServiceLocator.$.get("VertixBot/Services/App");

        this.debugger = new Debugger(this, "", isDebugEnabled("MANAGER", PermissionsManager.getName()));
    }

    public async onChannelPermissionsUpdate(oldState: VoiceChannel, newState: VoiceChannel) {
        this.logger.log(
            this.onChannelPermissionsUpdate,
            `Guild id: '${oldState.guildId}', channel id: '${oldState.id}' - Permissions were updated`
        );

        // Print debug new permissions.
        this.debugger.log(
            this.onChannelPermissionsUpdate,
            `Guild id: '${oldState.guildId}' - New permissions for channel id: '${oldState.id}'`
        );
        this.debugger.debugPermissions(this.onChannelPermissionsUpdate, newState.permissionOverwrites);
    }

    public getRolesPermissions(context: Guild, userId = context.client.user.id) {
        const result = new PermissionsBitField();

        for (const role of context.roles.cache.values()) {
            // Skip if user is not in role.
            if (!role.members.get(userId)) {
                continue;
            }

            const rolePermissions = context.roles.cache.get(role.id)?.permissions;

            // Skip non-effected roles, or user not in role.
            if (!rolePermissions || !rolePermissions.bitfield) {
                continue;
            }

            // Add permissions that are allowed.
            result.add(rolePermissions.bitfield);
        }

        return result;
    }

    public getMissingRolePermissions(permissions: bigint[], context: Guild, userId = context.client.user.id): string[] {
        const resultMissingPermissions: PermissionOverwriteOptions = {},
            requiredPermissionsField = new PermissionsBitField(permissions);

        // Determine which roles are missing.
        requiredPermissionsField.toArray().forEach((permission) => {
            resultMissingPermissions[permission] = true;
        });

        // Get all roles in the guild;
        const roles = context.roles.cache.values();

        for (const role of roles) {
            // Skip if user is not in role.
            if (!role.members.get(userId)) {
                continue;
            }

            const rolePermissions = context.roles.cache.get(role.id)?.permissions;

            // Skip non-effected roles, or user not in role.
            if (!rolePermissions || !rolePermissions.bitfield) {
                continue;
            }

            const rolePermissionsField = new PermissionsBitField(rolePermissions.bitfield);

            rolePermissionsField.toArray().forEach((permission) => {
                delete resultMissingPermissions[permission];
            });

            // If resultMissingPermissions is empty.
            if (!Object.keys(resultMissingPermissions).length) {
                break;
            }
        }

        return Object.keys(resultMissingPermissions);
    }

    public getMissingChannelPermissions(
        permissions: bigint[],
        context: VoiceBasedChannel,
        userId = context.client.user.id
    ): string[] {
        const resultMissingPermissions: PermissionOverwriteOptions = {},
            requiredPermissionsField = new PermissionsBitField(permissions);

        // Determine which roles are missing.
        requiredPermissionsField.toArray().forEach((permission) => {
            resultMissingPermissions[permission] = true;
        });

        // Get user permissions that are defined in the voice channel.
        const channelPermissions = context.permissionOverwrites.cache.get(userId),
            permissionFieldAllow = new PermissionsBitField(channelPermissions?.allow.bitfield);

        permissionFieldAllow.toArray().forEach((permission) => {
            delete resultMissingPermissions[permission];
        });

        return Object.keys(resultMissingPermissions);
    }

    /**
     * Function getMissingPermissions() :: Return missing permissions names.
     */
    public getMissingPermissions(permissions: bigint[], context: VoiceBasedChannel): string[];
    public getMissingPermissions(permissions: bigint[], context: Guild): string[];
    public getMissingPermissions(permissions: bigint[], context: VoiceBasedChannel | Guild): string[] {
        if (context instanceof Guild) {
            return this.getMissingRolePermissions(permissions, context);
        }

        return this.getMissingChannelPermissions(permissions, context);
    }

    public getChannelDefaultInheritedPermissions(channel: VoiceBasedChannel) {
        const { permissionOverwrites } = channel,
            result = [];

        for (const overwrite of permissionOverwrites.cache.values()) {
            let { id, allow, deny, type } = overwrite;

            // Exclude `PermissionsBitField.Flags.SendMessages` for everyone.
            if (id === channel.guild.id) {
                deny = deny.remove(PermissionsBitField.Flags.SendMessages);
            }

            this.debugger.debugPermission(this.getChannelDefaultInheritedPermissions, overwrite);

            result.push({ id, allow, deny, type });
        }

        return result;
    }

    public getChannelDefaultInheritedPermissionsWithUser(channel: VoiceBasedChannel, userId: string, overrides = {}) {
        const inheritedPermissions = this.getChannelDefaultInheritedPermissions(channel);

        return [
            ...inheritedPermissions,
            {
                id: userId,
                ...overrides
            }
        ];
    }

    public getChannelDefaultPermissions(userId: string, channel: VoiceBasedChannel, overrides = {}) {
        const inheritedPermissions = this.getChannelDefaultInheritedPermissionsWithUser(channel, userId, overrides);

        return {
            permissionOverwrites: inheritedPermissions
        };
    }

    public async ensureChannelBotConnectivityPermissions(channel: VoiceChannel): Promise<void> {
        if (this.isSelfAdministratorRole(channel.guild)) {
            return;
        }

        await this.ensureChannelBotRolePermissions(
            channel,
            new PermissionsBitField([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect])
        ).catch((error) => {
            this.logger.error(
                this.ensureChannelBotConnectivityPermissions,
                `Guild id: '${channel.guildId}', channel id: '${channel.id}' - ${error}`
            );
        });
    }

    public async hasMemberPermissions(guildId: string, userId: string, permissions: PermissionResolvable) {
        const guild = this.appService.getClient().guilds.cache.get(guildId);

        if (!guild) {
            this.logger.error(this.hasMemberPermissions, `Guild id: '${guildId}' - Guild not found`);
            return false;
        }

        const member = await guild.members.fetch(userId);

        return member.permissions.has(permissions);
    }

    public hasMemberAdminPermission(interaction: Interaction, logFunctionOwner?: Function) {
        if (!interaction.guild) {
            this.logger.error(
                this.hasMemberAdminPermission,
                `Guild id: '${interaction.guildId}', interaction id: '${interaction.id}' - Is not a guild interaction.`
            );
            return false;
        }

        const hasPermission =
            interaction.guild.ownerId === interaction.user.id ||
            interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) ||
            false;

        if (logFunctionOwner && !hasPermission) {
            this.logger.warn(
                logFunctionOwner,
                `Guild id: '${interaction.guildId}', interaction id: '${interaction.id}' - User: '${interaction.user.id}' is not the guild owner`
            );
        }

        return hasPermission;
    }

    public isSelfAdministratorRole(guild: Guild): boolean {
        const botMember = guild.members.cache.get(guild.client.user.id);

        if (!botMember) {
            return false;
        }

        return botMember.permissions.has(PermissionsBitField.Flags.Administrator);
    }

    public async ensureChannelBotRolePermissions(
        channel: VoiceBasedChannel,
        permissions: PermissionsBitField
    ): Promise<void> {
        const botMember = channel.guild.members.cache.get(channel.guild.client.user.id);

        if (!botMember) {
            this.logger.error(
                this.ensureChannelBotRolePermissions,
                `Guild id: '${channel.guildId}', channel id: '${channel.id}' - Bot member not found`
            );
            return;
        }

        const botRole = botMember.roles.cache.first();

        if (!botRole) {
            this.logger.error(
                this.ensureChannelBotRolePermissions,
                `Guild id: '${channel.guildId}', channel id: '${channel.id}' - Bot role not found`
            );
            return;
        }

        const permissionsOptions: PermissionOverwriteOptions = {};
        for (const permission of permissions.toArray()) {
            permissionsOptions[permission] = true;
        }

        const rolePermissions = channel.permissionOverwrites.cache.get(botRole.id);

        if (!rolePermissions) {
            await this.editChannelRolesPermissions(channel, [botRole.id], permissionsOptions);
            return;
        }

        if (rolePermissions.allow.has(permissions)) {
            return;
        }

        await this.editChannelRolesPermissions(channel, [botRole.id], permissionsOptions);
    }

    public async editChannelRolesPermissions(
        channel: VoiceBasedChannel,
        roles: string[],
        permissions: PermissionOverwriteOptions
    ): Promise<void> {
        this.debugger.dumpDown(this.editChannelRolesPermissions, permissions, "Permissions");

        return new Promise((resolve, reject) => {
            for (const roleId of roles) {
                const role = channel.guild.roles.cache.get(roleId);

                if (!role) {
                    this.logger.warn(
                        this.editChannelRolesPermissions,
                        `Guild id: '${channel.guildId}', channel id: ${channel.id} - Role id: '${roleId}' not found`
                    );
                    continue;
                }

                channel.permissionOverwrites
                    .edit(role, permissions)
                    .catch(reject)
                    .then(() => resolve());
            }
        });
    }
}
