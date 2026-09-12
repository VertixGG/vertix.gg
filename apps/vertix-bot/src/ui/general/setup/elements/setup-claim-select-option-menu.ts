import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { SETUP_CLAIM_OPTIONS } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-claim-modals";

export class SetupClaimSelectOptionMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/SetupClaimSelectOptionMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "◎ ∙ Select Value To Edit";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions() {
        return [
            {
                label: "∙ Owner Away Before Claimable",
                value: SETUP_CLAIM_OPTIONS[ 0 ].value,
                emoji: { name: "🚪" }
            },
            {
                label: "∙ Claim Check Interval",
                value: SETUP_CLAIM_OPTIONS[ 1 ].value,
                emoji: { name: "🔁" }
            },
            {
                label: "∙ Vote Duration",
                value: SETUP_CLAIM_OPTIONS[ 2 ].value,
                emoji: { name: "🗳️" }
            },
            {
                label: "∙ Vote Time Per Candidate",
                value: SETUP_CLAIM_OPTIONS[ 3 ].value,
                emoji: { name: "➕" }
            }
        ];
    }
}
