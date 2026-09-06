import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

import { BadwordsEditButton } from "@vertix.gg/bot/src/ui/general/badwords/badwords-edit-button";
import { VoiceRoleMenu } from "@vertix.gg/bot/src/ui/general/server-options/voice-role-menu";

const ServerOptionsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/ServerOptionsElementsGroup" )
    .addRow( [ VoiceRoleMenu ] )
    .addRow( [ BadwordsEditButton, DoneButton ] )
    .build();

export { ServerOptionsElementsGroup };
