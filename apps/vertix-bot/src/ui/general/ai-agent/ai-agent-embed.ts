import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

type AIAgentArgs = {
    selectedChannelId: string | null;
    draftContent: string | null;
};

const vars = {
    selectedChannelDisplay: uiUtilsWrapAsTemplate( "selectedChannelDisplay" ),
    draftContentDisplay: uiUtilsWrapAsTemplate( "draftContentDisplay" )
};

const AIAgentEmbed = new EmbedBuilder<AIAgentArgs, typeof vars>( "VertixBot/UI-General/AIAgentEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "AI Agent" )
    .setDescription(
        "Select a channel, then press Send.\n\n" +
        `Selected channel: ${ vars.selectedChannelDisplay }\n\n` +
        `About to send:\n${ vars.draftContentDisplay }\n`
    )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setLogic( ( args ) => {
        const selectedChannelDisplay = typeof args.selectedChannelId === "string" && args.selectedChannelId.length
            ? `<#${ args.selectedChannelId }>`
            : "`none`";

        const cleanedDraft = typeof args.draftContent === "string" ? args.draftContent.trim() : "";
        const truncatedDraft = cleanedDraft.length > 500 ? `${ cleanedDraft.slice( 0, 500 ) }...` : cleanedDraft;
        const escapedDraft = truncatedDraft.replaceAll( "```", "``\u200b`" );

        const draftContentDisplay = escapedDraft.length
            ? `\`\`\`\n${ escapedDraft }\n\`\`\``
            : "`none`";

        return {
            selectedChannelDisplay,
            draftContentDisplay
        };
    } )
    .build();

export { AIAgentEmbed };
export type { AIAgentArgs };

