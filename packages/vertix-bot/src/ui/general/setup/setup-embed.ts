import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type {
    MasterChannelConfigInterfaceV3
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

export class SetupEmbed extends UIEmbedBase {

    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        masterChannels: uiUtilsWrapAsTemplate( "masterChannels" ),
        masterChannelMessage: uiUtilsWrapAsTemplate( "masterChannelMessage" ),
        masterChannelMessageDefault: uiUtilsWrapAsTemplate( "masterChannelMessageDefault" ),

        masterChannelsOptions: {
            index: uiUtilsWrapAsTemplate( "index" ),
            name: uiUtilsWrapAsTemplate( "name" ),
            id: uiUtilsWrapAsTemplate( "id" ),
            channelsTemplateName: uiUtilsWrapAsTemplate( "channelsTemplateName" ),
            channelsTemplateButtons: uiUtilsWrapAsTemplate( "channelsTemplateButtons" ),
            channelsVerifiedRoles: uiUtilsWrapAsTemplate( "channelsVerifiedRoles" ),
            channelsLogsChannelId: uiUtilsWrapAsTemplate( "channelsLogsChannelId" ),

            version: uiUtilsWrapAsTemplate( "version" ),
        },

        badwords: uiUtilsWrapAsTemplate( "badwords" ),
        badwordsMessage: uiUtilsWrapAsTemplate( "badwordsMessage" ),
        badwordsMessageDefault: uiUtilsWrapAsTemplate( "badwordsMessageDefault" ),

        none: uiUtilsWrapAsTemplate( "none" ),
    };

    public static getName() {
        return "VertixBot/UI-General/SetupEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getImage(): string {
        return "https://i.ibb.co/wsqNGmk/dynamic-channel-line-370.png";
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle() {
        return "🛠  Setup Vertix";
    }

    protected getDescription() {
        return "Discover the limitless possibilities of **Vertix**!\n" +
            "Customize and optimize your server to perfection.\n\n" +
            "To create a new master channel just click:\n" +
            "`(➕ Create Master Channel)` button.\n\n" +
            "Master Channels are dynamic voice channel generators, each with its own unique configuration.\n\n" +
            "Our badwords feature enables guild-level configuration for limiting dynamic channel names.\n\n" +
            "_**Current master channels**_:\n" +
            SetupEmbed.vars.masterChannelMessage + "\n\n" +
            "_Current badwords_:\n" +
            SetupEmbed.vars.badwordsMessage + "\n\n" +
            "-# 💡 You can set logs channel by editing the master channel.\n";
    }

    protected getArrayOptions() {
        const { separator, value, masterChannelsOptions } = SetupEmbed.vars;

        return {
            masterChannels: {
                format: value + separator,
                separator: "\n",
                multiSeparator: "\n\n",
                options: {
                    index: `**#${ masterChannelsOptions.index }**`,
                    name: `▹ Name: <#${ masterChannelsOptions.id }>`,
                    id: `▹ Channel ID: \`${ masterChannelsOptions.id }\``,
                    channelsTemplateName: `▹ Dynamic Channels Name: \`${ masterChannelsOptions.channelsTemplateName }\``,
                    channelsTemplateButtons: `▹ Buttons: **${ masterChannelsOptions.channelsTemplateButtons }**`,
                    channelsVerifiedRoles: `▹ Verified Roles: ${ masterChannelsOptions.channelsVerifiedRoles }`,
                    channelsLogsChannelId: `▹ Logs Channel: ${ masterChannelsOptions.channelsLogsChannelId }`,
                    version: `▹ UI Version: \`${ masterChannelsOptions.version }\``,
                }
            },
            badwords: {
                format: `${ value }${ separator }`,
                separator: ", ",
            }
        };
    }

    protected getOptions(): { [ p: string ]: any } {
        const {
            masterChannels,
            masterChannelMessageDefault,

            badwords,
            badwordsMessageDefault
        } = SetupEmbed.vars;

        return {
            masterChannelMessage: {
                [ masterChannels ]: "\n" + masterChannels,
                [ masterChannelMessageDefault ]: "**None**",
            },
            badwordsMessage: {
                [ badwords ]: "`" + badwords + "`",
                [ badwordsMessageDefault ]: "**None**",
            },

            none: "**None**",
        };
    }

    protected async getLogicAsync( args: ISetupArgs ) {
        const { settings } = ConfigManager.$
            .get<MasterChannelConfigInterfaceV3>( "Vertix/Config/MasterChannel", VERSION_UI_V3 ).data;

        // TODO: Duplicate code, refactor.
        const result: any = {},
            masterChannelsPromise = ( args?.masterChannels || [] ).map( async ( channel, index ) => {
                const { data, usedEmojis, usedRoles } = this.handleChannelData( channel );

                return {
                    index: index + 1,
                    id: channel.channelId,
                    channelsTemplateName: data?.object?.dynamicChannelNameTemplate || settings.dynamicChannelNameTemplate,
                    channelsTemplateButtons: usedEmojis,
                    channelsVerifiedRoles: usedRoles.length ? usedRoles : "@@everyone",
                    channelsLogsChannelId: data?.object?.dynamicChannelLogsChannelId ? `<#${ data?.object?.dynamicChannelLogsChannelId }>` : SetupEmbed.vars.none,
                    version: data?.version,
                };
            } ),
            masterChannels = await Promise.all( masterChannelsPromise ) || [];

        if ( masterChannels?.length ) {
            result.masterChannels = masterChannels;
            result.masterChannelMessage = SetupEmbed.vars.masterChannels;
        } else {
            result.masterChannelMessage = SetupEmbed.vars.masterChannelMessageDefault;
        }

        if ( args?.badwords?.length ) {
            result.badwords = args.badwords;
            result.badwordsMessage = SetupEmbed.vars.badwords;
        } else {
            result.badwordsMessage = SetupEmbed.vars.badwordsMessageDefault;
        }

        return result;
    }

    private handleChannelData( channel: any ) {
        const getUsedButtons = () => {
            switch ( channel?.data?.[ 0 ]?.version ) {
                default:
                    return DynamicChannelElementsGroup.getAll();

                case VERSION_UI_V3:
                    return DynamicChannelPrimaryMessageElementsGroup.getAll();
            }
        };

        const getEmojis = ( buttons: string[] ) => {
            switch ( channel?.data?.[ 0 ]?.version ) {
                default:
                    return DynamicChannelElementsGroup.getEmbedEmojis( buttons.map( b => Number( b ) ) );

                case VERSION_UI_V3:
                    return DynamicChannelPrimaryMessageElementsGroup.getEmbedEmojis( buttons );
            }
        };

        const data = channel?.data?.[ 0 ],
            usedButtons = data?.object?.dynamicChannelButtonsTemplate || getUsedButtons(),
            usedEmojis = ( getEmojis( usedButtons ) ).join( ", " ),
            usedRoles = ( data?.object.dynamicChannelVerifiedRoles || [] ).map( ( roleId: string ) => {
                return "<@&" + roleId + ">";
            } ).join( ", " );
        return { data, usedEmojis, usedRoles };
    }
}
