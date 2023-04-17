import { Colors } from "discord.js";

import { UIEmbedTemplate } from "@dynamico/ui/base/ui-embed-template";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

// TODO: Remove the component, use `UIEmbed` standalone.
export default class GlobalResponsesEmbed extends UIEmbedTemplate {
    private vars: any = {};

    public static getName() {
        return "Dynamico/UI/GlobalResponses/GlobalResponsesEmbed";
    }

    public constructor() {
        super();

        this.vars = {
            somethingWentWrong: uiUtilsWrapAsTemplate( "somethingWentWrong" ),

            titles: uiUtilsWrapAsTemplate( "titles" ),
            descriptions: uiUtilsWrapAsTemplate( "descriptions" ),
            colors: uiUtilsWrapAsTemplate( "colors" ),
        };
    }

    protected getTemplateOptions() {
        return {
            descriptions: {
                [ this.vars.somethingWentWrong ]: "Something went wrong",
            },
            titles: {
                [ this.vars.somethingWentWrong ]: "🤷 Oops, an issue has occurred",
            },
            colors: {
                [ this.vars.somethingWentWrong ]: Colors.Red,
            },
        };
    }

    protected getTemplateInputs() {
        return {
            type: "embed",
            title: this.vars.titles,
            description: this.vars.descriptions,
            color: this.vars.colors,
        };
    }

    protected getTemplateLogic( interaction: null, args?: any ) {
        return {
            // Args.
            descriptions: args.globalResponse,
            colors: args.globalResponse,
            titles: args.globalResponse,
        };
    }
}
