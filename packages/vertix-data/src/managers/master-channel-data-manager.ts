import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { InitializeBase } from "@vertix.gg/base/src/bases";

import { MasterChannelDataModelV3 } from "@vertix.gg/data/src/models/master-channel/master-channel-data-model-v3";

import { MasterChannelDataModel } from "@vertix.gg/data/src/models/master-channel/master-channel-data-model";

import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";

import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";

import type { ChannelPrivacyStateDefault, MasterChannelConfigInterface, MasterChannelConfigInterfaceV3 } from "@vertix.gg/data/src/interfaces/master-channel-config";
import type { ChannelExtended } from "@vertix.gg/data/src/models/channel/channel-client-extend";

export type MasterChannelSettingsAllVersions =
    MasterChannelConfigInterface[ "data" ][ "settings" ] & Partial<MasterChannelConfigInterfaceV3[ "data" ][ "settings" ]>;

export class MasterChannelDataManager extends InitializeBase {
    private static instance: MasterChannelDataManager;

    public config = ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );

    public keys = this.config.getKeys( "settings" );

    public static getName() {
        return "VertixBase/Managers/MasterChannelData";
    }

    public static get $() {
        if ( !MasterChannelDataManager.instance ) {
            MasterChannelDataManager.instance = new MasterChannelDataManager();
        }

        return MasterChannelDataManager.instance;
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", MasterChannelDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    protected getModel( masterChannelDB: ChannelExtended ) {
        switch ( masterChannelDB.version ) {
            case VERSION_UI_V3:
                return MasterChannelDataModelV3.$;
        }

        return MasterChannelDataModel.$;
    }

    // TODO: Remove
    public getKeys() {
        return this.keys;
    }

    public async getAllSettings(
        masterChannelDB: ChannelExtended,
        defaultSettings: Partial<MasterChannelSettingsAllVersions> = {}
    ): Promise<MasterChannelSettingsAllVersions> {
        const settings = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, false, false );
        const defaults = this.config.defaults.settings;

        if ( !settings ) {
            return { ...defaults, ...defaultSettings } as MasterChannelSettingsAllVersions;
        }

        return { ...defaults, ...defaultSettings, ...settings } as MasterChannelSettingsAllVersions;
    }

    public async setAllSettings(
        masterChannelDB: ChannelExtended,
        settings: MasterChannelConfigInterface[ "defaults" ][ "settings" ]
    ) {
        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, settings );
    }

    public async getChannelNameTemplate( masterChannelDB: ChannelExtended, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelNameTemplate;
    }

    public async getChannelButtonsTemplate( masterChannelDB: ChannelExtended, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelButtonsTemplate;
    }

    /**
     * Function getChannelButtonsTemplateOverrides() :: Every role that carries a button set.
     *
     * Resolving a panel means walking the owner's roles in order, so the whole map is read once
     * rather than asked about one role at a time.
     */
    public async getChannelButtonsTemplateOverrides(
        masterChannelDB: ChannelExtended,
        cache = true
    ): Promise<Record<string, string[]>> {
        const settings = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, true );

        return settings?.dynamicChannelButtonsTemplateByRole ?? {};
    }

    public async getChannelButtonsTemplateByRole(
        masterChannelDB: ChannelExtended,
        roleId: string,
        returnDefault = false
    ): Promise<string[] | undefined> {
        const settings = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, returnDefault );

        const overrides = settings?.dynamicChannelButtonsTemplateByRole ?? {};
        const override = overrides[ roleId ];

        if ( Array.isArray( override ) && override.length ) {
            return override;
        }

        if ( returnDefault ) {
            return settings?.dynamicChannelButtonsTemplate;
        }

        return undefined;
    }

    public async setChannelButtonsTemplateForRole(
        masterChannelDB: ChannelExtended,
        roleId: string,
        newButtons: string[],
        shouldAdminLog = true
    ) {
        const settings = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, true );
        const previous = settings?.dynamicChannelButtonsTemplateByRole?.[ roleId ] ?? [];

        const nextByRole: Record<string, string[]> = {
            ...( settings?.dynamicChannelButtonsTemplateByRole ?? {} ),
            [ roleId ]: newButtons
        };

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setChannelButtonsTemplateForRole,
                `🎚  Dynamic Channel role buttons modified - masterChannelId: "${ masterChannelDB.id }", roleId: "${ roleId }", "${ previous.join( ", " ) }" => "${ newButtons.join( "," ) }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelButtonsTemplateByRole: nextByRole
        } );
    }

    public async removeChannelButtonsTemplateForRole(
        masterChannelDB: ChannelExtended,
        roleId: string,
        shouldAdminLog = true
    ) {
        const settings = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, true );
        const previous = settings?.dynamicChannelButtonsTemplateByRole?.[ roleId ] ?? [];

        // An omitted key does not survive the round trip - `setSettings()` merges through
        // `deepMerge()`, which copies the stored object and then walks only the keys it was given,
        // so a role left out of this map keeps whatever it already had. Arrays are replaced
        // wholesale, so writing an empty one is the only removal that actually lands, and every
        // reader already treats an empty role entry as no set at all.
        const nextByRole: Record<string, string[]> = {
            ...( settings?.dynamicChannelButtonsTemplateByRole ?? {} ),
            [ roleId ]: []
        };

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.removeChannelButtonsTemplateForRole,
                `🎚  Dynamic Channel role buttons removed - masterChannelId: "${ masterChannelDB.id }", roleId: "${ roleId }", "${ previous.join( ", " ) }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelButtonsTemplateByRole: nextByRole
        } );
    }

    public async getChannelMentionable( masterChannelDB: ChannelExtended, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelMentionable;
    }

    public async getChannelAutosave( masterChannelDB: ChannelExtended, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelAutoSave;
    }

    /**
     * Function getChannelAutoStatus() :: Whether the bot writes the voice channel status by itself.
     *
     * Falls back to the default, since the setting postdates the master channels that were set up
     * before it and their stored settings simply have no such key.
     */
    public async getChannelAutoStatus( masterChannelDB: ChannelExtended, cache = true ): Promise<boolean> {
        const defaults = this.config.defaults.settings;
        const result = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, ( res ) =>
            res ? { ...defaults, ...res } : defaults
        );

        return result?.dynamicChannelAutoStatus ?? defaults.dynamicChannelAutoStatus;
    }

    /**
     * Function getChannelVerifiedRoles() :: The audience of a master channel's dynamic channels.
     *
     * Its own list wins, and an empty one defers to the guild wide default.
     */
    public async getChannelVerifiedRoles( masterChannelDB: ChannelExtended, guildId: string, cache = true ): Promise<string[]> {
        const ownRoleIds = await this.getChannelOwnVerifiedRoles( masterChannelDB, guildId, cache );

        if ( ownRoleIds.length ) {
            return ownRoleIds;
        }

        return GuildDataManager.$.resolveVerifiedRoleIds( guildId );
    }

    /**
     * Function getChannelOwnVerifiedRoles() :: The list a master channel holds itself, empty when
     * it defers to the guild wide default.
     *
     * The editing screens need the stored answer rather than the resolved one - handing an
     * inherited list to an editor lets a save write it back as the channel's own and quietly stop
     * it following the server.
     *
     * `@everyone` alone is not a choice, it is the absence of one - the whole server is what an
     * audience narrows down from - so a channel holding only it is treated as having none of its
     * own. Every channel created before the guild wide list existed was seeded that way.
     */
    public async getChannelOwnVerifiedRoles(
        masterChannelDB: ChannelExtended,
        guildId: string,
        cache = true
    ): Promise<string[]> {
        const defaults = this.config.defaults.settings;
        const result = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, ( res ) =>
            res ? { ...defaults, ...res } : defaults
        );

        const roleIds = result?.dynamicChannelVerifiedRoles ?? [];

        if ( 1 === roleIds.length && guildId === roleIds[ 0 ] ) {
            return [];
        }

        return roleIds;
    }

    /**
     * Function getChannelStaffRoles() :: Returns the roles that are always let into the dynamic
     * channels of a master channel.
     *
     * The mirror of the verified roles: those are the roles the privacy state denies, these are the
     * roles it can never shut out, so a moderator can reach a private or hidden channel without the
     * owner granting them one at a time.
     *
     * Its own list wins, an empty one defers to the guild wide default, and a guild that set none
     * of its own means nobody bypasses the owner.
     */
    public async getChannelStaffRoles( masterChannelDB: ChannelExtended, guildId: string, cache = true ): Promise<string[]> {
        const ownRoleIds = await this.getChannelOwnStaffRoles( masterChannelDB, cache );

        if ( ownRoleIds.length ) {
            return ownRoleIds;
        }

        return GuildDataManager.$.getStaffRoleIds( guildId );
    }

    /**
     * Function getChannelOwnStaffRoles() :: The staff roles mirror of
     * `getChannelOwnVerifiedRoles()`.
     */
    public async getChannelOwnStaffRoles( masterChannelDB: ChannelExtended, cache = true ): Promise<string[]> {
        const defaults = this.config.defaults.settings;
        const result = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, ( res ) =>
            res ? { ...defaults, ...res } : defaults
        );

        return result?.dynamicChannelStaffRoles ?? [];
    }

    public async setChannelStaffRoles(
        masterChannelDB: ChannelExtended,
        guildId: string,
        roles: string[],
        shouldAdminLog = true
    ) {
        this.logger.log(
            this.setChannelStaffRoles,
            `Guild id:${ guildId }, master channel id: '${ masterChannelDB.id }' - Setting channel staff roles: '${ roles }'`
        );

        if ( shouldAdminLog ) {
            const previousRoles = await this.getChannelStaffRoles( masterChannelDB, guildId );

            this.logger.admin(
                this.setChannelStaffRoles,
                `🛠️  Dynamic Channel staff roles modified - guildId: "${ guildId }" masterChannelId: "${ masterChannelDB.id }", "${ previousRoles }" => "${ roles }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelStaffRoles: roles
        } );
    }

    /**
     * Function getChannelVoiceRoleId() :: The voice role of a single master channel, or null when
     * it defers to the guild wide default.
     */
    public async getChannelVoiceRoleId( masterChannelDB: ChannelExtended, cache = true ): Promise<string | null> {
        const defaults = this.config.defaults.settings;
        const result = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, ( res ) =>
            res ? { ...defaults, ...res } : defaults
        );

        return result?.dynamicChannelVoiceRoleId ?? null;
    }

    public async setChannelVoiceRoleId(
        masterChannelDB: ChannelExtended,
        guildId: string,
        roleId: string | null,
        shouldAdminLog = true
    ) {
        if ( shouldAdminLog ) {
            const previousRoleId = await this.getChannelVoiceRoleId( masterChannelDB );

            this.logger.admin(
                this.setChannelVoiceRoleId,
                `🎙️  Dynamic Channel voice role modified - guildId: "${ guildId }" masterChannelId: "${ masterChannelDB.id }", "${ previousRoleId }" => "${ roleId }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelVoiceRoleId: roleId
        } );
    }

    /**
     * Function getChannelDefaultPrivacyState() :: What a newly created dynamic channel starts as.
     */
    public async getChannelDefaultPrivacyState(
        masterChannelDB: ChannelExtended,
        cache = true
    ): Promise<ChannelPrivacyStateDefault> {
        const defaults = this.config.defaults.settings;
        const result = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, ( res ) =>
            res ? { ...defaults, ...res } : defaults
        );

        return result?.dynamicChannelDefaultPrivacyState ?? defaults.dynamicChannelDefaultPrivacyState;
    }

    public async setChannelDefaultPrivacyState(
        masterChannelDB: ChannelExtended,
        guildId: string,
        state: ChannelPrivacyStateDefault,
        shouldAdminLog = true
    ) {
        if ( shouldAdminLog ) {
            const previousState = await this.getChannelDefaultPrivacyState( masterChannelDB );

            this.logger.admin(
                this.setChannelDefaultPrivacyState,
                `🔒  Dynamic Channel default privacy modified - guildId: "${ guildId }" masterChannelId: "${ masterChannelDB.id }", "${ previousState }" => "${ state }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelDefaultPrivacyState: state
        } );
    }

    /**
     * Function getChannelDefaultUserLimit() :: The user limit a new dynamic channel starts with.
     *
     * Null means it is not set, and the limit of the master channel is copied instead - the
     * behaviour that predates this setting.
     */
    public async getChannelDefaultUserLimit(
        masterChannelDB: ChannelExtended,
        cache = true
    ): Promise<number | null> {
        const defaults = this.config.defaults.settings;
        const result = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, ( res ) =>
            res ? { ...defaults, ...res } : defaults
        );

        return result?.dynamicChannelDefaultUserLimit ?? null;
    }

    public async setChannelDefaultUserLimit(
        masterChannelDB: ChannelExtended,
        guildId: string,
        userLimit: number | null,
        shouldAdminLog = true
    ) {
        if ( shouldAdminLog ) {
            const previousUserLimit = await this.getChannelDefaultUserLimit( masterChannelDB );

            this.logger.admin(
                this.setChannelDefaultUserLimit,
                `✋  Dynamic Channel default user limit modified - guildId: "${ guildId }" masterChannelId: "${ masterChannelDB.id }", "${ previousUserLimit }" => "${ userLimit }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelDefaultUserLimit: userLimit
        } );
    }

    public async getChannelLogsChannelId( masterChannelDB: ChannelExtended ) {
        const defaults = this.config.defaults.settings;
        const result = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, ( res ) =>
            res ? { ...defaults, ...res } : defaults
        );
        return result?.dynamicChannelLogsChannelId ?? undefined;
    }

    public async setChannelNameTemplate( masterChannelDB: ChannelExtended, newName: string ) {
        this.logger.log(
            this.setChannelNameTemplate,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel name template: '${ newName }'`
        );

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelNameTemplate: newName
        } );
    }

    public async setChannelButtonsTemplate(
        masterChannelDB: ChannelExtended,
        newButtons: string[],
        shouldAdminLog = true
    ) {
        this.logger.log(
            this.setChannelButtonsTemplate,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel name template: '${ newButtons }'`
        );

        if ( shouldAdminLog ) {
            const previousButtons = ( await this.getChannelButtonsTemplate( masterChannelDB, true ) ) || [];

            this.logger.admin(
                this.setChannelButtonsTemplate,
                `🎚  Dynamic Channel buttons modified  - masterChannelId: "${ masterChannelDB.id }", "${ previousButtons.join( ", " ) }" => "${ newButtons.join( "," ) }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelButtonsTemplate: newButtons
        } );
    }

    public async setChannelMentionable( masterChannelDB: ChannelExtended, mentionable: boolean, shouldAdminLog = true ) {
        this.logger.log(
            this.setChannelMentionable,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel mentionable: '${ mentionable }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setChannelMentionable,
                `@  Dynamic Channel mentionable modified  - masterChannelId: "${ masterChannelDB.id }", "${ mentionable }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelMentionable: mentionable
        } );
    }

    public async setChannelAutoSave( masterChannelDB: ChannelExtended, autoSave: boolean, shouldAdminLog = true ) {
        this.logger.log(
            this.setChannelAutoSave,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel auto save: '${ autoSave }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setChannelAutoSave,
                `⫸  Dynamic Channel auto save modified - masterChannelId: "${ masterChannelDB.id }", "${ autoSave }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelAutoSave: autoSave
        } );
    }

    public async setChannelAutoStatus( masterChannelDB: ChannelExtended, autoStatus: boolean, shouldAdminLog = true ) {
        this.logger.log(
            this.setChannelAutoStatus,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel auto status: '${ autoStatus }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setChannelAutoStatus,
                `📢  Dynamic Channel auto status modified - masterChannelId: "${ masterChannelDB.id }", "${ autoStatus }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelAutoStatus: autoStatus
        } );
    }

    public async setChannelVerifiedRoles(
        masterChannelDB: ChannelExtended,
        guildId: string,
        roles: string[],
        shouldAdminLog = true
    ) {
        this.logger.log(
            this.setChannelVerifiedRoles,
            `Guild id:${ guildId }, master channel id: '${ masterChannelDB.id }' - Setting channel verified roles: '${ roles }'`
        );

        if ( shouldAdminLog ) {
            const previousRoles = await this.getChannelVerifiedRoles( masterChannelDB, guildId );

            this.logger.admin(
                this.setChannelVerifiedRoles,
                `🛡️  Dynamic Channel verified roles modified - guildId: "${ guildId }" masterChannelId: "${ masterChannelDB.id }", "${ previousRoles }" => "${ roles }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelVerifiedRoles: roles
        } );
    }

    public async setChannelLogsChannel(
        masterChannelDB: ChannelExtended,
        channelId: string | null,
        shouldAdminLog = true
    ) {
        this.logger.log(
            this.setChannelLogsChannel,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel logs channel: '${ channelId }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setChannelLogsChannel,
                `❯❯ Set log channel - masterChannelId: "${ masterChannelDB.id }" channelId: "${ channelId }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelLogsChannelId: channelId
        } );
    }

    public async setChannelControlChannel(
        masterChannelDB: ChannelExtended,
        channelId: string | null,
        shouldAdminLog = true
    ) {
        this.logger.log(
            this.setChannelControlChannel,
            `Master channel id: '${ masterChannelDB.id }' - Setting control panel channel: '${ channelId }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setChannelControlChannel,
                `▥ Set control panel channel - masterChannelId: "${ masterChannelDB.id }" channelId: "${ channelId }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelControlChannelId: channelId
        } );
    }
}
