import { UIEmbed } from "@dynamico/ui/_base/ui-embed";

import {
    DEFAULT_BADWORDS_PLACEHOLDER,
} from "@dynamico/constants/badwords";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";
import { DYNAMICO_DEFAULT_COLOR_YELLOW } from "@dynamico/constants/dynamico";

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
        return DYNAMICO_DEFAULT_COLOR_YELLOW;
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
                [ this.vars.badwordsPlaceholder ]: DEFAULT_BADWORDS_PLACEHOLDER,
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
