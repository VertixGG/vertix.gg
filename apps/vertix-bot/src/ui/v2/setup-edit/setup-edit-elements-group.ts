import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";
import { DeleteButton } from "@vertix.gg/bot/src/ui/general/decision/delete-button";

import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/general/config-extras/config-extras-select-menu";

import { SetupEditSelectEditOptionMenu } from "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-select-edit-option-menu";

import { LogChannelSelectMenu } from "@vertix.gg/bot/src/ui/v2/logs-channel/log-channel-select-menu";

const SetupEditElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditElementsGroup" )
    .addRow( [ SetupEditSelectEditOptionMenu ] )
    .addRow( [ ConfigExtrasSelectMenu ] )
    .addRow( [ LogChannelSelectMenu ] )
    .addRow( [ DoneButton, DeleteButton ] )
    .build();

export { SetupEditElementsGroup };
