import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-button-base";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" )
};

const ChannelButtonsTemplateEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ChannelButtonsTemplateEmbed",
    vars
)
    .setDescription( () => vars.dynamicChannelButtonsTemplate )
    .setArrayOptions( () => {
        const result: Record<string, { format: string; separator: string; options: Record<string, string> }> = {
            dynamicChannelButtonsTemplate: {
                format: `- ( ${ vars.value } )${ vars.separator }`,
                separator: "\n",
                options: {}
            }
        };

        DynamicChannelElementsGroup.getAll().forEach( ( item: DynamicChannelButtonBase ) => {
            result.dynamicChannelButtonsTemplate.options[ item.getId() ] = item.getLabelForEmbed();
        } );

        return result;
    } )
    .setLogic( ( args: UIArgs ) => ( {
        dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.sortIds( args.dynamicChannelButtonsTemplate )
    } ) )
    .setDefaultVars( () => ( {
        dynamicChannelButtonsTemplate: "Button list"
    } ) )
    .build();

export { ChannelButtonsTemplateEmbed };
