import { MessageComponentInteraction } from "discord.js";

import { UIEmbed } from "@dynamico/ui/base/ui-embed";
import { BaseInteractionTypes } from "@dynamico/interfaces/ui";
import { guildGetBadwordsJoined } from "@dynamico/utils/guild";
import { GUILD_DEFAULT_BADWORDS_PLACEHOLDER } from "@dynamico/constants/guild";

export class NotifySetupSuccess extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/NotifySetupSuccess";
    }

    protected getTitle() {
        return "🛠️ Dynamico has been set up successfully!";
    }

    protected getDescription() {
        return "**Master Channel Created:**\n" +
            "Master Channel: <#%{masterChannelId}%>\n" +
            "Dynamic Channels Name: `%{dynamicChannelNameTemplate}%`\n\n" +
            "**Bad Words:**\n" +
            "%{badwords}%";
    }

    protected getColor(): number {
        return 0xFFD700;
    }

    protected getOptions(): any {
        return {
            badwords: {
                "%{badwordsPlaceholder}%": GUILD_DEFAULT_BADWORDS_PLACEHOLDER,
                "%{value}%": "`%{badwordsValue}%`",
            }
        };
    }

    protected getFields() {
        return [
            "masterCategoryName",
            "masterChannelId",

            "dynamicChannelNameTemplate",

            "badwords",
            "badwordsValue",
        ];
    }

    protected async getFieldsLogic( interaction: BaseInteractionTypes ) {
        const interactionAs = ( interaction as MessageComponentInteraction ),
            badwords = await guildGetBadwordsJoined( interactionAs.guildId?.toString() ?? "" );

        return {
            badwords: badwords.length ? "%{value}%" : "%{badwordsPlaceholder}%",
        };
    }
}

export default NotifySetupSuccess;
