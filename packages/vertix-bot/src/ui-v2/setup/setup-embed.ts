
import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA } from "@vertix.gg/base/src/definitions/dynamic-channel-defaults";

import {
    DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE
} from "@vertix.gg/base/src/definitions/master-channel-defaults";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui-v2/setup/setup-definitions";

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
        },

        badwords: uiUtilsWrapAsTemplate( "badwords" ),
        badwordsMessage: uiUtilsWrapAsTemplate( "badwordsMessage" ),
        badwordsMessageDefault: uiUtilsWrapAsTemplate( "badwordsMessageDefault" ),

        none: uiUtilsWrapAsTemplate( "none" ),
    };

    public static getName() {
        return "VertixBot/UI-V2/SetupEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
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
            SetupEmbed.vars.badwordsMessage;
    }

    protected getFooter(): string {
        return "Tip: You can set logs channel by editing the master channel.";
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
        // TODO: Duplicate code, refactor.
        const result: any = {},
            masterChannelsPromise = ( args?.masterChannels || [] ).map( async ( channel, index ) => {
                const data = channel?.data?.[ 0 ],
                    usedButtons = data?.object?.dynamicChannelButtonsTemplate || DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
                    usedEmojis = DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getUsedEmojis( usedButtons )
                        .join( ", " ),
                    usedRoles = ( data?.object.dynamicChannelVerifiedRoles || [] ).map( ( roleId: string ) => {
                        return "<@&" + roleId + ">";
                    } ).join( ", " );

                return {
                    index: index + 1,
                    id: channel.channelId,
                    channelsTemplateName: data?.object?.dynamicChannelNameTemplate || DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
                    channelsTemplateButtons: usedEmojis,
                    channelsVerifiedRoles: usedRoles.length ? usedRoles : "@@everyone",
                    channelsLogsChannelId: data?.object?.dynamicChannelLogsChannelId ? `<#${ data?.object?.dynamicChannelLogsChannelId }>` : SetupEmbed.vars.none,
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
}
