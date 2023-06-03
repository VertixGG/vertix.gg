import { APISelectMenuOption, APIStringSelectComponent, ComponentType } from "discord.js";

import { UIElementBase } from "@vertix/ui-v2/_base/ui-element-base";
import { UIArgs, UIBaseTemplateOptions, UIElementSelectMenuLanguageContent } from "@vertix/ui-v2/_base/ui-definitions";
import { UILanguageManager } from "@vertix/ui-v2/ui-language-manager";

export abstract class UIElementStringSelectMenu extends UIElementBase<APIStringSelectComponent> {
    private content: UIElementSelectMenuLanguageContent | undefined;

    public static getName() {
        return "Vertix/UI-V2/UIElementStringSelectMenu";
    }

    public async build( uiArgs?: UIArgs ) {
        this.content = await UILanguageManager.$.getSelectMenuTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIElementSelectMenuLanguageContent> {
        return {
            placeholder: await this.getPlaceholder?.(),
            selectOptions: await this.getSelectOptions(),
        };
    }

    protected abstract getSelectOptions(): Promise<APISelectMenuOption[]>;

    protected async getPlaceholder?(): Promise<string>;

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

    protected async getAttributes() {
        const custom_id = await this.getCustomId?.() || "",
            placeholder = this.content?.placeholder || await this.getPlaceholder?.(),
            min_values = await this.getMinValues?.(),
            max_values = await this.getMaxValues?.(),
            disabled = await this.isDisabled?.(),
            options = await this.getOptionsInternal() || [],
            result = {
                type: ComponentType.StringSelect,
                custom_id,
                options,
            } as APIStringSelectComponent;

        if ( placeholder ) {
            result.placeholder = placeholder;
        }

        if ( min_values ) {
            result.min_values = min_values;
        }

        if ( max_values ) {
            result.max_values = max_values;
        }

        if ( disabled ) {
            result.disabled = disabled;
        }

        result.options = options;

        return result;
    }

    protected getOptions(): UIBaseTemplateOptions {
        return {};
    }

    protected async getLogic(): Promise<{ [ key: string ]: any }> {
        return {};
    }

    private async getOptionsInternal() {
        const options = this.getOptions(),
            logic = await this.getLogic(),
            hardCodedSelectOptions = await this.getSelectOptions(),
            translatedSelectOptions = (this.content?.selectOptions || [] ) as APISelectMenuOption[];

        // If using translation then, default values not taken in account.
        if ( hardCodedSelectOptions.length && translatedSelectOptions.length ) {
            hardCodedSelectOptions.forEach( ( option, index ) => {
                if ( ! translatedSelectOptions[ index ] ) {
                    return;
                }
                translatedSelectOptions[ index ].default = option.default;
            } );
        }

        const selectOptions= translatedSelectOptions.length ? translatedSelectOptions : hardCodedSelectOptions;

        if ( Object.keys( options ).length === 0 && Object.keys( logic ).length === 0 ) {
            return selectOptions;
        }

        const result = this.composeTemplate(
            { selectOptions },
            await this.getLogic(),
            options,
        );

        return result.selectOptions;
    }
}
