import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class NotYourChannelEmbed extends UIEmbedBase {
    private static vars = {
        masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    };

    public static getName() {
        return "Vertix/UI-V2/NotYourChannelEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getTitle(): string {
        return "⛔  This is not your channel!";
    }

    protected getDescription(): string {
        return "But you can open your own channel :)\n" +
            `\n Just click here: <#${ NotYourChannelEmbed.vars.masterChannelId }>`;
    }

    protected getColor(): number {
        return 0xFF5202;
    }

    protected getLogic( args?: UIArgs ) {
        return {
            masterChannelId: args?.masterChannelId,
        };
    }
}
