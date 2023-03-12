import UITemplate from "@dynamico/ui/base/ui-template";

export default class Embed extends UITemplate {
    protected getTemplateOptions() {
        return {
            descriptions: {
                "%{masterChannelNotExist}%": "Master channel does not exist",
            },
            titles: {
                "%{masterChannelNotExist}%": "🤷 Oops, an issue has occurred",
            },
            colors: {
                "%{masterChannelNotExist}%": 0xFF8C00,
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
