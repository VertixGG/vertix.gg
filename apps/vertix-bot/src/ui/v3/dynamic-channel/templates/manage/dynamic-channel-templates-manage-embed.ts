import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    templatesEmoji: uiUtilsWrapAsTemplate( "templatesEmoji" ),
    templatesCount: uiUtilsWrapAsTemplate( "templatesCount" ),
    maxTemplates: uiUtilsWrapAsTemplate( "maxTemplates" )
};

const DynamicChannelTemplatesManageEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelTemplatesManageEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xFEE75C )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ vars.templatesEmoji }  Manage Templates` )
    .setDescription( () => (
        "Select a template from the menu below to delete it.\n\n" +
        `**Templates**: \`${ vars.templatesCount }/${ vars.maxTemplates }\`\n\n` +
        "-# ⚠️ This action cannot be undone."
    ) )
    .setLogic( ( args: UIArgs ) => ( {
        templatesCount: args.templates?.length ?? 0,
        maxTemplates: args.maxTemplates ?? 5
    } ) )
    .setDefaultVars( () => ( {
        templatesEmoji: EmojiManager.$.getMarkdown( "Close" )
    } ) )
    .build();

export { DynamicChannelTemplatesManageEmbed, vars as DYNAMIC_CHANNEL_TEMPLATES_MANAGE_VARS };

