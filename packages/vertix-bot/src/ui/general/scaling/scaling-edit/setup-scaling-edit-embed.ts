import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingEditEmbed extends UIEmbedBase {
    private static vars = {
        selectedCategoryName: uiUtilsWrapAsTemplate( "selectedCategoryName" ),
        channelPrefix: uiUtilsWrapAsTemplate( "channelPrefix" ),
        maxMembersPerChannel: uiUtilsWrapAsTemplate( "maxMembersPerChannel" )
    };

    public static getName() {
        return "VertixBot/UI-General/SetupScalingEditEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return "https://i.ibb.co/wsqNGmk/dynamic-channel-line-370.png";
    }

    protected getTitle() {
        return "🔧  Configure Master Scaling Channel";
    }

    protected getDescription(): string {
        const v = SetupScalingEditEmbed.vars;
        return (
            "Configure master scaling channel according to your preferences.\n\n" +
            `• Category: **${ v.selectedCategoryName }**\n` +
            `• Channel Prefix: **${ v.channelPrefix }**\n` +
            `• Max Members/Channel: **${ v.maxMembersPerChannel }**\n\n` +
            "-# 💡 Changing category or prefix will not affect already created scaling channels.\n"
        );
    }

    protected getLogic( args: UIArgs ) {
        return {
            selectedCategoryName: args.selectedCategoryName || "Not selected",
            channelPrefix: args.channelPrefix || "Not configured",
            maxMembersPerChannel: args.maxMembersPerChannel || "Not configured"
        };
    }
}

export default SetupScalingEditEmbed;

