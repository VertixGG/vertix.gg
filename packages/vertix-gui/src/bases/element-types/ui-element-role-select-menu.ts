import { ComponentType } from "discord.js";

import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type { UIElementSelectMenuLanguageContent } from "@vertix.gg/gui/src/bases/ui-language-definitions";
import type { APIRoleSelectComponent } from "discord.js";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export abstract class UIElementRoleSelectMenu extends UIElementBase<APIRoleSelectComponent> {
    private content: UIElementSelectMenuLanguageContent | undefined;

    public static getName() {
        return "VertixGUI/UIElementRolesSelectMenu";
    }

    public static getComponentType(): ComponentType {
        return ComponentType.RoleSelect;
    }

    public async build( uiArgs?: UIArgs ) {
        this.content = await this.uiLanguageManager.getSelectMenuTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIElementSelectMenuLanguageContent> {
        return {
            placeholder: await this.getPlaceholder?.(),
        };
    }

    protected async getPlaceholder?(): Promise<string>;

    /**
     * @default 1
     */
    protected async getMinValues?(): Promise<number|undefined>;

    /**
     * @default 1
     */
    protected async getMaxValues?(): Promise<number|undefined>;

    /**
     * @default false
     */
    protected async isDisabled?(): Promise<boolean>;

    protected async getCustomId?(): Promise<string>;

    protected async getAttributes() {
        const custom_id = await this.getCustomId?.() || "",
            placeholder = this.content?.placeholder || await this.getPlaceholder?.(),
            min_values = await this.getMinValues?.(),
            max_values = await this.getMaxValues?.(),
            disabled = await this.isDisabled?.(),
            result = {
                type: UIElementRoleSelectMenu.getComponentType(),
                custom_id,
            } as APIRoleSelectComponent;

        if ( placeholder ) {
            result.placeholder = placeholder;
        }

        if ( 0 === min_values || min_values ) {
            result.min_values = min_values;
        }

        if ( max_values ) {
            result.max_values = max_values;
        }

        if ( disabled ) {
            result.disabled = disabled;
        }

        return result;
    }

}