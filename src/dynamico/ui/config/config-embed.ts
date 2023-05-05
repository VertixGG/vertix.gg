import { UIEmbed } from "@dynamico/ui/_base/ui-embed";
import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";
import { DEFAULT_BADWORDS_INITIAL_DISPLAY_VALUE } from "@dynamico/constants/badwords";
import { DEFAULT_MASTER_CHANNEL_CREATE_NONE_NAME } from "@dynamico/constants/master-channel";

export class ConfigEmbed extends UIEmbed {
    private vars: any;

    public static getName() {
        return "Dynamico/UI/ConfigEmbed";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public constructor() {
        super();

        this.vars = {
            masterChannels: uiUtilsWrapAsTemplate( "masterChannels" ),
            masterChannelsDefault: uiUtilsWrapAsTemplate( "masterChannelsDefault" ),
            masterChannelsState: uiUtilsWrapAsTemplate( "masterChannelsState" ),

            badwords: uiUtilsWrapAsTemplate( "badwords" ),
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
            this.vars.masterChannelsState +
            "\n**Current Bad Words:**\n" +
            this.vars.badwordsState;
    }

    protected getArgsFields() {
        return [
            "badwords",
            "masterChannels",
        ];
    }

    protected getLogicFields() {
        return [
            "badwordsState",
            "masterChannelsState",
        ];
    }

    protected getFieldOptions(): any {
        return {
            badwordsState: {
                [ this.vars.badwords ]: "`" + this.vars.badwords + "`",
                [ this.vars.badwordsDefault ]: DEFAULT_BADWORDS_INITIAL_DISPLAY_VALUE,
            },
            masterChannelsState: {
                [ this.vars.masterChannels ]: this.vars.masterChannels,
                [ this.vars.masterChannelsDefault ]: DEFAULT_MASTER_CHANNEL_CREATE_NONE_NAME + "\n",
            }
        };
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
            result.badwords = badwords;
            result.badwordsState = this.vars.badwords;
        } else {
            result.badwordsState = this.vars.badwordsDefault;
        }

        // TODO: should be dynamic.
        const masterChannels = args.masterChannels
            .map( ( masterChannel: any ) => { // TODO use data type.
                ++index;
                return `**#${ index }**\n` +
                    `Name: <#${ masterChannel.channelId }>\n` +
                    "Channel ID: `" + masterChannel.channelId + "`\n" +
                    "Dynamic Channels Name: `" + masterChannel.data[ 0 ].object.dynamicChannelNameTemplate + "`\n"; // TODO Use utils.
            } );

        if ( masterChannels.length ) {
            result.masterChannels = masterChannels.join( "\n" ); // TODO: should be dynamic.
            result.masterChannelsState = this.vars.masterChannels;
        } else {
            result.masterChannelsState = this.vars.masterChannelsDefault;
        }

        return result;
    }

    protected getColor(): number {
        return DYNAMICO_DEFAULT_COLOR_BRAND;
    }
}
