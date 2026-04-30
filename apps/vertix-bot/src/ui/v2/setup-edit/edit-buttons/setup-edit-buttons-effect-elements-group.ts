import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { SetupEditButtonsEffectImmediatelyButton } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-effect-immediately-button";
import { SetupEditButtonsEffectNewlyButton } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-effect-newly-button";

import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v2/channel-buttons-template/channel-buttons-template-select-menu";

const SetupEditButtonsEffectElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditButtonsEffectElementsGroup" )
    .addRow( [ ChannelButtonsTemplateSelectMenu ] )
    .addRow( [ SetupEditButtonsEffectImmediatelyButton, SetupEditButtonsEffectNewlyButton ] )
    .build();

export { SetupEditButtonsEffectElementsGroup };
