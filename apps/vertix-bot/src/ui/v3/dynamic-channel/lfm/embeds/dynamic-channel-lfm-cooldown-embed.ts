import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    retryMinutes: uiUtilsWrapAsTemplate( "retryMinutes" )
};

const DynamicChannelLfmCooldownEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelLfmCooldownEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle( () => "🔎  Not just yet" )
    // Not "your channel posted recently" - the cooldown belongs to the generator these channels
    // are made from, so the member reading this may well never have posted anything.
    .setDescription( () =>
        "This server limits how often these channels advertise, and the last post went up " +
        `recently. The next one can go up in about ${ vars.retryMinutes } minutes.`
    )
    .setLogic( ( args: UIArgs ) => ( {
        retryMinutes: args.retryMinutes
    } ) )
    .setDefaultVars( () => ( {
        retryMinutes: "10"
    } ) )
    .build();

export { DynamicChannelLfmCooldownEmbed };
