import { ButtonStyle, ComponentType, parseEmoji } from "discord.js";

import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type { APIButtonComponentWithCustomId, APIMessageComponentEmoji } from "discord.js";

import type { UIArgs, UIBaseTemplateOptions, UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementButtonLanguageContent } from "@vertix.gg/gui/src/bases/ui-language-definitions";

export abstract class UIElementButtonBase extends UIElementBase<APIButtonComponentWithCustomId> {
    private content: UIElementButtonLanguageContent | undefined;

    public static getName() {
        return "VertixGUI/UIElementButtonBase";
    }

    public static getComponentType(): ComponentType {
        return ComponentType.Button;
    }

    public async build( uiArgs?: UIArgs ) {
        this.content = await this.uiLanguageManager.getButtonTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIElementButtonLanguageContent> {
        const result: UIElementButtonLanguageContent = {
            label: await this.getLabel()
        },
            options = this.getOptions();

        if ( Object.keys( options ).length ) {
            result.options = options;
        }

        return result;
    }

    protected abstract getLabel(): Promise<string>;

    protected abstract getStyle(): Promise<UIButtonStyleTypes>;

    protected async getEmoji?(): Promise<string>;

    protected async isDisabled?(): Promise<boolean>;

    protected getCustomId?(): Promise<string>;

    /**
     * Function isLabelOmitted() :: If true there will be no label in the button.
     */
    protected async isLabelOmitted(): Promise<boolean> {
        return false;
    }

    protected async getAttributes() {
        let style: ButtonStyle;

        switch ( await this.getStyle() ) {
            case "primary":
                style = ButtonStyle.Primary;
                break;
            case "secondary":
                style = ButtonStyle.Secondary;
                break;
            case "success":
                style = ButtonStyle.Success;
                break;
            case "danger":
                style = ButtonStyle.Danger;
                break;

            default:
                throw new Error( "Invalid style" );
        }

        const type = Number( UIElementButtonBase.getComponentType() ),
            label = await this.getLabelInternal(),
            emoji = await this.getEmoji?.(),
            disabled = await this.isDisabled?.(),
            custom_id = ( await this.getCustomId?.() ) || "";

        const result = {
            type,
            style,
            custom_id
        } as APIButtonComponentWithCustomId;

        if ( label ) {
            result.label = label;
        }

        if ( emoji ) {
            result.emoji = parseEmoji( emoji ) as APIMessageComponentEmoji;
        }

        if ( disabled ) {
            result.disabled = disabled;
        }

        return result;
    }

    protected getOptions(): UIBaseTemplateOptions {
        return {};
    }

    protected async getLogic(): Promise<{ [key: string]: any }> {
        return {};
    }

    private async getLabelInternal() {
        if ( await this.isLabelOmitted() ) {
            return null;
        }

        const options = this.content?.options || this.getOptions(),
            logic = await this.getLogic(),
            label = ( await this.content?.label ) || ( await this.getLabel() );

        if ( Object.keys( options ).length === 0 && Object.keys( logic ).length === 0 ) {
            return label;
        }

        const result = this.composeTemplate( { label }, await this.getLogic(), options );

        return result.label;
    }
}
