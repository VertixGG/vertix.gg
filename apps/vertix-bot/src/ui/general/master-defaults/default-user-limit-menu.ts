import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const PRESET_LIMITS = [ 2, 3, 4, 5, 6, 8, 10, 15, 20, 25 ];

export class DefaultUserLimitMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/DefaultUserLimitMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "✋ ∙ Select User Limit";
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
                label: "∙ No limit",
                value: "0"
            },
            ...PRESET_LIMITS.map( ( limit ) => ( {
                label: `∙ ${ limit } users`,
                value: String( limit )
            } ) )
        ];
    }
}
