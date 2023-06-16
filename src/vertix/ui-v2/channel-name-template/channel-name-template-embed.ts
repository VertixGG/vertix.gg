import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

import { DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE } from "@vertix/definitions/master-channel";

export class ChannelNameTemplateEmbed extends UIEmbedBase {
    private static vars = {
        dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ChannelNameTemplateEmbed";
    }

    protected getTitle(): string {
        return "Set Dynamic Channels Template Name";
    }

    protected getDescription(): string {
        return "You can specify a default name for dynamic channels that will be used when they are opened.\n\n" +
            "_Current template name_:\n" +
            `\`${ ChannelNameTemplateEmbed.vars.dynamicChannelNameTemplate}\``;
    }

    protected getLogic( args: UIArgs ) {
        return {
            dynamicChannelNameTemplate: args?.dynamicChannelNameTemplate || DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
        };
    }
}
