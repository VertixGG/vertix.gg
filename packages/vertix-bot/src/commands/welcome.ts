import { ApplicationCommandType } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type UIVersioningAdapterService from "@vertix.gg/gui/src/ui-versioning-adapter-service";

import type { Client, CommandInteraction } from "discord.js";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";

const name = "welcome";

export const Welcome: ICommand = {
    name,

    description: "Displaying Vertix welcome message in ephemeral mode.",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ DEFAULT_SETUP_PERMISSIONS ],

    run: async ( client: Client, interaction: CommandInteraction<"cached"> ) => {
        const uiService =
                ServiceLocator.$.get<UIVersioningAdapterService>( "VertixGUI/UIVersioningAdapterService" ),
            uiAdapter = await uiService.get( "VertixBot/WelcomeAdapter", interaction.guild );

        uiAdapter?.ephemeral( interaction );
    }
};
