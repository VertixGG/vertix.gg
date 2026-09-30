import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes, UI_IMAGE_BLUE_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const vars = {
    eventName: uiUtilsWrapAsTemplate( "eventName" ),
    startsAt: uiUtilsWrapAsTemplate( "startsAt" ),
    voiceChannelId: uiUtilsWrapAsTemplate( "voiceChannelId" ),
    stillNeeded: uiUtilsWrapAsTemplate( "stillNeeded" ),

    stateTitle: uiUtilsWrapAsTemplate( "stateTitle" ),
    stateLine: uiUtilsWrapAsTemplate( "stateLine" ),
    stateOpen: uiUtilsWrapAsTemplate( "stateOpen" ),
    stateFilled: uiUtilsWrapAsTemplate( "stateFilled" )
};

/**
 * The post asking somebody to take the place of whoever did not come.
 *
 * It says how many places are open and counts down as people arrive, then says they are filled -
 * it stays up until the event ends rather than vanishing the moment the last place goes, so nobody
 * who clicks it a second too late finds nothing there.
 */
const EventNeedSubEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-General/EventNeedSubEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_BLUE_LINE_URL )
    .setTitle( () => `${ vars.stateTitle }` )
    .setDescription( () => `${ vars.stateLine }` )
    .setOptions( () => ( {
        stateTitle: {
            [ vars.stateOpen ]: `🙋  ${ vars.eventName } needs ${ vars.stillNeeded } more`,
            [ vars.stateFilled ]: `✅  ${ vars.eventName } is full again`
        },
        stateLine: {
            [ vars.stateOpen ]:
                `It started <t:${ vars.startsAt }:R> and some who said they would come did not.\n` +
                `Join <#${ vars.voiceChannelId }> to take a place.`,
            [ vars.stateFilled ]:
                "Every place is taken - thanks to everybody who jumped in."
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const stillNeeded = Number( args.stillNeeded ?? 0 ),
            state = stillNeeded > 0 ? vars.stateOpen : vars.stateFilled;

        const result: Record<string, JsonValue> = {
            eventName: args.eventName,
            startsAt: args.startsAt,
            voiceChannelId: args.voiceChannelId,
            stillNeeded,
            stateTitle: state,
            stateLine: state
        };

        return result;
    } )
    .setDefaultVars( () => ( {
        eventName: "Raid Night",
        startsAt: 1791057600,
        voiceChannelId: "123456789",
        stillNeeded: 2
    } ) )
    .build();

export { EventNeedSubEmbed };
