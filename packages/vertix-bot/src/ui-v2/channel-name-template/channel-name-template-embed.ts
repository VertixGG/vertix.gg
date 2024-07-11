import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class ChannelNameTemplateEmbed extends UIEmbedBase {
    private static vars = {
        dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),
    };

    private config = ConfigManager.$
        .get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", "0.0.2" as const );

    public static getName() {
        return "VertixBot/UI-V2/ChannelNameTemplateEmbed";
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
            dynamicChannelNameTemplate: args?.dynamicChannelNameTemplate ||
                this.config.data.masterChannelData.dynamicChannelNameTemplate,
        };
    }
}
