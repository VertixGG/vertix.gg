import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v2/channel-buttons-template/channel-buttons-template-select-menu";

const SetupEditButtonsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditButtonsElementsGroup" )
    .addRow( [ ChannelButtonsTemplateSelectMenu ] )
    .addRow( [ DoneButton ] )
    .build();

export { SetupEditButtonsElementsGroup };
