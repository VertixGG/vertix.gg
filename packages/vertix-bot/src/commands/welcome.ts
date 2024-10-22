import {
    ApplicationCommandType
} from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type { Client, CommandInteraction } from "discord.js";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";
import type { UIAdapterService } from "@vertix.gg/bot/src/ui-v2/ui-adapter-service";

const name = "welcome";

export const Welcome: ICommand = {
    name,

    description: "Displaying Vertix welcome message in ephemeral mode.",
    type: ApplicationCommandType.ChatInput,

    defaultMemberPermissions: [ DEFAULT_SETUP_PERMISSIONS ],

    run: async ( client: Client, interaction: CommandInteraction<"cached"> ) => {
        const uiAdapter = ServiceLocator.$.get<UIAdapterService>( "VertixBot/UI-V2/UIAdapterService" );

        uiAdapter.get( "VertixBot/UI-V2/WelcomeAdapter" )?.ephemeral( interaction );
    }
};
