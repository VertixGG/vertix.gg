import { ComponentType, SelectMenuDefaultValueType } from "discord.js";

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
        const result: UIElementSelectMenuLanguageContent = {
            placeholder: await this.getPlaceholder?.()
        };

        const header = await this.getHeader?.();

        if ( header ) {
            result.header = header;
        }

        return result;
    }

    protected async getPlaceholder?(): Promise<string>;

    /**
     * The heading drawn over this menu by a screen that renders as a container, the same way a
     * string select declares one - a row is labelled by whatever is in it, whichever kind it is.
     */
    protected async getHeader?(): Promise<string>;

    /**
     * @default 1
     */
    protected async getMinValues?(): Promise<number | undefined>;

    /**
     * @default 1
     */
    protected async getMaxValues?(): Promise<number | undefined>;

    /**
     * @default false
     */
    protected async isDisabled?(): Promise<boolean>;

    protected async getCustomId?(): Promise<string>;

    /**
     * Function getDefaultValues() :: The ids this menu should open already holding.
     *
     * Discord resolves these itself from the id, so a menu can show what is currently saved
     * without the bot having to fetch and label anything. Capped by `max_values` on the way out,
     * because a stored list longer than the menu allows is one Discord refuses outright.
     */
    protected async getDefaultValues?(): Promise<string[]>;

    protected async getAttributes() {
        const custom_id = ( await this.getCustomId?.() ) || "",
            placeholder = this.content?.placeholder || ( await this.getPlaceholder?.() ),
            min_values = await this.getMinValues?.(),
            max_values = await this.getMaxValues?.(),
            disabled = await this.isDisabled?.(),
            default_values = await this.getDefaultValues?.(),
            result = {
                type: UIElementRoleSelectMenu.getComponentType(),
                custom_id
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

        if ( default_values?.length ) {
            result.default_values = default_values
                .slice( 0, max_values ?? default_values.length )
                .map( ( id ) => ( { id, type: SelectMenuDefaultValueType.Role } ) );
        }

        // Apply guild-specific element overrides
        const override = await this.fetchElementOverride();
        if ( override ) {
            if ( override.placeholder !== undefined && override.placeholder.length > 0 ) {
                result.placeholder = override.placeholder;
            }

            if ( override.disabled !== undefined ) {
                result.disabled = override.disabled;
            }
        }

        return result;
    }

    protected async getSchemaInternal() {
        const schema = await super.getSchemaInternal(),
            header = this.content?.header || ( await this.getHeader?.() );

        if ( header ) {
            schema.header = header;
        }

        return schema;
    }
}
