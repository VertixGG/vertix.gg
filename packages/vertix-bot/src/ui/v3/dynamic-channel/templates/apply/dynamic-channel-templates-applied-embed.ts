import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    templatesEmoji: uiUtilsWrapAsTemplate( "templatesEmoji" ),
    templateName: uiUtilsWrapAsTemplate( "templateName" ),
    appliedSettings: uiUtilsWrapAsTemplate( "appliedSettings" )
};

const DynamicChannelTemplatesAppliedEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelTemplatesAppliedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x57F287 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ vars.templatesEmoji }  Template Applied!` )
    .setDescription( () => (
        `Template **"${ vars.templateName }"** has been applied to your channel!\n\n` +
        `**Applied Settings:**\n${ vars.appliedSettings }\n\n` +
        "-# Note: Channel name changes may take a moment due to rate limits."
    ) )
    .setLogic( ( args: UIArgs ) => {
        const config = args.appliedTemplate?.config;
        const settings = [];

        if ( config ) {
            if ( config.nameTemplate ) settings.push( `- **Name**: ${ config.nameTemplate }` );
            if ( config.userLimit !== undefined ) settings.push( `- **Limit**: ${ config.userLimit === 0 ? "Unlimited" : config.userLimit }` );
            if ( config.state ) settings.push( `- **Privacy**: ${ config.state }` );
            if ( config.visibilityState ) settings.push( `- **Visibility**: ${ config.visibilityState }` );
            if ( typeof config.region === "string" && config.region.length ) {
                settings.push( `- **Region**: ${ config.region === "auto" ? "Automatic" : config.region }` );
            }
        }

        return {
            templateName: args.appliedTemplate?.name ?? "Unknown",
            appliedSettings: settings.length > 0 ? settings.join( "\n" ) : "No settings applied"
        };
    } )
    .setDefaultVars( () => ( {
        templatesEmoji: EmojiManager.$.getMarkdown( "Templates" )
    } ) )
    .build();

export { DynamicChannelTemplatesAppliedEmbed };

