import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { MasterChannelDataModel } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model";

import { InitializeBase } from "@vertix.gg/base/src/bases";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { MasterChannelConfigInterface, MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

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

        const nextByRole: Record<string, string[]> = {
            ...( settings?.dynamicChannelButtonsTemplateByRole ?? {} )
        };

        delete nextByRole[ roleId ];

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

    public async getChannelVerifiedRoles( masterChannelDB: ChannelExtended, guildId: string, cache = true ): Promise<string[]> {
        const defaults = this.config.defaults.settings;
        const result = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, ( res ) =>
            res?.dynamicChannelVerifiedRoles?.length
                ? { ...defaults, ...res }
                : { ...defaults, dynamicChannelVerifiedRoles: [] }
        );
        return result?.dynamicChannelVerifiedRoles?.length ? result.dynamicChannelVerifiedRoles : [ guildId ];
    }

    /**
     * Function getChannelStaffRoles() :: Returns the roles that are always let into the dynamic
     * channels of a master channel.
     *
     * The mirror of the verified roles: those are the roles the privacy state denies, these are the
     * roles it can never shut out, so a moderator can reach a private or hidden channel without the
     * owner granting them one at a time. Empty by default - nobody bypasses unless an admin says so.
     */
    public async getChannelStaffRoles( masterChannelDB: ChannelExtended, cache = true ): Promise<string[]> {
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
            const previousRoles = await this.getChannelStaffRoles( masterChannelDB );

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

        if ( !roles.length ) {
            roles.push( guildId );
        }

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
