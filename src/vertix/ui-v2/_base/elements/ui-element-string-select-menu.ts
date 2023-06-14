import { APISelectMenuOption, APIStringSelectComponent, ComponentType } from "discord.js";

import { UIElementBase } from "@vertix/ui-v2/_base/ui-element-base";
import { UIArgs, UIBaseTemplateOptions } from "@vertix/ui-v2/_base/ui-definitions";
import { UILanguageManager } from "@vertix/ui-v2/ui-language-manager";
import { UIElementSelectMenuLanguageContent } from "@vertix/ui-v2/_base/ui-language-definitions";

export abstract class UIElementStringSelectMenu extends UIElementBase<APIStringSelectComponent> {
    private content: UIElementSelectMenuLanguageContent | undefined;

    public static getName() {
        return "Vertix/UI-V2/UIElementStringSelectMenu";
    }

    public static getComponentType() {
        return ComponentType.StringSelect;
    }

    public async build( uiArgs?: UIArgs ) {
        // TODO: Find better way to do this.
        this.uiArgs = uiArgs;

        this.content = await UILanguageManager.$.getSelectMenuTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIElementSelectMenuLanguageContent> {
        const translateAbleSelectEntries = await Promise.all( (
            await this.getSelectOptions() ).map( async ( option ) => {
                return {
                    label:option.label,
                };
            } )
        );

        const result: UIElementSelectMenuLanguageContent = {},
            placeholder = await this.getPlaceholder?.(),
            selectOptions = await this.getSelectOptions(),
            options = this.getOptions();

        if ( placeholder ) {
            result.placeholder = placeholder;
        }

        if ( selectOptions.length ) {
            result.selectOptions = translateAbleSelectEntries;
        }

        if ( Object.keys( options ).length ) {
            result.options = options;
        }

        return result;
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
                type: UIElementStringSelectMenu.getComponentType(),
                custom_id,
                options,
            } as APIStringSelectComponent;

        if ( placeholder ) {
            result.placeholder = placeholder;
        }

        if ( min_values || 0 === min_values ) {
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

    protected getDataFor( option: APISelectMenuOption ): { [ key: string ]: any } {
        return {};
    }

    private async getOptionsInternal() {
        const options = this.content?.options || this.getOptions(),
            hardCodedSelectOptions = await this.getSelectOptions(),
            translatedSelectOptions = ( this.content?.selectOptions || [] ) as APISelectMenuOption[];

        let mergedOptions: APISelectMenuOption[] = [];

        // If using translation then, merge the hard coded options with the translated options.
        if ( hardCodedSelectOptions.length && translatedSelectOptions.length ) {
            mergedOptions = hardCodedSelectOptions.map( ( option, index ) => {
                const translatedOption = translatedSelectOptions[ index ];

                if ( translatedOption ) {
                    option.label = translatedOption.label;
                }

                return option;
            } );
        }

        const selectOptions = mergedOptions.length ? mergedOptions : hardCodedSelectOptions;

        if ( Object.keys( options ).length === 0 ) {
            return selectOptions;
        }

        return selectOptions.map( ( option ) => {
            const result = this.composeTemplate(
                { label: option.label },
                this.getDataFor( option ),
                options,
            );

            option.label = result.label;

            return option;
        } );
    }
}
