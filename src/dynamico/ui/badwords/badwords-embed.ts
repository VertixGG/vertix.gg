import { Interaction } from "discord.js";

import { UIEmbedTemplate } from "@dynamico/ui/_base/ui-embed-template";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { DEFAULT_BADWORDS_INITIAL_DISPLAY_VALUE } from "@dynamico/constants/badwords";
import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";

export class BadwordsEmbed extends UIEmbedTemplate {
    private vars: any = {};

    public static getName() {
        return "Dynamico/UI/BadwordsEmbed";
    }

    public constructor() {
        super();

        this.vars = {
            value: uiUtilsWrapAsTemplate( "value" ),
            default: uiUtilsWrapAsTemplate( "default" ),

            current: uiUtilsWrapAsTemplate( "current" ),
            badwords: uiUtilsWrapAsTemplate( "badwords" ),
        };
    }

    protected getTemplateOptions() {
        return {
            current: {
                [ this.vars.value ]: "`" + this.vars.badwords + "`",
                [ this.vars.default ]: `${ DEFAULT_BADWORDS_INITIAL_DISPLAY_VALUE }`,
            }
        };
    }

    protected getTemplateInputs() {
        const title = "Step 2 - Set bad words",
            description = "Here you can filter out “bad words” from dynamic channels names.\n" +
                "You can keep the current words by pressing the \"Next\" button.\n\n" +
                "**Current bad words**:\n" +
                this.vars.current;

        return {
            type: "embed",
            color: DYNAMICO_DEFAULT_COLOR_BRAND,
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
            result.current = this.vars.value;
            result.badwords = badwords;
        } else {
            result.current = this.vars.default;
        }

        return result;
    }
}
