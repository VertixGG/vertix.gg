import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import {
    DynamicChannelElementsGroup
} from "@vertix/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class ChannelButtonsTemplateEmbed extends UIEmbedBase {
    private static _vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ChannelButtonsTemplateEmbed";
    }

    protected getDescription(): string {
        return ChannelButtonsTemplateEmbed._vars.dynamicChannelButtonsTemplate;
    }

    protected getArrayOptions() {
        const result = {
            dynamicChannelButtonsTemplate: {
                format: `- ( ${ ChannelButtonsTemplateEmbed._vars.value } )${ ChannelButtonsTemplateEmbed._vars.separator }`,
                separator: "\n",
                options: {} as any,
            },
        };

        DynamicChannelElementsGroup.getAllItems().forEach( ( item: DynamicChannelButtonBase ) => {
            result.dynamicChannelButtonsTemplate.options[ item.getId() ] = item.getLabelForEmbed();
        } );

        return result;
    }

    protected getLogic( args: UIArgs ) {
        return {
            dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.sortIds( args.dynamicChannelButtonsTemplate ),
        };
    }
}

