import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { VoiceRoleMenu } from "@vertix.gg/bot/src/ui/general/server-options/voice-role-menu";
import { VoiceRoleClearButton } from "@vertix.gg/bot/src/ui/general/server-options/voice-role-clear-button";
import { ServerOptionsBackButton } from "@vertix.gg/bot/src/ui/general/server-options/server-options-back-button";

const VoiceRoleElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/VoiceRoleElementsGroup" )
    .addRow( [ VoiceRoleMenu ] )
    .addRow( [ VoiceRoleClearButton, ServerOptionsBackButton ] )
    .build();

export { VoiceRoleElementsGroup };
