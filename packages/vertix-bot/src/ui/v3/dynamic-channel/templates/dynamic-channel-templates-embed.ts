import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    templatesEmoji: uiUtilsWrapAsTemplate( "templatesEmoji" ),
    templatesCount: uiUtilsWrapAsTemplate( "templatesCount" ),
    maxTemplates: uiUtilsWrapAsTemplate( "maxTemplates" ),
    templatesList: uiUtilsWrapAsTemplate( "templatesList" ),
    templatesListDisplay: uiUtilsWrapAsTemplate( "templatesListDisplay" ),
    templatesListDefault: uiUtilsWrapAsTemplate( "templatesListDefault" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    separator: uiUtilsWrapAsTemplate( "separator" )
};

const DynamicChannelTemplatesEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelTemplatesEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x5865F2 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ vars.templatesEmoji }  Channel Templates` )
    .setDescription( () => (
        "Save your current channel configuration as a template and apply it later with one click.\n\n" +
        `**Templates**: \`${ vars.templatesCount }/${ vars.maxTemplates }\`\n\n` +
        vars.templatesListDisplay
    ) )
    .setFooterText( "Use the buttons below to manage your templates." )
    .setOptions( () => ( {
        templatesListDisplay: {
            [ vars.templatesListDefault ]: "-# You don't have any saved templates yet.",
            [ vars.templatesList ]: `**Your Templates:**\n${ vars.templatesList }`
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
        templatesEmoji: EmojiManager.$.getMarkdown( "ChannelTemplates" )
    } ) )
    .build();

export { DynamicChannelTemplatesEmbed, vars as DYNAMIC_CHANNEL_TEMPLATES_VARS };

