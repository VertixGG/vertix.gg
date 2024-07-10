import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";

import {
    DEFAULT_DYNAMIC_CHANNEL_AUTOSAVE,
    DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE,
} from "@vertix.gg/base/src/definitions/master-channel-defaults";

import {
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_AUTOSAVE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES
} from "@vertix.gg/base/src/definitions/master-channel-data-keys";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

export class MasterChannelDataManager extends ChannelDataManager {
    public config =
        ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", "0.0.2" as const );

    public static getName() {
        return "VertixBase/Managers/MasterChannelData";
    }

    public static get $() {
        return MasterChannelDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", MasterChannelDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    public async getChannelNameTemplate( ownerId: string, returnDefault?: boolean ) {
        const defaultSettings = returnDefault ? this.config.data : null;

        const result = await ChannelDataManager.$.getSettingsData(
                ownerId,
                defaultSettings,
                true
            ),
            name = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ];

        this.debugger.dumpDown( this.getChannelNameTemplate,
            result,
            `ownerId: '${ ownerId }' returnDefault: '${ returnDefault }' - Result: `
        );

        return name;
    }

    public async getChannelButtonsTemplate( ownerId: string, returnDefault?: boolean ) {
        const defaultSettings = returnDefault ? this.config.data : null;

        const result = await ChannelDataManager.$.getSettingsData(
                ownerId,
                defaultSettings,
                true
            ),
            buttons = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ]
                .map( ( button: string ) => parseInt( button ) );

        this.debugger.dumpDown( this.getChannelButtonsTemplate,
            buttons,
            `ownerId: '${ ownerId }' returnDefault: '${ returnDefault }' - buttons: `
        );

        return buttons;
    }

    public async getChannelMentionable( ownerId: string, returnDefault?: boolean ) {
        const defaultSettings = returnDefault ? this.config.data : null;

        const result = await ChannelDataManager.$.getSettingsData(
            ownerId,
            defaultSettings,
            true
        );

        let mentionable = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ];

        // TODO: Temporary fix, find out why default not working.
        if ( mentionable === undefined ) {
            mentionable = DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE;
        }

        this.debugger.dumpDown( this.getChannelMentionable,
            mentionable,
            `ownerId: '${ ownerId }' returnDefault: '${ returnDefault }' - mentionable: `
        );

        return mentionable;
    }

    public async getChannelAutosave( ownerId: string, returnDefault?: boolean ) {
        const defaultSettings = returnDefault ? this.config.data : null;

        const result = await ChannelDataManager.$.getSettingsData(
            ownerId,
            defaultSettings,
            true
        );

        let autosave = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_AUTOSAVE ];

        // TODO: Temporary fix, find out why default not working.
        if ( autosave === undefined ) {
            autosave = DEFAULT_DYNAMIC_CHANNEL_AUTOSAVE;
        }

        this.debugger.dumpDown( this.getChannelAutosave,
            autosave,
            `ownerId: '${ ownerId }' returnDefault: '${ returnDefault }' - autosave: `
        );

        return autosave;
    }

    public async getChannelVerifiedRoles( ownerId: string, guildId: string ) {
        const result = await ChannelDataManager.$.getSettingsData(
            ownerId,
            false,
            true
        );

        let verifiedRoles = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ];

        if ( ! verifiedRoles?.length ) {
            verifiedRoles = [ guildId ];
        }

        this.debugger.dumpDown( this.getChannelVerifiedRoles,
            verifiedRoles,
            `ownerId: '${ ownerId }' - verifiedRoles: `
        );

        return verifiedRoles;
    }

    public async getChannelLogsChannelId( ownerId: string ) {
        const result = await ChannelDataManager.$.getSettingsData(
            ownerId,
            false,
            true
        );

        let logsChannelId = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID ];

        if ( ! logsChannelId ) {
            logsChannelId = null;
        }

        this.debugger.dumpDown( this.getChannelLogsChannelId,
            logsChannelId,
            `ownerId: '${ ownerId }' - logsChannelId: `
        );

        return logsChannelId;
    }

    public async setChannelNameTemplate( ownerId: string, newName: string ) {
        this.logger.log( this.setChannelNameTemplate,
            `Master channel id: '${ ownerId }' - Setting channel name template: '${ newName }'`
        );

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ]: newName
        } );
    }

    public async setChannelButtonsTemplate( ownerId: string, newButtons: number[], shouldAdminLog = true ) {
        this.logger.log( this.setChannelButtonsTemplate,
            `Master channel id: '${ ownerId }' - Setting channel name template: '${ newButtons }'`
        );

        if ( shouldAdminLog ) {
            function getUsedEmojis( data: MasterChannelConfigInterface["data"], buttons: number[] ) {
                return Object.entries( data.buttonsEmojis )
                    .filter( ( [ id ] ) => buttons.includes( parseInt( id ) ) )
                    .map( ( [ , emoji ] ) => emoji )
                    .join( ", " );
            }

            const previousButtons = await this.getChannelButtonsTemplate( ownerId, true ),
                previousUsedEmojis = getUsedEmojis( this.config.data, previousButtons ),
                newUsedEmojis = getUsedEmojis( this.config.data, newButtons );

            this.logger.admin( this.setChannelButtonsTemplate,
                `🎚  Dynamic Channel buttons modified  - ownerId: "${ ownerId }", "${ previousUsedEmojis }" => "${ newUsedEmojis }"`
            );
        }

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ]: newButtons
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
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ]: mentionable
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
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_AUTOSAVE ]: autoSave
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
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ]: roles
        } );
    }

    public async setChannelLogsChannel( ownerId: string, channelId: string|null, shouldAdminLog = true ) {
        this.logger.log( this.setChannelLogsChannel,
            `Master channel id: '${ ownerId }' - Setting channel logs channel: '${ channelId }'`
        );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setChannelLogsChannel,
                `❯❯ Set log channel  - ownerId: "${ ownerId }" channelId: "${ channelId }"`
            );
        }

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID ]: channelId
        } );
    }

}
