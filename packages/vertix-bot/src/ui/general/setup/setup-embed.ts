import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { MasterChannelDataDynamicManager } from "@vertix.gg/base/src/managers/master-channel-data-dynamic-manager";
import { MasterChannelScalingDataModel } from "@vertix.gg/base/src/models/master-channel/master-channel-scaling-data-model-v3";
import { clientChannelExtend } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import { EMasterChannelType } from "@vertix.gg/base/src/definitions/master-channel";

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

        masterDynamicChannels: uiUtilsWrapAsTemplate( "masterDynamicChannels" ),
        masterDynamicChannelMessage: uiUtilsWrapAsTemplate( "masterDynamicChannelMessage" ),
        masterDynamicChannelMessageDefault: uiUtilsWrapAsTemplate( "masterDynamicChannelMessageDefault" ),

        masterScalingChannels: uiUtilsWrapAsTemplate( "masterScalingChannels" ),
        masterScalingChannelMessage: uiUtilsWrapAsTemplate( "masterScalingChannelMessage" ),
        masterScalingChannelMessageDefault: uiUtilsWrapAsTemplate( "masterScalingChannelMessageDefault" ),

        masterChannelsOptions: {
            index: uiUtilsWrapAsTemplate( "index" ),
            name: uiUtilsWrapAsTemplate( "name" ),
            id: uiUtilsWrapAsTemplate( "id" ),
            type: uiUtilsWrapAsTemplate( "type" ),
            channelsTemplateName: uiUtilsWrapAsTemplate( "channelsTemplateName" ),
            channelsTemplateButtons: uiUtilsWrapAsTemplate( "channelsTemplateButtons" ),
            channelsVerifiedRoles: uiUtilsWrapAsTemplate( "channelsVerifiedRoles" ),
            channelsLogsChannelId: uiUtilsWrapAsTemplate( "channelsLogsChannelId" ),
            channelsAutoSave: uiUtilsWrapAsTemplate( "channelsAutoSave" ),
            scalingChannelPrefix: uiUtilsWrapAsTemplate( "scalingChannelPrefix" ),
            scalingChannelMaxMembers: uiUtilsWrapAsTemplate( "scalingChannelMaxMembers" ),
            scalingChannelCategory: uiUtilsWrapAsTemplate( "scalingChannelCategory" ),
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
            "_**Current scaling master channels**_:\n" +
            SetupEmbed.vars.masterScalingChannelMessage +
            "\n\n" +
            "_**Current dynamic master channels**_:\n" +
            SetupEmbed.vars.masterDynamicChannelMessage +
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
            masterDynamicChannels: {
                format: value + separator,
                separator: "\n",
                multiSeparator: "\n\n",
                options: {
                    // Common options for dynamic channels
                    index: `**#${ masterChannelsOptions.index }**`,
                    name: `▹ Name: <#${ masterChannelsOptions.id }>`,
                    id: `▹ Channel ID: \`${ masterChannelsOptions.id }\``,
                    type: `▹ Type: \`${ masterChannelsOptions.type }\``,

                    // Dynamic channel specific options
                    channelsTemplateName: `▹ Dynamic Channels Name: \`${ masterChannelsOptions.channelsTemplateName }\``,
                    channelsTemplateButtons: `▹ Buttons: **${ masterChannelsOptions.channelsTemplateButtons }**`,
                    channelsVerifiedRoles: `▹ Verified Roles: ${ masterChannelsOptions.channelsVerifiedRoles }`,
                    channelsLogsChannelId: `▹ Logs Channel: ${ masterChannelsOptions.channelsLogsChannelId }`,
                    channelsAutoSave: `▹ Auto Save: \`${ masterChannelsOptions.channelsAutoSave }\``,

                    // Common footer
                    version: `▹ UI Version: \`${ masterChannelsOptions.version }\``
                }
            },
            masterScalingChannels: {
                format: value + separator,
                separator: "\n",
                multiSeparator: "\n\n",
                options: {
                    // Common options for scaling channels
                    index: `**#${ masterChannelsOptions.index }**`,
                    name: `▹ Name: <#${ masterChannelsOptions.id }>`,
                    id: `▹ Channel ID: \`${ masterChannelsOptions.id }\``,
                    type: `▹ Type: \`${ masterChannelsOptions.type }\``,

                    // Scaling channel specific options
                    scalingChannelPrefix: `▹ Scaling Channel Prefix: \`${ masterChannelsOptions.scalingChannelPrefix }\``,
                    scalingChannelMaxMembers: `▹ Max Members Per Channel: \`${ masterChannelsOptions.scalingChannelMaxMembers }\``,
                    scalingChannelCategory: `▹ Category: ${ masterChannelsOptions.scalingChannelCategory }`,

                    // Common footer
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

            masterDynamicChannels,
            masterDynamicChannelMessageDefault,

            masterScalingChannels,
            masterScalingChannelMessageDefault,

            badwords,
            badwordsMessageDefault
        } = SetupEmbed.vars;

        return {
            masterChannelMessage: {
                [ masterChannels ]: "\n" + masterChannels,
                [ masterChannelMessageDefault ]: "**None**"
            },
            masterDynamicChannelMessage: {
                [ masterDynamicChannels ]: "\n" + masterDynamicChannels,
                [ masterDynamicChannelMessageDefault ]: "**None**"
            },
            masterScalingChannelMessage: {
                [ masterScalingChannels ]: "\n" + masterScalingChannels,
                [ masterScalingChannelMessageDefault ]: "**None**"
            },
            badwordsMessage: {
                [ badwords ]: "`" + badwords + "`",
                [ badwordsMessageDefault ]: "**None**"
            },

            // Hide empty values by not rendering them
            channelsTemplateName: {
                "": ""
            },
            channelsTemplateButtons: {
                "": ""
            },
            channelsVerifiedRoles: {
                "": ""
            },
            channelsLogsChannelId: {
                "": ""
            },
            channelsAutoSave: {
                "": ""
            },
            scalingChannelPrefix: {
                "": ""
            },
            scalingChannelMaxMembers: {
                "": ""
            },
            scalingChannelCategory: {
                "": ""
            },

            none: "**None**"
        };
    }

    protected async getLogicAsync( args: ISetupArgs ) {
        const { settings } = ConfigManager.$.get<MasterChannelDynamicConfigV3>(
            "Vertix/Config/MasterChannelDynamic",
            VERSION_UI_V3
        ).data;

        const result: any = {};

        const dynamicSource = args?.masterDynamicChannels || [];
        const scalingSource = args?.masterScalingChannels || [];

        const dynamicInfosPromise = dynamicSource.map( async( channel, index ) => {
            const { data, usedEmojis, usedRoles } = await this.handleChannelData( channel, args );
            return {
                index: index + 1,
                id: channel.channelId,
                type: EMasterChannelType.DYNAMIC,
                version: channel?.version || "V2",
                channelsTemplateName: data.dynamicChannelNameTemplate || settings.dynamicChannelNameTemplate,
                channelsTemplateButtons: usedEmojis,
                channelsVerifiedRoles: usedRoles.length ? usedRoles : "@@everyone",
                channelsLogsChannelId: data.dynamicChannelLogsChannelId ? `<#${ data.dynamicChannelLogsChannelId }>` : SetupEmbed.vars.none,
                channelsAutoSave: data.dynamicChannelAutoSave ?? "false"
            };
        } );

        const scalingInfosPromise = scalingSource.map( async( channel, index ) => {
            const { data } = await this.handleChannelData( channel, args );
            const prefix = data.scalingChannelPrefix || "Default Prefix";
            const maxMembers = data.scalingChannelMaxMembersPerChannel || "10";
            const categoryId = data.scalingChannelCategoryId || "None";
            return {
                index: index + 1,
                id: channel.channelId,
                type: EMasterChannelType.AUTO_SCALING,
                version: channel?.version || "0.0.0.0",
                scalingChannelPrefix: prefix,
                scalingChannelMaxMembers: maxMembers,
                scalingChannelCategory: categoryId ? `<#${ categoryId }>` : "None"
            };
        } );

        const masterDynamicChannels = await Promise.all( dynamicInfosPromise );
        const masterScalingChannels = await Promise.all( scalingInfosPromise );

        if ( masterDynamicChannels.length ) {
            result.masterDynamicChannels = masterDynamicChannels;
            result.masterDynamicChannelMessage = SetupEmbed.vars.masterDynamicChannels;
        } else {
            result.masterDynamicChannelMessage = SetupEmbed.vars.masterDynamicChannelMessageDefault;
        }

        if ( masterScalingChannels.length ) {
            result.masterScalingChannels = masterScalingChannels;
            result.masterScalingChannelMessage = SetupEmbed.vars.masterScalingChannels;
        } else {
            result.masterScalingChannelMessage = SetupEmbed.vars.masterScalingChannelMessageDefault;
        }

        if ( masterDynamicChannels.length || masterScalingChannels.length ) {
            result.masterChannels = [ ...masterScalingChannels, ...masterDynamicChannels ];
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

    private async handleChannelData( channel: any, args?: ISetupArgs ) {
        // Try to determine if this is a scaling channel
        let channelType = EMasterChannelType.DYNAMIC; // Default type
        let data: any = {};
        let usedEmojis = "";
        let usedRoles: string[] = [];

        try {
            // First, get the channel data from the database
            const masterChannelDataResult = await clientChannelExtend.channelData.findMany( {
                where: {
                    ownerId: channel.id,
                }
            } );

            if ( masterChannelDataResult.length > 0 ) {
                const masterChannelData = masterChannelDataResult[ 0 ];
                const object = masterChannelData.object as any;

                // Check the type directly from the channel data object
                if ( object && object.type === EMasterChannelType.AUTO_SCALING ) {
                    // It's a scaling channel
                    channelType = EMasterChannelType.AUTO_SCALING;
                    console.log( `Channel ID: ${ channel.channelId } - Identified as AUTO_SCALING type from DB object` );

                    // Get the scaling-specific data
                    const scalingData = await MasterChannelScalingDataModel.$.getSettings( channel.id );
                    data = scalingData ?? object;

                    // For scaling channels, we don't need to process emojis or buttons
                    return { data, usedEmojis: "", usedRoles: [], channelType };
                }
            }
        } catch ( error ) {
            console.log( `Channel ID: ${ channel.channelId } - Error getting channel data type: ${ error }` );
            // Continue with other checks if this fails
        }

        // Check if the name contains "Auto Scaling Master" as a clue
        if ( channel.name && channel.name.includes( "Auto Scaling Master" ) ) {
            channelType = EMasterChannelType.AUTO_SCALING;
            console.log( `Channel ID: ${ channel.channelId } - Identified as AUTO_SCALING type by name` );

            // Try to get the scaling data
            try {
                const scalingData = await MasterChannelScalingDataModel.$.getSettings( channel.channelId );
                if ( scalingData ) {
                    data = scalingData;
                    return { data, usedEmojis: "", usedRoles: [], channelType };
                }
            } catch ( error ) {
                console.log( `Channel ID: ${ channel.channelId } - Error getting scaling data: ${ error }` );
            }
        }

        // Try getting scaling data directly
        try {
            const scalingData = await MasterChannelScalingDataModel.$.getSettings( channel.channelId );
            if ( scalingData && scalingData.type === EMasterChannelType.AUTO_SCALING ) {
                channelType = EMasterChannelType.AUTO_SCALING;
                data = scalingData;
                return { data, usedEmojis: "", usedRoles: [], channelType };
            }
        } catch ( error ) {
            // Not a scaling channel from that model, continue checking
        }

        // Process as dynamic channel
        data = await MasterChannelDataDynamicManager.$.getAllSettings( {
            ...channel,
            isDynamic: false,
            isMaster: true
        } );

        // Additional check - see if the data indicates it's an auto-scaling channel
        if ( data && data.type === EMasterChannelType.AUTO_SCALING ) {
            channelType = EMasterChannelType.AUTO_SCALING;
            return { data, usedEmojis: "", usedRoles: [], channelType };
        }

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
                return [ "⚠️ No emojis found" ]; // Return a placeholder to indicate the issue
            }

            return result;
        };

        const usedButtons = data.dynamicChannelButtonsTemplate || getUsedButtons();
        usedEmojis = getEmojis( usedButtons ).join( ", " );
        usedRoles = ( data.dynamicChannelVerifiedRoles || [] )
            .map( ( roleId: string ) => {
                return "<@&" + roleId + ">";
            } )
            .join( ", " );

        return { data, usedEmojis, usedRoles, channelType };
    }
}
