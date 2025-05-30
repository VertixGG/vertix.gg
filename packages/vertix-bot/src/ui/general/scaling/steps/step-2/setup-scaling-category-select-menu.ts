import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { APISelectMenuOption } from "discord.js";

export class SetupScalingCategorySelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingCategorySelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        // If a category is already selected, show it in the placeholder
        if ( this.uiArgs?.selectedCategoryName ) {
            return `📁 Selected: ${ this.uiArgs.selectedCategoryName }`;
        }

        return "📁 Select Category or Create New";
    }

    protected async getMinValues() {
        return 1;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        const options: APISelectMenuOption[] = [
            {
                label: "➕ Create New Category",
                value: "create-new-category",
                emoji: "➕" as any,
                description: "Create a new category for auto-scaling channels"
            }
        ];

        // Add existing categories from the guild if they exist in args
        const existingCategories = this.uiArgs?.guildCategories || [];

        for ( const category of existingCategories ) {
            options.push( {
                label: category.name,
                value: category.id,
                emoji: "📁" as any,
                description: `Use existing category: ${ category.name }`,
                default: category.id === this.uiArgs?.selectedCategoryId
            } );
        }

        return options;
    }
}
