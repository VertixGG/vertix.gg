import { EmbedBuilder } from "discord.js";

import { UIBaseInteractionTypes, DYNAMICO_UI_EMBED, E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import UIEmbedTemplate from "@dynamico/ui/_base/ui-embed-template";

import UIGroupBase from "@dynamico/ui/_base/ui-group-base";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { ForceMethodImplementation } from "@internal/errors";

import Logger from "@internal/modules/logger";

export class UIEmbed extends UIGroupBase {
    protected static logger: Logger = new Logger( this );

    public static getName() {
        return DYNAMICO_UI_EMBED;
    }

    // TODO: Create static embeds, support `this.getType` to achieve this.
    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public async getMessage( interaction: UIBaseInteractionTypes, args?: any ) {
       const embed = await this.buildEmbed( interaction, args );

        return {
            embeds: [ embed ],
            components: [],
            content: ""
        };
    }

    public async buildEmbed( interaction?: UIBaseInteractionTypes | null, args?: any ): Promise<EmbedBuilder> {
        const name = this.getName() + "-embed",
            title = this.getTitle(),
            description = this.getDescription(),
            color = this.getColor(),
            fields = [ ... this.getLogicFields(), ... this.getArgsFields() ],
            options = this.getFieldOptions(),
            logic = await this.getFieldsLogic( interaction, args ),
            fieldsObject = fields.reduce( ( acc, field ) => {
                const wrappedField = uiUtilsWrapAsTemplate( field );

                acc[ wrappedField ] = wrappedField;
                return acc;
            }, {} as any );

        const uiTemplate = new class extends UIEmbedTemplate {
            public static getName() {
                return name;
            }

            protected getTemplateOptions(): any {
                return options;
            }

            protected getTemplateInputs(): any {
                const result: any = { ... fieldsObject };

                result.type = "embed";
                result.title = title;
                result.description = description;
                result.color = color;

                return result;
            }

            protected getTemplateLogic( interaction?: UIBaseInteractionTypes, args?: any ): any {
                let result: any = {};

                fields.forEach( field => {
                    if ( undefined !== typeof args[ field ] ) {
                        if ( undefined !== logic[ field ] ) {
                            return result[ field ] = logic[ field ];
                        }

                        result[ field ] = args[ field ];
                    }
                } );

                return result;
            }
        };

        const result = await uiTemplate.build( interaction, args ),
            image = this.getImage();

        if ( image ) {
            result.setImage( image );
        }

        return result;
    }

    protected async load() {
       UIEmbed.logger.debug( this.load,
            `Loading UIEmbed: ${ this.getName() }`
        );
    }

    protected getTitle(): string {
        throw new ForceMethodImplementation( this, this.getTitle.name );
    }

    protected getDescription(): string {
        throw new ForceMethodImplementation( this, this.getDescription.name );
    }

    protected getColor(): number {
        throw new ForceMethodImplementation( this, this.getColor.name );
    }

    protected getImage() {
        return "";
    }

    /**
     * Function getArgsFields() :: Should contain only the args fields.
     */
    protected getArgsFields(): string[] {
        return [];
    }

    /**
     * Function getLogicFields() :: Should contain only the logic fields.
     */
    protected getLogicFields(): string[] {
        throw new ForceMethodImplementation( this, this.getLogicFields.name );
    }

    protected getFieldOptions(): any {
        return {};
    }

    /**
     * Function getFieldsLogic() :: The logic behind the fields.
     * When variables are used, they should be in the format of `UI_TEMPLATE_WRAPPER_START{variable}UI_TEMPLATE_WRAPPER_END`. without any extra character(s).
     */
    protected async getFieldsLogic( interaction?: UIBaseInteractionTypes | null, args?: any ): Promise<{ [ key: string ]: string } | any> {
        return [];
    }

    protected getInternalComponents(): any {
        return []; // Bypass.
    }
}

export default UIEmbed;
