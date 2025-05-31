import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { MasterChannelDataDynamicManager } from "@vertix.gg/base/src/managers/master-channel-data-dynamic-manager";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { MasterChannelDynamicConfigV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

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
            channelsAutoSave: uiUtilsWrapAsTemplate( "channelsAutoSave" ),

            version: uiUtilsWrapAsTemplate( "version" )
        },

        badwords: uiUtilsWrapAsTemplate( "badwords" ),
        badwordsMessage: uiUtilsWrapAsTemplate( "badwordsMessage" ),
        badwordsMessageDefault: uiUtilsWrapAsTemplate( "badwordsMessageDefault" ),

        none: uiUtilsWrapAsTemplate( "none" )
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
        return (
            "Discover the limitless possibilities of **Vertix**!\n" +
            "Customize and optimize your server to perfection.\n\n" +
            "To create a new master channel just click:\n" +
            "`(➕ Create Master Channel)` button.\n\n" +
            "Master Channels are dynamic voice channel generators, each with its own unique configuration.\n\n" +
            "Our badwords feature enables guild-level configuration for limiting dynamic channel names.\n\n" +
            "_**Current master channels**_:\n" +
            SetupEmbed.vars.masterChannelMessage +
            "\n\n" +
            "_Current badwords_:\n" +
            SetupEmbed.vars.badwordsMessage +
            "\n\n" +
            "-# 💡 You can set logs channel by editing the master channel.\n"
        );
    }

    protected getArrayOptions() {
        const { separator, value, masterChannelsOptions } = SetupEmbed.vars;

        return {
            masterChannels: {
                format: value + separator,
                separator: "\n",
                multiSeparator: "\n\n",
                options: {
                    // TODO: Add auto save
                    index: `**#${ masterChannelsOptions.index }**`,
                    name: `▹ Name: <#${ masterChannelsOptions.id }>`,
                    id: `▹ Channel ID: \`${ masterChannelsOptions.id }\``,
                    channelsTemplateName: `▹ Dynamic Channels Name: \`${ masterChannelsOptions.channelsTemplateName }\``,
                    channelsTemplateButtons: `▹ Buttons: **${ masterChannelsOptions.channelsTemplateButtons }**`,
                    channelsVerifiedRoles: `▹ Verified Roles: ${ masterChannelsOptions.channelsVerifiedRoles }`,
                    channelsLogsChannelId: `▹ Logs Channel: ${ masterChannelsOptions.channelsLogsChannelId }`,
                    channelsAutoSave: `▹ Auto Save: \`${ masterChannelsOptions.channelsAutoSave }\``,
                    version: `▹ UI Version: \`${ masterChannelsOptions.version }\``
                }
            },
            badwords: {
                format: `${ value }${ separator }`,
                separator: ", "
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
                [ masterChannelMessageDefault ]: "**None**"
            },
            badwordsMessage: {
                [ badwords ]: "`" + badwords + "`",
                [ badwordsMessageDefault ]: "**None**"
            },

            none: "**None**"
        };
    }

    protected async getLogicAsync( args: ISetupArgs ) {
        const { settings } = ConfigManager.$.get<MasterChannelDynamicConfigV3>(
            "Vertix/Config/MasterChannelDynamic",
            VERSION_UI_V3
        ).data;

        // TODO: Duplicate code, refactor.
        const result: any = {},
            masterChannelsPromise = ( args?.masterChannels || [] ).map( async( channel, index ) => {
                const { data, usedEmojis, usedRoles } = await this.handleChannelData( channel );

                return {
                    index: index + 1,
                    id: channel.channelId,
                    channelsTemplateName:
                        data.dynamicChannelNameTemplate || settings.dynamicChannelNameTemplate,
                    channelsTemplateButtons: usedEmojis,
                    channelsVerifiedRoles: usedRoles.length ? usedRoles : "@@everyone",
                    channelsLogsChannelId: data.dynamicChannelLogsChannelId
                        ? `<#${ data.dynamicChannelLogsChannelId }>`
                        : SetupEmbed.vars.none,
                    channelsAutoSave: data.dynamicChannelAutoSave ?? "false",
                    version: channel?.version || "V2"
                };
            } ),
            masterChannels = ( await Promise.all( masterChannelsPromise ) ) || [];

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

    private async handleChannelData( channel: any ) {
        const data = await MasterChannelDataDynamicManager.$.getAllSettings( {
            ... channel,
            isDynamic: false,
            isMaster: true
        } );

        // Get the version from either the top level channel object or from data[0]
        // This ensures we correctly detect the version wherever it's stored
        const getChannelVersion = () => {
            // Check all possible locations for version information
            return channel?.version || channel?.data?.[ 0 ]?.version;
        };

        const getUsedButtons = () => {
            const version = getChannelVersion();

            switch ( version ) {
                case VERSION_UI_V3:
                    // Extract just the IDs from the button objects for V3
                    return DynamicChannelPrimaryMessageElementsGroup.getAll().map( btn => btn.getId() );

                default:
                    // Extract just the IDs from the button objects for V2 (default)
                    return DynamicChannelElementsGroup.getAll().map( btn => btn.getId() );
            }
        };

        const getEmojis = ( buttons: string[] | number[] ) => {
            const version = getChannelVersion();

            // Check if buttons array is defined and has elements
            if ( ! buttons || ! buttons.length ) {
                return [ "⚠️ No buttons" ]; // Return a placeholder to indicate the issue
            }

            let result: string[] = [];

            switch ( version ) {
                case VERSION_UI_V3:
                    // For V3: Ensure all values are strings as V3 getById expects strings
                    const stringButtons = buttons.map( b => String( b ) );
                    result = DynamicChannelPrimaryMessageElementsGroup.getEmbedEmojis( stringButtons );
                    break;

                default:
                    // For V2: Ensure all values are numbers as V2 getById expects numbers
                    const numberedButtons = buttons.map( b => typeof b === "number" ? b : Number( b ) );
                    result = DynamicChannelElementsGroup.getEmbedEmojis( numberedButtons );
                    break;
            }

            // If no emojis were found, provide a visible error
            if ( ! result.length ) {
                return [ "⚠️ No emojis found" ];
            }

            return result;
        };

        const usedButtons = data.dynamicChannelButtonsTemplate || getUsedButtons(),
            usedEmojis = getEmojis( usedButtons ).join( ", " ),
            usedRoles = ( data.dynamicChannelVerifiedRoles || [] )
                .map( ( roleId: string ) => {
                    return "<@&" + roleId + ">";
                } )
                .join( ", " );

        return { data, usedEmojis, usedRoles };
    }
}
