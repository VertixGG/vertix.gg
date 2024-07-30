import { ApplicationCommandType } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type UIAdapterVersioningService from "@vertix.gg/gui/src/ui-adapter-versioning-service";

import type { Client, CommandInteraction } from "discord.js";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";

const name = "setup";

export const Setup: ICommand = {
    name,

    description: "Displaying Vertix setup wizard in ephemeral mode.",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ DEFAULT_SETUP_PERMISSIONS ],

    run: async ( client: Client, interaction: CommandInteraction<"cached"> ) => {
        const uiService =
            ServiceLocator.$.get<UIAdapterVersioningService>( "VertixGUI/UIVersioningAdapterService" ),
            uiAdapter = await uiService.get( "Vertix/SetupAdapter", interaction.guild );

        uiAdapter?.ephemeral( interaction );
    }
};
