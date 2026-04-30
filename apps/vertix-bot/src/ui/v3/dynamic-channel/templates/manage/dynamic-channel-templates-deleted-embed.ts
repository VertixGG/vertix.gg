import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    templatesEmoji: uiUtilsWrapAsTemplate( "templatesEmoji" ),
    templateName: uiUtilsWrapAsTemplate( "templateName" ),
    templatesCount: uiUtilsWrapAsTemplate( "templatesCount" ),
    maxTemplates: uiUtilsWrapAsTemplate( "maxTemplates" )
};

const DynamicChannelTemplatesDeletedEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelTemplatesDeletedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xED4245 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "🗑️  Template Deleted" )
    .setDescription( () => (
        `Template **"${ vars.templateName }"** has been deleted.\n\n` +
        `**Templates**: \`${ vars.templatesCount }/${ vars.maxTemplates }\``
    ) )
    .setLogic( ( args: UIArgs ) => ( {
        templateName: args.deletedTemplateName ?? "Unknown",
        templatesCount: args.templates?.length ?? 0,
        maxTemplates: args.maxTemplates ?? 5
    } ) )
    .setDefaultVars( () => ( {
        templatesEmoji: EmojiManager.$.getMarkdown( "Close" )
    } ) )
    .build();

export { DynamicChannelTemplatesDeletedEmbed, vars as DYNAMIC_CHANNEL_TEMPLATES_DELETED_VARS };

