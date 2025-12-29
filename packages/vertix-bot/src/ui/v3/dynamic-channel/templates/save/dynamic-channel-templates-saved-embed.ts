import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    templatesEmoji: uiUtilsWrapAsTemplate( "templatesEmoji" ),
    templateName: uiUtilsWrapAsTemplate( "templateName" ),
    templatesCount: uiUtilsWrapAsTemplate( "templatesCount" ),
    maxTemplates: uiUtilsWrapAsTemplate( "maxTemplates" ),
    templatesList: uiUtilsWrapAsTemplate( "templatesList" ),
    templatesListDisplay: uiUtilsWrapAsTemplate( "templatesListDisplay" ),
    templatesListDefault: uiUtilsWrapAsTemplate( "templatesListDefault" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    separator: uiUtilsWrapAsTemplate( "separator" )
};

const DynamicChannelTemplatesSavedEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelTemplatesSavedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x57F287 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ vars.templatesEmoji }  Template Saved!` )
    .setDescription( () => (
        `Your template **"${ vars.templateName }"** has been saved successfully!\n\n` +
        `**Templates**: \`${ vars.templatesCount }/${ vars.maxTemplates }\`\n\n` +
        vars.templatesListDisplay +
        "\n-# You can apply this template anytime using the **Apply Template** button."
    ) )
    .setOptions( () => ( {
        templatesListDisplay: {
            [ vars.templatesListDefault ]: "",
            [ vars.templatesList ]: `**Your Templates:**\n${ vars.templatesList }\n`
        }
    } ) )
    .setArrayOptions( () => ( {
        templatesList: {
            format: `- ${ vars.value }${ vars.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string | number | string[]> = {};

        result.templateName = args.templateName ?? "Unknown";
        result.templatesCount = args.templates?.length ?? 0;
        result.maxTemplates = args.maxTemplates ?? 5;

        if ( args.templates?.length ) {
            result.templatesList = args.templates.map( ( t: { name: string } ) => t.name );
            result.templatesListDisplay = vars.templatesList;
        } else {
            result.templatesListDisplay = vars.templatesListDefault;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        templatesEmoji: EmojiManager.$.getMarkdown( "ChannelPresetSave" )
    } ) )
    .build();

export { DynamicChannelTemplatesSavedEmbed, vars as DYNAMIC_CHANNEL_TEMPLATES_SAVED_VARS };

