import { Colors } from "discord.js";

import UIEmbedTemplate from "@dynamico/ui/base/ui-embed-template";

export default class Embed extends UIEmbedTemplate {
    protected getTemplateOptions() {
        return {
            descriptions: {
                "%{masterChannelNotExist}%": "Master channel does not exist",
                "%{somethingWentWrong}%": "Something went wrong",
            },
            titles: {
                "%{masterChannelNotExist}%": "🤷 Oops, an issue has occurred",
                "%{somethingWentWrong}%": "🤷 Oops, an issue has occurred",
            },
            colors: {
                "%{masterChannelNotExist}%": 0xFF8C00,
                "%{somethingWentWrong}%": Colors.Red,
            },
        };
    }

    protected getTemplateInputs() {
        return {
            type: "embed",
            title: "%{titles}%",
            description: "%{descriptions}%",
            color: "%{colors}%",
        };
    }

    protected getTemplateLogic( interaction: null, args?: any ) {
        return {
            descriptions: args.globalResponse,
            colors: args.globalResponse,
            titles: args.globalResponse,
        };
    }
}
