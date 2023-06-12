import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

import { ISetupArgs } from "@vertix/ui-v2/setup/setup-definitions";

import {
    DynamicChannelElementsGroup
} from "@vertix/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import {
    DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE
} from "@vertix/definitions/master-channel";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

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
        },

        badwords: uiUtilsWrapAsTemplate( "badwords" ),
        badwordsMessage: uiUtilsWrapAsTemplate( "badwordsMessage" ),
        badwordsMessageDefault: uiUtilsWrapAsTemplate( "badwordsMessageDefault" ),
    };

    public static getName() {
        return "Vertix/UI-V2/SetupEmbed";
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
            "\"`(➕ Create Master Channel)`\" button.\n\n" +
            "Master Channels are dynamic voice channel generators, each with its own unique configuration.\n\n" +
            "Our badwords feature enables guild-level configuration for limiting dynamic channel names.\n\n" +
            "_**Current master channels**_:\n" +
            SetupEmbed.vars.masterChannelMessage + "\n\n" +
            "_Current badwords_:\n" +
            SetupEmbed.vars.badwordsMessage;
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
                    name: `Name: <#${ masterChannelsOptions.id }>`,
                    id: `Channel ID: \`${ masterChannelsOptions.id }\``,
                    channelsTemplateName: `Dynamic Channels Name: \`${ masterChannelsOptions.channelsTemplateName }\``,
                    channelsTemplateButtons: `Channels Buttons: **${ masterChannelsOptions.channelsTemplateButtons }**`,
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
            }
        };
    }

    protected async getLogicAsync( args: ISetupArgs ) {
        // TODO: Duplicate code, refactor.
        const result: any = {},
            masterChannelsPromise = ( args?.masterChannels || [] ).map( async ( channel, index ) => {
                const data = channel?.data?.[ 0 ],
                    usedButtons = data?.object?.dynamicChannelButtonsTemplate || DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
                    usedEmojis = ( await DynamicChannelElementsGroup.getUsedEmojis( usedButtons ) )
                        .join( ", " );

                return {
                    index: index + 1,
                    id: channel.channelId,
                    channelsTemplateName: data?.object?.dynamicChannelNameTemplate || DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
                    channelsTemplateButtons: usedEmojis,
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
