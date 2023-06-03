import { Channel } from ".prisma/client";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

import { DataResult } from "@vertix/interfaces/data";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_NONE_NAME,
    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE
} from "@vertix/definitions/master-channel";

interface ConfigSelectArgs extends UIArgs {
    masterChannels: ( Channel & DataResult )[];
}

export class ConfigSelectEmbed extends UIEmbedBase {
    private static vars: any = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        masterChannels: uiUtilsWrapAsTemplate( "masterChannels" ),
        masterChannelsState: uiUtilsWrapAsTemplate( "masterChannelsState" ),
        masterChannelsDefault: uiUtilsWrapAsTemplate( "masterChannelsDefault" ),

        index: uiUtilsWrapAsTemplate( "index" ),
        name: uiUtilsWrapAsTemplate( "name" ),
        id: uiUtilsWrapAsTemplate( "id" ),
        channelsTemplateName: uiUtilsWrapAsTemplate( "channelsTemplateName" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ConfigSelectEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle() {
        return "🔧  Select Master Channel To Modify";
    }

    protected getDescription() {
        return "Customize **Master Channels** according to your preferences and create the ideal setup for your needs.\".\n" +
            ConfigSelectEmbed.vars.masterChannelsState;
    }

    protected getOptions() {
        return {
            masterChannelsState: {
                [ ConfigSelectEmbed.vars.masterChannels ]: "**Current Master Channels:**\n\n" +
                    ConfigSelectEmbed.vars.masterChannels,

                [ ConfigSelectEmbed.vars.masterChannelsDefault ]: "\n" + DEFAULT_MASTER_CHANNEL_CREATE_NONE_NAME,
            }
        };
    }

    protected getArrayOptions() {
        return {
            masterChannels: {
                format: ConfigSelectEmbed.vars.value + ConfigSelectEmbed.vars.separator,
                separator: "\n",
                multiSeparator: "\n\n",
                options: {
                    index: `**#${ ConfigSelectEmbed.vars.index }**`,
                    name: `Name: <#${ ConfigSelectEmbed.vars.id }>`,
                    id: `Channel ID: \`${ ConfigSelectEmbed.vars.id }\``,
                    channelsTemplateName: `Dynamic Channels Name: \`${ ConfigSelectEmbed.vars.channelsTemplateName }\``,
                }
            }
        };
    }

    protected getLogic( args?: ConfigSelectArgs ) {
        const result: any = {},
            masterChannels = args?.masterChannels?.map( ( channel, index ) => {
                return {
                    index: index + 1,
                    id: channel.channelId,
                    // TODO: Use custom object, not one from DB.
                    channelsTemplateName: channel?.data?.[ 0 ].object?.dynamicChannelNameTemplate || DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
                };
            } );

        if ( masterChannels?.length ) {
            result.masterChannels = masterChannels;
            result.masterChannelsState = ConfigSelectEmbed.vars.masterChannels;
        } else {
            result.masterChannelsState = ConfigSelectEmbed.vars.masterChannelsDefault;
        }

        return result;
    }
}
