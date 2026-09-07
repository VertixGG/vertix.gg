import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    source: uiUtilsWrapAsTemplate( "source" ),
    length: uiUtilsWrapAsTemplate( "length" ),
    preview: uiUtilsWrapAsTemplate( "preview" ),
    state: uiUtilsWrapAsTemplate( "state" )
};

const PromptEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixAI/UI/PromptEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => "🧠  AI system prompt" )
    .setDescription( () => (
        "This is the instruction Vertix AI follows in this server.\n\n" +
        `**Source:** ${ vars.source }\n` +
        `**Length:** ${ vars.length } characters\n\n` +
        `\`\`\`\n${ vars.preview }\n\`\`\`\n` +
        `${ vars.state }`
    ) )
    .setColor( Colors.Blurple )
    .setLogic( ( args: UIArgs ) => ( {
        source: args.source,
        length: args.length,
        preview: args.preview,
        state: args.state
    } ) )
    .setDefaultVars( () => ( {
        source: "Default (not customised)",
        length: "0",
        preview: "...",
        state: "Press **Download** to get the file, edit it, then press **Upload**."
    } ) )
    .build();

export { PromptEmbed };
