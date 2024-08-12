import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";

import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

type MasterChannelDataKey = keyof MasterChannelConfigInterface["defaults"]["masterChannelSettings"];

export class MasterChannelDataManager extends ChannelDataManager {
    public config =
        ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );

    public keys = this.config.getKeys( "masterChannelSettings" );

    public static getName() {
        return "VertixBase/Managers/MasterChannelData";
    }

    public static get $() {
        return MasterChannelDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", MasterChannelDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    public getKeys() {
        return this.keys;
    }

    protected async getSettings(
        caller: Function,
        ownerId: string,
        key: MasterChannelDataKey,
        cache = true,
        returnDefault?: ( ( result: any ) => any ) | boolean
    ) {
        const isReturnDefaultCallback = "function" === typeof returnDefault;

        // Do we return `defaultSettings` if there are no data?
        const defaultSettings = ! isReturnDefaultCallback && returnDefault
            ? this.config.data.masterChannelSettings : null;

        const result = await ChannelDataManager.$.getSettingsData(
            ownerId,
            defaultSettings,
            cache
        );

        let value = result?.object?.[ key ];

        if ( isReturnDefaultCallback ) {
            value = returnDefault( value );
        }

        this.debugger.dumpDown( caller,
            value,
            `ownerId: '${ ownerId }' returnDefault: '${ !! returnDefault }' - ${ key }`
        );

        return value;
    }

    public async getAllSettings( ownerId: string, defaultSettings: Partial<MasterChannelConfigInterface["defaults"]["masterChannelSettings"]> = {} ) {
        const settings = await this.getSettingsData( ownerId, false ) || {
            object: {}
        };

        // If default setting is provided and there are no setting, apply default setting.
        Object.keys( defaultSettings ).forEach( ( key ) => {
            if ( ! settings?.object?.[ key ] ) {
                settings.object[ key ] = defaultSettings[ key as keyof typeof defaultSettings ];
            }
        } );

        return settings;
    }

    public async getChannelNameTemplate( ownerId: string, returnDefault?: boolean ) {
        return this.getSettings(
            this.getChannelNameTemplate,
            ownerId,
            this.keys.dynamicChannelNameTemplate,
            true,
            returnDefault
        );
    }

    public async getChannelButtonsTemplate( ownerId: string, returnDefault?: boolean ) {
        return this.getSettings(
            this.getChannelButtonsTemplate,
            ownerId,
            this.keys.dynamicChannelButtonsTemplate,
            true,
            returnDefault
        );
    }

    public async getChannelMentionable( ownerId: string, returnDefault?: boolean ) {
        return this.getSettings(
            this.getChannelMentionable,
            ownerId,
            this.keys.dynamicChannelMentionable,
            true,
            returnDefault,
        );
    }

    public async getChannelAutosave( ownerId: string, returnDefault?: boolean ) {
        return this.getSettings(
            this.getChannelAutosave,
            ownerId,
            this.keys.dynamicChannelAutoSave,
            true,
            returnDefault,
        );
    }

    public async getChannelVerifiedRoles( ownerId: string, guildId: string, cache = true ) {
        return this.getSettings(
            this.getChannelVerifiedRoles,
            ownerId,
            this.keys.dynamicChannelVerifiedRoles,
            cache,
            ( result ) => result?.length ? result : [ guildId ]
        );
    }

    public async getChannelLogsChannelId( ownerId: string ) {
        return this.getSettings(
            this.getChannelLogsChannelId,
            ownerId,
            this.keys.dynamicChannelLogsChannelId,
            true,
            ( result ) => result || null
        );
    }

    public async setAllSettings( ownerId: string, settings: MasterChannelConfigInterface["defaults"]["masterChannelSettings"] ) {
        return ChannelDataManager.$.setSettingsData( ownerId, settings );
    }

    public async setChannelNameTemplate( ownerId: string, newName: string ) {
        this.logger.log( this.setChannelNameTemplate,
            `Master channel id: '${ ownerId }' - Setting channel name template: '${ newName }'`
        );

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ this.keys.dynamicChannelNameTemplate ]: newName
        } );
    }

    public async setChannelButtonsTemplate( ownerId: string, newButtons: string[], shouldAdminLog = true ) {
        this.logger.log( this.setChannelButtonsTemplate,
            `Master channel id: '${ ownerId }' - Setting channel name template: '${ newButtons }'`
        );

        if ( shouldAdminLog ) {
            const previousButtons = await this.getChannelButtonsTemplate( ownerId, true );

            this.logger.admin( this.setChannelButtonsTemplate,
                `🎚  Dynamic Channel buttons modified  - ownerId: "${ ownerId }", "${ previousButtons.join( ", " ) }" => "${ newButtons.join( "," ) }"`
            );
        }

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ this.keys.dynamicChannelButtonsTemplate ]: newButtons
        } );
    }

    public async setChannelMentionable( ownerId: string, mentionable: boolean, shouldAdminLog = true ) {
        this.logger.log( this.setChannelMentionable,
            `Master channel id: '${ ownerId }' - Setting channel mentionable: '${ mentionable }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setChannelMentionable,
                `@  Dynamic Channel mentionable modified  - ownerId: "${ ownerId }", "${ mentionable }"`
            );
        }

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ this.keys.dynamicChannelMentionable ]: mentionable
        } );
    }

    public async setChannelAutoSave( ownerId: string, autoSave: boolean, shouldAdminLog = true ) {
        this.logger.log( this.setChannelAutoSave,
            `Master channel id: '${ ownerId }' - Setting channel auto save: '${ autoSave }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setChannelAutoSave,
                `⫸  Dynamic Channel auto save modified  - ownerId: "${ ownerId }", "${ autoSave }"`
            );
        }

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ this.keys.dynamicChannelAutoSave ]: autoSave
        } );
    }

    public async setChannelVerifiedRoles( guildId: string, ownerId: string, roles: string[], shouldAdminLog = true ) {
        this.logger.log( this.setChannelVerifiedRoles,
            `Guild id:${ guildId }, master channel id: '${ ownerId }' - Setting channel verified roles: '${ roles }'`
        );

        if ( ! roles.length ) {
            roles.push( guildId );
        }

        if ( shouldAdminLog ) {
            const previousRoles = await this.getChannelVerifiedRoles( ownerId, guildId );

            this.logger.admin( this.setChannelVerifiedRoles,
                `🛡️  Dynamic Channel verified roles modified  - guildId: "${ guildId }" ownerId: "${ ownerId }", "${ previousRoles }" => "${ roles }"`
            );
        }

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ this.keys.dynamicChannelVerifiedRoles ]: roles
        } );
    }

    public async setChannelLogsChannel( ownerId: string, channelId: string | null, shouldAdminLog = true ) {
        this.logger.log( this.setChannelLogsChannel,
            `Master channel id: '${ ownerId }' - Setting channel logs channel: '${ channelId }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setChannelLogsChannel,
                `❯❯ Set log channel  - ownerId: "${ ownerId }" channelId: "${ channelId }"`
            );
        }

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ this.keys.dynamicChannelLogsChannelId ]: channelId
        } );
    }
}
