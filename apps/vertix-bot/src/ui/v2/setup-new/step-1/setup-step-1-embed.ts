import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const SETUP_STEP_1_VARS = {
    dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" )
};

const setupConfig = ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V3 );

const SetupStep1Embed = new EmbedBuilder<UIArgs, typeof SETUP_STEP_1_VARS>(
    "VertixBot/UI-V2/SetupStep1Embed",
    SETUP_STEP_1_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( "Step 1 - Set Dynamic Channels Template Name" )
    .setDescription( () => (
        "You can specify a default name for dynamic channels that will be used when they are opened.\n\n" +
        "_Current template name_:\n" +
        `\`${ SETUP_STEP_1_VARS.dynamicChannelNameTemplate }\`\n\n` +
        "You can keep the default settings by pressing **( `Next ▶` )** button.\n\n" +
        "Not sure how it works? Check out the [explanation](https://voicechannels.xyz/setup/1)."
    ) )
    .setLogic( ( args: UIArgs ) => {
        const template = typeof args.dynamicChannelNameTemplate === "string" && args.dynamicChannelNameTemplate.length
            ? args.dynamicChannelNameTemplate
            : setupConfig.data.settings.dynamicChannelNameTemplate;

        return {
            dynamicChannelNameTemplate: template
        };
    } )
    .build();

export { SetupStep1Embed };
