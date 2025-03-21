import { ComponentType, TextInputStyle } from "discord.js";

import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type { UIArgs, UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { APITextInputComponent } from "discord.js";
import type { UIElementTextInputLanguageContent } from "@vertix.gg/gui/src/bases/ui-language-definitions";

export abstract class UIElementInputBase extends UIElementBase<APITextInputComponent> {
    protected content: UIElementTextInputLanguageContent | undefined;

    public static getName() {
        return "VertixGUI/UIElementInputBase";
    }

    public static getComponentType(): ComponentType {
        return ComponentType.TextInput;
    }

    public async build( uiArgs?: UIArgs ) {
        this.content = await this.uiService
            .getUILanguageManager()
            .getTextInputTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIElementTextInputLanguageContent> {
        const result: UIElementTextInputLanguageContent = {
                label: await this.getLabel()
            },
            placeholder = await this.getPlaceholder?.();

        if ( placeholder ) {
            result.placeholder = placeholder;
        }

        return result;
    }

    protected abstract getStyle(): Promise<UIInputStyleTypes>;

    protected abstract getLabel(): Promise<string>;

    protected async getPlaceholder?(): Promise<string>;

    protected async getValue?(): Promise<string>;

    protected async getMinLength?(): Promise<number | undefined>;

    protected async getMaxLength?(): Promise<number | undefined>;

    protected async isRequired?(): Promise<boolean>;

    protected async getCustomId?(): Promise<string>;

    protected async getAttributes() {
        const type = Number( UIElementInputBase.getComponentType() ),
            custom_id = ( await this.getCustomId?.() ) || "",
            label = this.content?.label || ( await this.getLabel() ),
            placeholder = this.content?.placeholder || ( await this.getPlaceholder?.() ),
            value = await this.getValue?.(),
            min_length = ( await this.getMinLength?.() ) || 0,
            max_length = await this.getMaxLength?.(),
            required = ( await this.isRequired?.() ) || false;

        let style: TextInputStyle;

        switch ( await this.getStyle() ) {
            case "short":
                style = TextInputStyle.Short;
                break;

            case "long":
                style = TextInputStyle.Paragraph;
                break;
        }

        const result = {
            type,
            custom_id,
            style,
            label
        } as APITextInputComponent;

        if ( placeholder ) {
            result.placeholder = placeholder;
        }

        if ( value ) {
            result.value = value;
        }

        result.min_length = min_length;

        result.max_length = max_length || 100; // TODO: Move to constant.

        result.required = required;

        return result;
    }
}
