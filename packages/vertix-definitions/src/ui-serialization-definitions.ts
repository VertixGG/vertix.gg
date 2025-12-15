import type { UIPortableSchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

export type UISerializationFlowAttributeValue =
    | string
    | number
    | boolean
    | null
    | UISerializationFlowAttributeValue[]
    | { [ key: string ]: UISerializationFlowAttributeValue };

export type UISerializationFlowAttributes = Record<string, UISerializationFlowAttributeValue>;

export interface UISerializationFlowElement {
    name: string;
    type: string;
    attributes: UISerializationFlowAttributes;
    isAvailable: boolean;
}

export interface UISerializationFlowEmbed {
    name: string;
    type: string;
    attributes: UISerializationFlowAttributes;
    isAvailable: boolean;
}

export interface UISerializationFlowModalField {
    name: string;
    type: string;
    attributes: UISerializationFlowAttributes;
    isAvailable?: boolean;
}

export interface UISerializationFlowModal {
    name: string;
    type: string;
    attributes: UISerializationFlowAttributes;
    entities: Array<Array<UISerializationFlowModalField>>;
}

export interface UISerializationFlowComponent {
    name: string;
    type: string;
    entities: {
        elements: Array<Array<UISerializationFlowElement>>;
        embeds: Array<UISerializationFlowEmbed>;
        modals?: Array<UISerializationFlowModal>;
    };
    components: Array<UISerializationFlowComponent>;
}

export interface UISerializationComponent {
    toSchema( context?: UISerializationContext ): Promise<UISerializationComponentSchemaResult>;
}

export interface UISerializationContext {
    parent?: UIComponentBase;
    properties?: Record<string, any>;
}

export interface UISerializationComponentSchemaResult extends Partial<UISerializationFlowComponent> {
    [key: string]: unknown;
}

export type UISerializationModalFieldSchema = Record<string, UISerializationFlowAttributeValue> | undefined;

export interface UISerializationModalSchema extends UIPortableSchemaBase {
    entities: Array<Array<UISerializationModalFieldSchema>> | { [key: string]: any };
}

