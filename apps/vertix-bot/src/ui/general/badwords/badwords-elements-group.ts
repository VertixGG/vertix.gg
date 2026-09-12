import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { BadwordsEditButton } from "@vertix.gg/bot/src/ui/general/badwords/badwords-edit-button";
import { BadwordsClearButton } from "@vertix.gg/bot/src/ui/general/badwords/badwords-clear-button";
import { ServerOptionsBackButton } from "@vertix.gg/bot/src/ui/general/server-options/server-options-back-button";

const BadwordsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/BadwordsElementsGroup" )
    .addRow( [ BadwordsEditButton, BadwordsClearButton, ServerOptionsBackButton ] )
    .build();

export { BadwordsElementsGroup };
