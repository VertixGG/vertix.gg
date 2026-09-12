import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

import {
    ServerOptionsEditSelectMenu
} from "@vertix.gg/bot/src/ui/general/server-options/server-options-edit-select-menu";

const ServerOptionsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/ServerOptionsElementsGroup" )
    .addRow( [ ServerOptionsEditSelectMenu ] )
    .addRow( [ DoneButton ] )
    .build();

export { ServerOptionsElementsGroup };
