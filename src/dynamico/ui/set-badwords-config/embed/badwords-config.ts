import { Interaction } from "discord.js";

import { UIEmbedTemplate } from "@dynamico/ui/base/ui-embed-template";

import { GUILD_DEFAULT_BADWORDS_INITIAL_DISPLAY_VALUE } from "@dynamico/constants/guild";
import { DATA_DEFAULT_DYNAMICO_BRAND_COLOR } from "@dynamico/constants/data";

export class BadwordsConfig extends UIEmbedTemplate { // TODO: Extend UITemplateElement
    public static getName() {
        return "Dynamico/UI/SetBadwordsConfig/Embeds/BadwordsConfig";
    }

    protected getTemplateOptions() {
        return {
            current: {
                "%{value}%": "`%{badwords}%`",
                "%{default}%": `${ GUILD_DEFAULT_BADWORDS_INITIAL_DISPLAY_VALUE }`,
            }
        };
    }

    protected getTemplateInputs() {
        const title = "Step 2 - Set bad words",
            description = "Here you can filter out “bad words” from dynamic channels names.\n" +
                "You can keep the current words by pressing the \"Next\" button.\n\n" +
                "**Current bad words**:\n" +
                "%{current}%";

        return {
            type: "embed",
            color: DATA_DEFAULT_DYNAMICO_BRAND_COLOR,
            title,
            description,
        };
    }

    protected async getTemplateLogic( interaction: Interaction, args: any ) {
        const result: any = {};

        let badwords = "";

        if ( undefined !== args?.badwords ) {
            badwords = args.badwords;
        }

        if ( badwords.length ) {
            result.current = "%{value}%";
            result.badwords = badwords;
        } else {
            result.current = "%{default}%";
        }

        return result;
    }
}
