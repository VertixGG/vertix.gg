import { ApplicationCommandOptionType, ApplicationCommandType, PermissionsBitField } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import GlobalLogger from "@vertix.gg/ai/src/global-logger";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { Client, CommandInteraction } from "discord.js";

import type { ICommand } from "@vertix.gg/ai/src/interfaces/command";

const SUBCOMMAND_ADAPTERS: Record<string, string> = {
    prompt: "VertixAI/UI/PromptAdapter",
    triggers: "VertixAI/UI/TriggerAdapter"
};

export const Setup: ICommand = {
    name: "setup",

    description: "Configure Vertix AI for this server.",
    type: ApplicationCommandType.ChatInput,

    // Gated the same way the panels themselves are - editing the prompt hands
    // whoever does it control of a bot holding the full Discord tool surface.
    defaultMemberPermissions: [ PermissionsBitField.Flags.ManageGuild ],

    options: [
        {
            name: "prompt",
            description: "Download, upload or reset the AI's system prompt.",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "triggers",
            description: "Choose when the AI replies.",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],

    run: async( _client: Client, interaction: CommandInteraction<"cached"> ) => {
        if ( !interaction.isChatInputCommand() ) {
            return;
        }

        const subcommand = interaction.options.getSubcommand( false ) ?? "prompt";
        const adapterName = SUBCOMMAND_ADAPTERS[ subcommand ];

        if ( !adapterName ) {
            GlobalLogger.$.warn( Setup.run, `Unknown subcommand: '${ subcommand }'` );

            return;
        }

        const uiAdapter = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ).get( adapterName );

        await uiAdapter?.ephemeral( interaction );
    }
};

export default Setup;
