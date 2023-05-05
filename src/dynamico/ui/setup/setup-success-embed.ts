import { UIEmbed } from "@dynamico/ui/_base/ui-embed";

import {
    GUILD_DEFAULT_BADWORDS_PLACEHOLDER,
} from "@dynamico/constants/guild";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

export class SetupSuccessEmbed extends UIEmbed {
    private vars: any = {};

    public static getName() {
        return "Dynamico/UI/SetupSuccessEmbed";
    }

    public static belongsTo() {
        return [
            "Dynamico/UI/SetupWizard",
        ];
    }

    public constructor() {
        super();

        this.vars = {
            masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
            masterCategoryName: uiUtilsWrapAsTemplate( "masterCategoryName" ),

            dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),

            badwords: uiUtilsWrapAsTemplate( "badwords" ),
            badwordsState: uiUtilsWrapAsTemplate( "badwordsState" ),
            badwordsPlaceholder: uiUtilsWrapAsTemplate( "badwordsPlaceholder" ),
        };
    }

    protected getTitle() {
        return "🛠️ Dynamico has been set up successfully!";
    }

    protected getDescription() {
        const templates = {
            masterChannelId: "<#" + this.vars.masterChannelId + ">",
            dynamicChannelNameTemplate: "`" + this.vars.dynamicChannelNameTemplate + "`",
        };

        return "**Master Channel Created:**\n" +
            `Master Channel: ${ templates.masterChannelId }\n` +
            `Dynamic Channels Name: ${ templates.dynamicChannelNameTemplate }\n\n` +
            "**Bad Words:**\n" +
            this.vars.badwordsState + "\n\n";
    }

    protected getColor(): number {
        return 0xFFD700;
    }

    protected getArgsFields(): string[] {
        return [
            "badwords",
            "dynamicChannelNameTemplate",
            "masterChannelId",
        ];
    }

    protected getLogicFields() {
        return [
            "badwordsState",
        ];
    }

    protected getFieldOptions() {
        return {
            badwordsState: {
                [ this.vars.badwords ]: "`" + this.vars.badwords + "`",
                [ this.vars.badwordsPlaceholder ]: GUILD_DEFAULT_BADWORDS_PLACEHOLDER,
            }
        };
    }

    protected async getFieldsLogic( interaction: null, args: any ) {
        const result: any = {};

        if ( args.badwords?.length ) {
            result.badwordsState = this.vars.badwords;
        } else {
            result.badwordsState = this.vars.badwordsPlaceholder;
        }

        return result;
    }
}
