import { MessageComponentInteraction } from "discord.js";

import { UIEmbed } from "@dynamico/ui/_base/ui-embed";
import { UIBaseInteractionTypes } from "@dynamico/ui/_base/ui-interfaces";

import {
    GUILD_DEFAULT_BADWORDS_PLACEHOLDER,
} from "@dynamico/constants/guild";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { guildGetBadwordsFormatted } from "@dynamico/utils/guild";

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
            badwordsValue: uiUtilsWrapAsTemplate( "badwordsValue" ),
            badwordsPlaceholder: uiUtilsWrapAsTemplate( "badwordsPlaceholder" ),
            badwordsOptionValue: uiUtilsWrapAsTemplate( "badwordsOptionValue" ),
        };
    }

    protected getTitle() {
        return "🛠️ Dynamico has been set up successfully!";
    }

    protected getDescription() {
        const templates = {
            masterChannelId: "<#" + this.vars.masterChannelId + ">",
            dynamicChannelNameTemplate: "`" + this.vars.dynamicChannelNameTemplate + "`",
            badwords: this.vars.badwords,
        };

        return "**Master Channel Created:**\n" +
            `Master Channel: ${ templates.masterChannelId }\n` +
            `Dynamic Channels Name: ${ templates.dynamicChannelNameTemplate }\n\n` +
            "**Bad Words:**\n" +
            templates.badwords + "\n\n";
    }

    protected getColor(): number {
        return 0xFFD700;
    }

    protected getArgsFields(): string[] {
        return [
            "masterChannelId",
            "masterCategoryName",

            "dynamicChannelNameTemplate",
        ];
    }

    protected getLogicFields() {
        return [
            "badwords",
            "badwordsValue",
        ];
    }

    protected getFieldOptions() {
        return {
            badwords: {
                [ this.vars.badwordsOptionValue ]: "`" + this.vars.badwordsValue + "`",
                [ this.vars.badwordsPlaceholder ]: GUILD_DEFAULT_BADWORDS_PLACEHOLDER,
            }
        };
    }

    protected async getFieldsLogic( interaction: UIBaseInteractionTypes, args: any ) {
        const interactionAs = ( interaction as MessageComponentInteraction ),
            badwords = await guildGetBadwordsFormatted( interactionAs.guildId?.toString() ?? "" );

        return {
            badwords: badwords.length ? this.vars.badwordsOptionValue : this.vars.badwordsPlaceholder,
            badwordsValue: badwords,
        };
    }
}
