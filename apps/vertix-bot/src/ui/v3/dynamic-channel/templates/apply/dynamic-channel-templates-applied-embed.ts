import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    templatesEmoji: uiUtilsWrapAsTemplate( "templatesEmoji" ),
    templateName: uiUtilsWrapAsTemplate( "templateName" ),
    appliedSettings: uiUtilsWrapAsTemplate( "appliedSettings" ),

    // Label vars for dashboard editability
    labelName: uiUtilsWrapAsTemplate( "labelName" ),
    labelLimit: uiUtilsWrapAsTemplate( "labelLimit" ),
    labelPrivacy: uiUtilsWrapAsTemplate( "labelPrivacy" ),
    labelVisibility: uiUtilsWrapAsTemplate( "labelVisibility" ),
    labelRegion: uiUtilsWrapAsTemplate( "labelRegion" ),
    labelUnlimited: uiUtilsWrapAsTemplate( "labelUnlimited" ),
    labelAutomatic: uiUtilsWrapAsTemplate( "labelAutomatic" ),
    labelUnknown: uiUtilsWrapAsTemplate( "labelUnknown" ),
    labelNoSettings: uiUtilsWrapAsTemplate( "labelNoSettings" )
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
    .setLogic( ( args: UIArgs, v: typeof vars ) => {
        const config = args.appliedTemplate?.config;
        const settings = [];

        if ( config ) {
            if ( config.nameTemplate ) settings.push( `${ v.labelName } ${ config.nameTemplate }` );
            if ( config.userLimit !== undefined ) settings.push( `${ v.labelLimit } ${ config.userLimit === 0 ? v.labelUnlimited : config.userLimit }` );
            if ( config.state ) settings.push( `${ v.labelPrivacy } ${ config.state }` );
            if ( config.visibilityState ) settings.push( `${ v.labelVisibility } ${ config.visibilityState }` );
            if ( typeof config.region === "string" && config.region.length ) {
                settings.push( `${ v.labelRegion } ${ config.region === "auto" ? v.labelAutomatic : config.region }` );
            }
        }

        return {
            templateName: args.appliedTemplate?.name ?? v.labelUnknown,
            appliedSettings: settings.length > 0 ? settings.join( "\n" ) : v.labelNoSettings
        };
    } )
    .setDefaultVars( () => ( {
        templatesEmoji: EmojiManager.$.getMarkdown( "ChannelTemplates" ),
        labelName: "- **Name**:",
        labelLimit: "- **Limit**:",
        labelPrivacy: "- **Privacy**:",
        labelVisibility: "- **Visibility**:",
        labelRegion: "- **Region**:",
        labelUnlimited: "Unlimited",
        labelAutomatic: "Automatic",
        labelUnknown: "Unknown",
        labelNoSettings: "No settings applied"
    } ) )
    .build();

export { DynamicChannelTemplatesAppliedEmbed };

