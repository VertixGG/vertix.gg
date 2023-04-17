import { UIEmbed } from "@dynamico/ui/base/ui-embed";
import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";
import { GUILD_DEFAULT_BADWORDS_INITIAL_DISPLAY_VALUE } from "@dynamico/constants/guild";
import { DEFAULT_MASTER_CHANNEL_CREATE_NONE_NAME } from "@dynamico/constants/master-channel";

export class ConfigureEmbed extends UIEmbed {
    private vars: any;

    public static getName() {
        return "Dynamico/UI/Configure/ConfigureEmbed";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public constructor() {
        super();

        this.vars = {
            name: uiUtilsWrapAsTemplate( "badwords" ),
            masterChannels: uiUtilsWrapAsTemplate( "masterChannels" ),

            currentMasterChannels: uiUtilsWrapAsTemplate( "currentMasterChannels" ),
            currentMasterChannelsNone: uiUtilsWrapAsTemplate( "currentMasterChannelsNone" ),
            currentMasterChannelsValue: uiUtilsWrapAsTemplate( "currentMasterChannelsValue" ),
            currentMasterChannelsState: uiUtilsWrapAsTemplate( "currentMasterChannelsState" ),

            badwords: uiUtilsWrapAsTemplate( "badwords" ),
            badwordsValue: uiUtilsWrapAsTemplate( "badwordsValue" ),
            badwordsDefault: uiUtilsWrapAsTemplate( "badwordsDefault" ),
            badwordsState: uiUtilsWrapAsTemplate( "badwordsState" ),
        };
    }

    protected getTitle() {
        return "🔧 Configure Dynamico";
    }

    protected getDescription() {
        return "Here you can configure Dynamico how ever you wish and make it the best for you.\n" +
            "If you want to create new Master Channel, please use the command `/setup`\n\n" +
            "**Current Master Channels:**\n" +
            this.vars.currentMasterChannelsState +
            "\n**Current Bad Words:**\n" +
            this.vars.badwordsState;
    }

    protected getFieldOptions(): any {
        return {
            badwordsState: {
                [ this.vars.badwordsValue ]: "`" + this.vars.badwords + "`",
                [ this.vars.badwordsDefault ]: GUILD_DEFAULT_BADWORDS_INITIAL_DISPLAY_VALUE,
            },
            currentMasterChannelsState: {
                [ this.vars.currentMasterChannelsValue ]: this.vars.currentMasterChannels,
                [ this.vars.currentMasterChannelsNone ]: DEFAULT_MASTER_CHANNEL_CREATE_NONE_NAME,
            }
        };
    }

    protected getFields() {
        return [
            // Args
            "badwords",
            "masterChannels",

            // Logic
            "badwordsState",
            "currentMasterChannels",
            "currentMasterChannelsState",
        ];
    }

    protected async getFieldsLogic( interaction: null, args: any ) {
        const result: any = {};

        // TODO Duplicate logic for badwords.
        let index = 0,
            badwords = "";

        if ( undefined !== args?.badwords ) {
            badwords = args.badwords;
        }

        if ( badwords.length ) {
            result.badwordsState = this.vars.badwordsValue;
            result.badwords = badwords;
        } else {
            result.badwordsState = this.vars.badwordsDefault;
        }

        const currentMasterChannels = args.masterChannels
            .map( ( masterChannel: any ) => { // TODO use data type.
                ++index;
                return `**#${ index }**\n` +
                    `Name: <#${ masterChannel.channelId }>\n` +
                    "Channel ID: `" + masterChannel.channelId + "`\n" +
                    "Dynamic Channels Name: `" + masterChannel.data[ 0 ].object.dynamicChannelNameTemplate + "`\n"; // TODO Use utils.
            } );

        if ( currentMasterChannels.length ) {
            result.currentMasterChannels = currentMasterChannels.join( "\n" );
            result.currentMasterChannelsState = this.vars.currentMasterChannelsValue;
        } else {
            result.currentMasterChannelsState = this.vars.currentMasterChannelsNone;
        }

        return result;
    }

    protected getColor(): number {
        return DYNAMICO_DEFAULT_COLOR_BRAND;
    }
}

export default ConfigureEmbed;
