import { UITemplateBase } from "@vertix/ui-v2/_base/ui-template-base";

import {
    UIArgs, UIBaseTemplateOptions,
    UIEmbedArrayOptions,
    UIEmbedLanguageContent,
    UIType
} from "@vertix/ui-v2/_base/ui-definitions";

import { UILanguageManager } from "@vertix/ui-v2/ui-language-manager";

export abstract class UIEmbedBase extends UITemplateBase {
    private content: UIEmbedLanguageContent | undefined;

    public static getName() {
        return "Vertix/UI-V2/UIEmbedBase";
    }

    public static getType(): UIType {
        return "embed";
    }

    public async build( uiArgs?: UIArgs ) {
        this.content = await UILanguageManager.$.getEmbedTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    /**
     * Function getTranslatableContent() :: Used to get the translatable content.
     *
     * Note: The method called on start-up process, the args are not available during this time.
     */
    public async getTranslatableContent(): Promise<UIEmbedLanguageContent> {
        return {
            title: this.getTitle(),
            description: this.getDescription(),
            options: {
                ... this.getInternalOptions(),
                ... this.getOptions()
            },
            arrayOptions: this.getArrayOptions(),
        };
    }

    protected async getAttributes() {
        const attributes: Record<string, any> = {},
            color = this.getColor(),
            image = this.getImage(),
            thumbnail = this.getThumbnail(),
            content = this.content;

        if ( color !== -1 ) {
            attributes.color = color;
        }

        if ( content?.title?.length ) {
            attributes.title = content?.title;
        }

        if ( content?.description?.length ) {
            attributes.description = content.description;
        }

        if ( thumbnail.length ) {
            attributes.thumbnail = thumbnail;
        }

        if ( image.length ) {
            attributes.image = {
                url: image,
            };
        }

        const data = this.parseLogicInternal( {
                ... this.getInternalLogic( this.uiArgs ),
                ... this.getLogic( this.uiArgs ),
                ... await this.getLogicAsync( this.uiArgs ),
            },
            content?.options || {},
            content?.arrayOptions || {},
        );

        return this.composeTemplate(
            attributes,
            data,
            content?.options || {},
        );
    }

    protected getColor(): number {
        return -1;
    }

    protected getTitle(): string {
        return "";
    }

    protected getDescription(): string {
        return "";
    }

    protected getThumbnail(): string {
        return "";
    }

    protected getImage(): string {
        return "";
    }

    protected getOptions(): UIBaseTemplateOptions {
        return {};
    }

    protected getArrayOptions(): UIEmbedArrayOptions {
        return {};
    }

    protected getLogic( args?: UIArgs ): { [ key: string ]: any } {
        return {};
    }

    protected async getLogicAsync( args?: UIArgs ): Promise<{ [ key: string ]: any }> {
        return Promise.resolve( {} );
    }

    /**
     * Function getInternalOptions() :: Used to extend the selectOptions object.
     */
    protected getInternalOptions(): UIBaseTemplateOptions {
        return {};
    }

    /**
     * Function getInternalLogic() :: Used to extend the logic object.
     */
    protected getInternalLogic( args?: UIArgs ) {
        return {};
    }
}
