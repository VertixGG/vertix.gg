import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";

import { isDebugOn } from "@vertix.gg/base/src/utils/debug";

import {
    DEFAULT_DYNAMIC_CHANNEL_AUTOSAVE,
    DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE,
    DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS
} from "@vertix.gg/base/src/definitions/master-channel-defaults";

import {
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_AUTOSAVE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES
} from "@vertix.gg/base/src/definitions/master-channel-data-keys";

import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA } from "@vertix.gg/base/src/definitions/dynamic-channel-defaults";

export class MasterChannelDataManager extends ChannelDataManager {
    private static _instance: MasterChannelDataManager;

    public static getName() {
        return "VertixBase/Managers/MasterChannelData";
    }

    public static getInstance(): MasterChannelDataManager {
        if ( ! MasterChannelDataManager._instance ) {
            MasterChannelDataManager._instance = new MasterChannelDataManager();
        }
        return MasterChannelDataManager._instance;
    }

    public static get $() {
        return MasterChannelDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugOn( "CACHE", MasterChannelDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    public async getChannelNameTemplate( ownerId: string, returnDefault?: boolean ) {
        const result = await ChannelDataManager.$.getSettingsData(
                ownerId,
                returnDefault ? DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS : null,
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
        const result = await ChannelDataManager.$.getSettingsData(
                ownerId,
                returnDefault ? DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS : null,
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
        const result = await ChannelDataManager.$.getSettingsData(
            ownerId,
            returnDefault ? DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS : null,
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
        const result = await ChannelDataManager.$.getSettingsData(
            ownerId,
            returnDefault ? DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS : null,
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

    public async getChannelLogsChannelId( ownerId: string, returnDefault?: boolean ) {
        const result = await ChannelDataManager.$.getSettingsData(
            ownerId,
            returnDefault ? DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS : null,
            true
        );

        let logsChannelId = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID ];

        if ( ! logsChannelId ) {
            logsChannelId = null;
        }

        this.debugger.dumpDown( this.getChannelLogsChannelId,
            logsChannelId,
            `ownerId: '${ ownerId }' returnDefault: '${ returnDefault }' - logsChannelId: `
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
            const previousButtons = await this.getChannelButtonsTemplate( ownerId, true ),
                previousUsedEmojis = DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getUsedEmojis( previousButtons ),
                newUsedEmojis = DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getUsedEmojis( newButtons );

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
