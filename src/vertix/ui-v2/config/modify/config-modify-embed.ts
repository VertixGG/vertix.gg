import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export class ConfigModifyEmbed extends UIEmbedBase {
    private static vars: any = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        index: uiUtilsWrapAsTemplate( "index" ),
        masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),

        dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),
        dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" ),

        verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ConfigModifyEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle() {
        return `🔧  Modify Master Channel #${ ConfigModifyEmbed.vars.index }`;
    }

    protected getDescription() {
        return "Configure master channel according to your preferences.\n\n" +

            "__Current Configuration__:\n\n" +
            `- Name: <#${ ConfigModifyEmbed.vars.masterChannelId }>\n` +
            `- Channel ID: \`${ ConfigModifyEmbed.vars.masterChannelId }\`\n` +
            `- Dynamic Channels Name: \`${ ConfigModifyEmbed.vars.dynamicChannelNameTemplate }\`\n` +
            "- Buttons:\n" +
            ConfigModifyEmbed.vars.dynamicChannelButtonsTemplate;
    }

    protected getArrayOptions() {
        // TODO: Use real data.
        return {
            dynamicChannelButtonsTemplate: {
                format: `  -  **${ ConfigModifyEmbed.vars.value }**${ ConfigModifyEmbed.vars.separator }`,
                separator: "\n",
                options: {
                    0: "✏️ Rename",
                    1: "✋ User Limit",
                    2: "🧹 Clear Chat",

                    3: "🚫 Private / 🌐 Public ",
                    4: "🙈 Hidden / 🐵 Shown",
                    5: "👥 Access",

                    6: "🔃 Reset Channel",
                    7: "😈 Claim Channel",
                }
            },
        };
    }

    protected getLogic( args: UIArgs ) {
        return {
            index: args.index + 1,
            masterChannelId: args.masterChannelId,
            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate,
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate,
        };
    }
}
