import UIComponentBase from "@dynamico/ui/base/ui-component-base";
import UITemplate from "@dynamico/ui/base/ui-template";

import {
    BaseInteractionTypes,
    DYNAMICO_UI_TEMPLATE_COMPONENT_EMBED,
    E_UI_TYPES
} from "@dynamico/interfaces/ui";

export abstract class UITemplateComponentEmbed extends UIComponentBase {
    public static getName() {
        return DYNAMICO_UI_TEMPLATE_COMPONENT_EMBED;
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected abstract getTitle(): string;

    protected abstract getDescription(): string;

    protected abstract getColor(): number;

    protected abstract getFields(): string[];

    protected abstract getFieldsLogic( interaction?: BaseInteractionTypes | null, args?: any ): any;

    protected getInternalComponents(): any {
        return []; // Bypass.
    }

    protected getDynamicEmbeds( interaction?: BaseInteractionTypes, args?: any ) {
        const name = this.getName() + "-embed",
            title = this.getTitle(),
            description = this.getDescription(),
            color = this.getColor(),
            fields = this.getFields(),
            logic = this.getFieldsLogic( interaction, args ),
            fieldsObject = fields.reduce( ( acc, field ) => {
                acc[ `%{${ field }}%` ] = `%{_${ field }}%`;
                return acc;
            }, {} as any );

        return [
            new class extends UITemplate {
                public static getName() {
                    return name;
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
            }
        ];
    }
}
