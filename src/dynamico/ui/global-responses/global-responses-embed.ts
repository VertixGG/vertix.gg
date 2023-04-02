import { Colors } from "discord.js";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

import { UIEmbedTemplate } from "@dynamico/ui/base/ui-embed-template";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

export default class GlobalResponsesEmbed extends UIEmbedTemplate {
    private vars: any = {};

    public static getName() {
        return "Dynamico/UI/GlobalResponses/GlobalResponsesEmbed";
    }

    public constructor() {
        super();

        this.vars = {
            masterChannelNotExist: uiUtilsWrapAsTemplate( "masterChannelNotExist" ), // TODO: Not a global message.
            somethingWentWrong: uiUtilsWrapAsTemplate( "somethingWentWrong" ),

            titles: uiUtilsWrapAsTemplate( "titles" ),
            descriptions: uiUtilsWrapAsTemplate( "descriptions" ),
            colors: uiUtilsWrapAsTemplate( "colors" ),
        };
    }

    protected getTemplateOptions() {
        return {
            descriptions: {
                [ this.vars.masterChannelNotExist ]: "Master channel does not exist",
                [ this.vars.somethingWentWrong ]: "Something went wrong",
            },
            titles: {
                [ this.vars.masterChannelNotExist ]: "🤷 Oops, an issue has occurred",
                [ this.vars.somethingWentWrong ]: "🤷 Oops, an issue has occurred",
            },
            colors: {
                [ this.vars.masterChannelNotExist ]: DYNAMICO_DEFAULT_COLOR_ORANGE_RED,
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
