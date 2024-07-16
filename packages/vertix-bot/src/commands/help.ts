import { ApplicationCommandType } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type UIService from "@vertix.gg/gui/src/ui-service";

import type { Client, CommandInteraction } from "discord.js";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";

const name = "help";

export const Help: ICommand = {
    name,

    description: "Displaying Vertix help interface in ephemeral mode.",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ DEFAULT_SETUP_PERMISSIONS ],

    run: async ( client: Client, interaction: CommandInteraction<"cached"> ) => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ),
            uiAdapter = uiService.get( "VertixBot/UI-General/FeedbackAdapter" );

        uiAdapter?.ephemeral( interaction );
    }
};
