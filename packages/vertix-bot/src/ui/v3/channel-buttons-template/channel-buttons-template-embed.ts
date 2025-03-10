import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class ChannelButtonsTemplateEmbed extends UIEmbedBase {
    private static _vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" )
    };

    public static getName () {
        return "Vertix/UI-V3/ChannelButtonsTemplateEmbed";
    }

    protected getDescription (): string {
        return ChannelButtonsTemplateEmbed._vars.dynamicChannelButtonsTemplate;
    }

    protected getArrayOptions () {
        const result = {
            dynamicChannelButtonsTemplate: {
                format: `- ( ${ ChannelButtonsTemplateEmbed._vars.value } )${ ChannelButtonsTemplateEmbed._vars.separator }`,
                separator: "\n",
                options: {} as any
            }
        };

        DynamicChannelPrimaryMessageElementsGroup.getAll().forEach( ( item: DynamicChannelButtonBase ) => {
            result.dynamicChannelButtonsTemplate.options[ item.getId() ] = item.getLabelForEmbed();
        } );

        return result;
    }

    protected getLogic ( args: UIArgs ) {
        return {
            dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.sortIds(
                args.dynamicChannelButtonsTemplate
            )
        };
    }
}
