import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/data/v3/master-channel-data-model-v3";

import { MasterChannelDataModel } from "@vertix.gg/base/src/models/data/master-channel-data-model";

import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { ChannelResult } from "@vertix.gg/base/src/models/channel-model";

export class MasterChannelDataManager extends InitializeBase {
    private static instance: MasterChannelDataManager;

    public config =
        ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );

    public keys = this.config.getKeys( "settings" );

    public static getName() {
        return "VertixBase/Managers/MasterChannelData";
    }

    public static get $() {
        if ( ! MasterChannelDataManager.instance ) {
            MasterChannelDataManager.instance = new MasterChannelDataManager();
        }

        return MasterChannelDataManager.instance;
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", MasterChannelDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    protected getModel( masterChannelDB: ChannelResult ) {
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

    public async getAllSettings( masterChannelDB: ChannelResult, defaultSettings: Partial<MasterChannelConfigInterface["data"]["settings"]> = {} ) {
        const settings = await this.getModel( masterChannelDB )
            .getSettings( masterChannelDB.id, false, false );

        if ( ! settings ) {
            return defaultSettings;
        }

        return Object.assign( defaultSettings, settings );
    }

    public async setAllSettings( masterChannelDB: ChannelResult, settings: MasterChannelConfigInterface["defaults"]["settings"] ) {
        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, settings );
    }

    public async getChannelNameTemplate( masterChannelDB: ChannelResult, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB )
            .getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelNameTemplate;
    }

    public async getChannelButtonsTemplate( masterChannelDB: ChannelResult, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB )
            .getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelButtonsTemplate;
    }

    public async getChannelMentionable( masterChannelDB: ChannelResult, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB )
            .getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelMentionable;
    }

    public async getChannelAutosave( masterChannelDB: ChannelResult, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB )
            .getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelAutoSave;
    }

    public async getChannelVerifiedRoles( masterChannelDB: ChannelResult, guildId: string, cache = true ) {
        return ( await this.getModel( masterChannelDB )
                .getSettings(
                    masterChannelDB.id,
                    cache,
                    ( result ) => result?.length ? result : [ guildId ] )
        )?.dynamicChannelVerifiedRoles;
    }

    public async getChannelLogsChannelId( masterChannelDB: ChannelResult ) {
        return ( await this.getModel( masterChannelDB )
                .getSettings(
                    masterChannelDB.id,
                    true,
                    ( result ) => result || null
                )
        )?.dynamicChannelLogsChannelId;
    }

    public async setChannelNameTemplate( masterChannelDB: ChannelResult, newName: string ) {
        this.logger.log( this.setChannelNameTemplate,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel name template: '${ newName }'`
        );

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelNameTemplate: newName
        } );
    }

    public async setChannelButtonsTemplate( masterChannelDB: ChannelResult, newButtons: string[], shouldAdminLog = true ) {
        this.logger.log( this.setChannelButtonsTemplate,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel name template: '${ newButtons }'`
        );

        if ( shouldAdminLog ) {
            const previousButtons = await this.getChannelButtonsTemplate( masterChannelDB, true );

            this.logger.admin( this.setChannelButtonsTemplate,
                `🎚  Dynamic Channel buttons modified  - masterChannelId: "${ masterChannelDB.id }", "${ previousButtons.join( ", " ) }" => "${ newButtons.join( "," ) }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelButtonsTemplate: newButtons
        } );
    }

    public async setChannelMentionable( masterChannelDB: ChannelResult, mentionable: boolean, shouldAdminLog = true ) {
        this.logger.log( this.setChannelMentionable,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel mentionable: '${ mentionable }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setChannelMentionable,
                `@  Dynamic Channel mentionable modified  - masterChannelId: "${ masterChannelDB.id }", "${ mentionable }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelMentionable: mentionable
        } );
    }

    public async setChannelAutoSave( masterChannelDB: ChannelResult, autoSave: boolean, shouldAdminLog = true ) {
        this.logger.log( this.setChannelAutoSave,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel auto save: '${ autoSave }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setChannelAutoSave,
                `⫸  Dynamic Channel auto save modified - masterChannelId: "${ masterChannelDB.id }", "${ autoSave }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelAutoSave: autoSave
        } );
    }

    public async setChannelVerifiedRoles( masterChannelDB: ChannelResult, guildId: string, roles: string[], shouldAdminLog = true ) {
        this.logger.log( this.setChannelVerifiedRoles,
            `Guild id:${ guildId }, master channel id: '${ masterChannelDB.id }' - Setting channel verified roles: '${ roles }'`
        );

        if ( ! roles.length ) {
            roles.push( guildId );
        }

        if ( shouldAdminLog ) {
            const previousRoles = await this.getChannelVerifiedRoles( masterChannelDB, guildId );

            this.logger.admin( this.setChannelVerifiedRoles,
                `🛡️  Dynamic Channel verified roles modified - guildId: "${ guildId }" masterChannelId: "${ masterChannelDB.id }", "${ previousRoles }" => "${ roles }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelVerifiedRoles: roles
        } );
    }

    public async setChannelLogsChannel( masterChannelDB: ChannelResult, channelId: string | null, shouldAdminLog = true ) {
        this.logger.log( this.setChannelLogsChannel,
            `Master channel id: '${ masterChannelDB.id }' - Setting channel logs channel: '${ channelId }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setChannelLogsChannel,
                `❯❯ Set log channel - masterChannelId: "${ masterChannelDB.id }" channelId: "${ channelId }"`
            );
        }

        return this.getModel( masterChannelDB ).setSettings( masterChannelDB.id, {
            dynamicChannelLogsChannelId: channelId
        } );
    }
}
