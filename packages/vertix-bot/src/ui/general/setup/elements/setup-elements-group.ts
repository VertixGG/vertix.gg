import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { SetupMasterCreateSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-select-menu";

import { BadwordsEditButton } from "@vertix.gg/bot/src/ui/general/badwords/badwords-edit-button";


import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { LanguageChooseButton } from "@vertix.gg/bot/src/ui/general/language/language-choose-button";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

export class SetupElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-General/SetupElementsGroup";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static getItems( args?: ISetupArgs ) {
        return [
            [ SetupMasterEditSelectMenu ],
            [ SetupMasterCreateSelectMenu ],
            [ LanguageChooseButton, BadwordsEditButton ]
        ];
    }
}
