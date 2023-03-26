import { MessageComponentInteraction } from "discord.js";

import { UIEmbed } from "@dynamico/ui/base/ui-embed";
import { BaseInteractionTypes } from "@dynamico/interfaces/ui";
import { guildGetBadwordsJoined } from "@dynamico/utils/guild";

import { GUILD_DEFAULT_BADWORDS_PLACEHOLDER } from "@dynamico/constants/guild";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

export class NotifySetupSuccess extends UIEmbed {
    private vars: any = {};

    public static getName() {
        return "Dynamico/UI/NotifySetupSuccess";
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

            value: uiUtilsWrapAsTemplate( "value" ),
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
            templates.badwords;
    }

    protected getColor(): number {
        return 0xFFD700;
    }

    protected getFields() {
        return [
            // Args.
            "masterChannelId",
            "masterCategoryName",

            "dynamicChannelNameTemplate",

            // Logic.
            "badwords",
            "badwordsValue",
        ];
    }

    protected getFieldOptions() {
        return {
            badwords: {
                [ this.vars.value ]: "`" + this.vars.badwordsValue + "`",
                [ this.vars.badwordsPlaceholder ]: GUILD_DEFAULT_BADWORDS_PLACEHOLDER,
            }
        };
    }

    protected async getFieldsLogic( interaction: BaseInteractionTypes ) {
        const interactionAs = ( interaction as MessageComponentInteraction ),
            badwords = await guildGetBadwordsJoined( interactionAs.guildId?.toString() ?? "" );

        return {
            badwords: badwords.length ? this.vars.value : this.vars.badwordsPlaceholder,

            badwordsValue: badwords,
        };
    }
}

export default NotifySetupSuccess;
