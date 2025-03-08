// TODO: Fix imports order.
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { ClaimVoteStepInButton } from "@vertix.gg/bot/src/ui/v2/claim/vote/claim-vote-step-in-button";
import { ClaimVoteAddButton } from "@vertix.gg/bot/src/ui/v2/claim/vote/claim-vote-add-button";

import type { UIArgs, UIEntitySchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

const MAX_BUTTONS_PER_ROW = 3;

export class ClaimVoteElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/ClaimVoteElementsGroup";
    }

    public static getItems(args?: UIArgs) {
        const result: (typeof UIElementButtonBase)[][] = [];

        // TODO: Find better solution.
        if (args) {
            const buttons = Object.entries(args.candidateDisplayNames || {}).map(([userId, displayName]) => {
                return class extends ClaimVoteAddButton {
                    public static getName() {
                        return `${super.getName()}:${userId}`; // TODO: Use constant for separator.
                    }

                    public async build(uiArgs?: UIArgs): Promise<UIEntitySchemaBase> {
                        uiArgs = Object.assign({}, uiArgs);

                        uiArgs.displayName = displayName;

                        return super.build(uiArgs);
                    }
                };
            });

            // 3 buttons per row.
            for (let i = 0; i < buttons.length; i += MAX_BUTTONS_PER_ROW) {
                result.push(buttons.slice(i, i + MAX_BUTTONS_PER_ROW));
            }
        }

        // TODO: Find better solution.
        // So it passthroughs validation.
        if (result.length === 0) {
            result.push([ClaimVoteAddButton]);
        }

        return [...result, [ClaimVoteStepInButton]];
    }
}
