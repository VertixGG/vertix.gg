import { createDebugger } from "@vertix.gg/base/src/modules/debugger";

import { UITemplateBase } from "@vertix.gg/gui/src/bases/ui-template-base";

import type {
    UIArgs,
    UIBaseTemplateOptions,
    UIEmbedArrayOptions,
    UIType
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIEmbedLanguageContent } from "@vertix.gg/gui/src/bases/ui-language-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

import type { APIEmbedField, APIEmbedImage, APIEmbedThumbnail } from "discord.js";

export abstract class UIEmbedBase extends UITemplateBase {
    private static $debugger = createDebugger( "UIEmbedBase", "UI" );

    private content: UIEmbedLanguageContent | undefined;

    public static getName() {
        return "VertixGUI/UIEmbedBase";
    }

    public static getType(): UIType {
        return "embed";
    }

    public async build( uiArgs?: UIArgs ) {
        this.content = await this.uiService.getUILanguageManager().getEmbedTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    /**
     * Function `getTranslatableContent()` - Used to get the translatable content.
     *
     * Note: The method called on a start-up process, the args are not available during this time.
     */
    public async getTranslatableContent(): Promise<UIEmbedLanguageContent> {
        const assumed = {
                title: this.getTitle(),
                description: this.getDescription(),
                footer: this.getFooter(),
                options: {
                    ...this.getInternalOptions(),
                    ...this.getOptions()
                },
                arrayOptions: this.getArrayOptions()
            },
            result: UIEmbedLanguageContent = {};

        if ( assumed.title.length ) {
            result.title = assumed.title;
        }

        if ( assumed.description.length ) {
            result.description = assumed.description;
        }

        if ( assumed.footer.length ) {
            result.footer = assumed.footer;
        }

        if ( Object.keys( assumed.options ).length ) {
            result.options = assumed.options;
        }

        if ( Object.keys( assumed.arrayOptions ).length ) {
            result.arrayOptions = assumed.arrayOptions;
        }

        return result;
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

        if ( content?.footer?.length ) {
            attributes.footer = content.footer;
        }

        if ( thumbnail ) {
            attributes.thumbnail = thumbnail;
        }

        if ( image.length ) {
            attributes.image = {
                ...this.getImageData(),
                url: image
            };
        }

        const template = await this.generateTemplate( content, attributes );

        // Apply guild-specific customizations if available
        const customization = await this.fetchCustomization();

        if ( customization?.embedOverrides ) {
            const overrides = customization.embedOverrides;

            if ( overrides.color !== undefined ) {
                template.color = overrides.color;
            }

            if ( overrides.title !== undefined && overrides.title.length > 0 ) {
                template.title = overrides.title;
            }

            if ( overrides.description !== undefined && overrides.description.length > 0 ) {
                template.description = overrides.description;
            }
        }

        if ( template.footer?.length ) {
            template.footer = {
                text: template.footer
            };
        }

        return template;
    }

    /**
     * Fetches guild-specific customization for this embed.
     * Uses _guildId and _customizationKey from uiArgs.
     */
    private async fetchCustomization() {
        const guildId = this.uiArgs?._guildId as string | undefined;
        const customizationKey = this.uiArgs?._customizationKey as string | undefined;
        const languageCode = this.uiArgs?._language as string | undefined;

        UIEmbedBase.$debugger.log( this.fetchCustomization, "Fetching customization", { guildId, customizationKey, languageCode } );

        if ( !guildId || !customizationKey ) {
            UIEmbedBase.$debugger.log( this.fetchCustomization, "Missing guildId or customizationKey, skipping" );
            return null;
        }

        try {
            const provider = this.uiService.getCustomizationProvider();
            const result = await provider.getComponentCustomization( guildId, customizationKey, languageCode );

            UIEmbedBase.$debugger.log( this.fetchCustomization, "Customization result", { hasResult: !!result, result } );

            return result;
        } catch( error ) {
            UIEmbedBase.$debugger.log( this.fetchCustomization, "Failed to fetch customization", { error } );
            // Silently fail - customization is optional
            return null;
        }
    }

    protected getColor() {
        return -1;
    }

    protected getTitle(): string {
        return "";
    }

    protected getDescription(): string {
        return "";
    }

    protected getFields(): APIEmbedField[] {
        return [];
    }

    protected getFooter(): string {
        return "";
    }

    protected getThumbnail(): APIEmbedThumbnail | null {
        return null;
    }

    protected getImage(): string {
        return "";
    }

    protected getImageData(): Omit<APIEmbedImage, "url"> {
        return {};
    }

    protected getOptions(): UIBaseTemplateOptions {
        return {};
    }

    protected getArrayOptions(): UIEmbedArrayOptions {
        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getLogic( args?: UIArgs ): { [key: string]: any } {
        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async getLogicAsync( args?: UIArgs ): Promise<{ [key: string]: any }> {
        return Promise.resolve( {} );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getDefaultVars( args?: UIArgs ): Record<string, JsonValue> {
        return {};
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getInternalLogic( args?: UIArgs ) {
        return {};
    }

    protected async parseInternalData( content: undefined | UIEmbedLanguageContent ) {
        return this.parseLogicInternal(
            {
                ...this.getDefaultVars( this.uiArgs ),
                ...this.getInternalLogic( this.uiArgs ),
                ...this.getLogic( this.uiArgs ),
                ...( await this.getLogicAsync( this.uiArgs ) )
            },
            content?.options || {},
            content?.arrayOptions || {}
        );
    }

    private async generateTemplate( content: undefined | UIEmbedLanguageContent, attributes: Record<string, any> ) {
        const data = await this.parseInternalData( content );

        return this.composeTemplate( attributes, data, content?.options || {} );
    }
}
