import { EmbedBuilder } from "discord.js";

import { BaseInteractionTypes, DYNAMICO_UI_EMBED, E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIEmbedTemplate from "@dynamico/ui/base/ui-embed-template";

import UIBase from "@dynamico/ui/base/ui-base";

import { ForceMethodImplementation } from "@internal/errors";

export class UIEmbed extends UIBase {
    public static getName() {
        return DYNAMICO_UI_EMBED;
    }

    // TODO: Create static embeds, support `this.getType` to achieve this.
    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public async buildEmbed( interaction?: BaseInteractionTypes | null, args?: any ): Promise<EmbedBuilder> {
        const name = this.getName() + "-embed",
            title = this.getTitle(),
            description = this.getDescription(),
            color = this.getColor(),
            fields = this.getFields(),
            options = this.getOptions(),
            logic = await this.getFieldsLogic( interaction, args ),
            fieldsObject = fields.reduce( ( acc, field ) => {
                acc[ `%{${ field }}%` ] = `%{${ field }}%`; // TODO `%{`, `}%` should be configurable.
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

            protected getTemplateLogic( interaction?: BaseInteractionTypes, args?: any ): any {
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

        return uiTemplate.build( interaction, args );
    }

    protected async load(interaction?: BaseInteractionTypes | null | undefined) {
        // Bypass.
    }

    protected getColor(): number {
        throw new ForceMethodImplementation( this, this.getColor.name );
    }

    protected getTitle(): string {
        throw new ForceMethodImplementation( this, this.getTitle.name );
    }

    protected getDescription(): string {
        throw new ForceMethodImplementation( this, this.getDescription.name );
    }

    /**
     * Function getFields() :: Should contain only the logic fields.
     * TODO: Try remove this function.
     */
    protected getFields(): string[] {
        throw new ForceMethodImplementation( this, this.getColor.name );
    }

    /**
     * Function getFieldsLogic() :: The logic behind the fields.
     * When variables are used, they should be in the format of `%{variable}%`. without any extra character(s).
     */
    protected async getFieldsLogic( interaction?: BaseInteractionTypes | null, args?: any ): Promise<{ [ key: string ]: string } | any> {
        return [];
    }

    protected getOptions(): any {
        return {};
    }

    protected getInternalComponents(): any {
        return []; // Bypass.
    }
}

export default UIEmbed;
