import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { MasterChannelDynamicDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-dynamic-data-model-v3";

import { InitializeBase } from "@vertix.gg/base/src/bases";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { MasterChannelDynamicDataModel } from "@vertix.gg/base/src/models/master-channel/master-channel-dynamic-data-model";

import type { MasterChannelDynamicConfig } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

export class MasterChannelDataDynamicManager extends InitializeBase {
    private static instance: MasterChannelDataDynamicManager;

    public static getName() {
        return "VertixBase/Managers/MasterChannelDynamicData";
    }

    public static get $() {
        if ( !MasterChannelDataDynamicManager.instance ) {
            MasterChannelDataDynamicManager.instance = new MasterChannelDataDynamicManager();
        }

        return MasterChannelDataDynamicManager.instance;
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", MasterChannelDataDynamicManager.getName() ) ) {
        super( shouldDebugCache );
    }

    protected getModel( masterChannelDB: ChannelExtended ) {
        switch ( masterChannelDB.version ) {
            case VERSION_UI_V3:
                return MasterChannelDynamicDataModelV3.$;
        }

        return MasterChannelDynamicDataModel.$;
    }

    public async getAllSettings(
        masterChannelDB: ChannelExtended,
        defaultSettings: Partial<MasterChannelDynamicConfig["data"]["settings"]> = {}
    ) {
        const settings = await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, false, false );

        if ( !settings ) {
            return defaultSettings;
        }

        return Object.assign( defaultSettings, settings );
    }

    public async setAllSettings(
        masterChannelDB: ChannelExtended,
        settings: MasterChannelDynamicConfig["defaults"]["settings"]
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

    public async getChannelMentionable( masterChannelDB: ChannelExtended, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelMentionable;
    }

    public async getChannelAutosave( masterChannelDB: ChannelExtended, returnDefault?: boolean ) {
        return ( await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, returnDefault ) )
            ?.dynamicChannelAutoSave;
    }

    public async getChannelVerifiedRoles( masterChannelDB: ChannelExtended, guildId: string, cache = true ): Promise<string[]> {
        return (
            await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, cache, ( result ) =>
                result?.dynamicChannelVerifiedRoles.length ? result : { dynamicChannelVerifiedRoles: undefined }
            )
        )?.dynamicChannelVerifiedRoles ?? [ guildId ];
    }

    public async getChannelLogsChannelId( masterChannelDB: ChannelExtended ) {
        return ( await this.getModel( masterChannelDB ).getSettings( masterChannelDB.id, true, ( result ) => result || null ) )
            ?.dynamicChannelLogsChannelId;
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
}
