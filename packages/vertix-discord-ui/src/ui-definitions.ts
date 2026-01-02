export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = { [ key: string ]: JsonValue };

export type JsonArray = ReadonlyArray<JsonValue>;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type UIInstanceType = "Static" | "Dynamic";

export type UIComponentType = "component";

export type UIElementType = "button" | "button-url" | "select-menu" | "user-select" | "channel-select" | "role-select";

export type UIButtonStyle = "primary" | "secondary" | "success" | "danger" | "link";

export interface UIElementDefinitionBase {
    name: string;
    elementType: UIElementType;
    instanceType: UIInstanceType;
}

export interface UIButtonDefinition extends UIElementDefinitionBase {
    elementType: "button" | "button-url";
    label?: string;
    labelOmitted?: boolean;
    style?: UIButtonStyle;
    emoji?: string;
    url?: string;
}

export interface UISelectMenuDefinition extends UIElementDefinitionBase {
    elementType: "select-menu" | "user-select" | "channel-select" | "role-select";
    placeholder?: string;
}

export type UIElementDefinition = UIButtonDefinition | UISelectMenuDefinition;

export interface UIElementItem {
    element: string;
    definition: UIElementDefinition;
}

export type UIElementsRow = ReadonlyArray<UIElementItem>;

export interface UIElementsGroup {
    name: string;
    items: ReadonlyArray<UIElementsRow>;
}

export interface UIEmbedDefinition {
    instanceType?: UIInstanceType;
    title?: string;
    description?: string;
    color?: number;
}

export interface UIEmbedItem {
    embed: string;
    definition?: UIEmbedDefinition;
}

export interface UIEmbedsGroup {
    name: string;
    items: ReadonlyArray<UIEmbedItem>;
}

export interface UIComponent {
    name: string;
    type: UIComponentType;
    instanceType: UIInstanceType;
    elementsGroups: ReadonlyArray<UIElementsGroup>;
    embedsGroups: ReadonlyArray<UIEmbedsGroup>;
    defaultElementsGroup: string | null;
    defaultEmbedsGroup: string | null;
}

const UI_COMPONENTS_URL = "/exports/ui/components.json";

let cachedUIComponentsPromise: Promise<ReadonlyArray<UIComponent>> | null = null;

export async function fetchUIComponents(): Promise<ReadonlyArray<UIComponent>> {
    if ( cachedUIComponentsPromise ) {
        return await cachedUIComponentsPromise;
    }

    cachedUIComponentsPromise = ( async() => {
        const response = await fetch( UI_COMPONENTS_URL );
        const rawText = await response.text();

        const parsed = JSON.parse( rawText ) as JsonValue;
        const components = parseUIComponents( parsed );

        return components;
    } )();

    return await cachedUIComponentsPromise;
}

export async function getUIComponentByName( componentName: string ): Promise<UIComponent | null> {
    const components = await fetchUIComponents();

    for ( const component of components ) {
        if ( component.name === componentName ) {
            return component;
        }
    }

    return null;
}

export async function findUIEmbedDefinition( embedName: string ): Promise<UIEmbedDefinition | null> {
    const components = await fetchUIComponents();

    for ( const component of components ) {
        for ( const group of component.embedsGroups ) {
            for ( const item of group.items ) {
                if ( item.embed === embedName && item.definition ) {
                    return item.definition;
                }
            }
        }
    }

    return null;
}

function parseUIComponents( value: JsonValue ): ReadonlyArray<UIComponent> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const components: Array<UIComponent> = [];

    for ( const item of value ) {
        const component = parseUIComponent( item );
        if ( component ) {
            components.push( component );
        }
    }

    return components;
}

function parseUIComponent( value: JsonValue ): UIComponent | null {
    if ( !isObject( value ) ) {
        return null;
    }

    const name = asString( value[ "name" ] );
    const type = asString( value[ "type" ] );
    const instanceType = asString( value[ "instanceType" ] );

    if ( !name || type !== "component" || ( instanceType !== "Static" && instanceType !== "Dynamic" ) ) {
        return null;
    }

    const elementsGroups = parseElementsGroups( value[ "elementsGroups" ] );
    const embedsGroups = parseEmbedsGroups( value[ "embedsGroups" ] );

    return {
        name,
        type: "component",
        instanceType,
        elementsGroups,
        embedsGroups,
        defaultElementsGroup: asNullableString( value[ "defaultElementsGroup" ] ),
        defaultEmbedsGroup: asNullableString( value[ "defaultEmbedsGroup" ] ),
    };
}

function parseElementsGroups( value: JsonValue ): ReadonlyArray<UIElementsGroup> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const groups: Array<UIElementsGroup> = [];

    for ( const groupValue of value ) {
        const group = parseElementsGroup( groupValue );
        if ( group ) {
            groups.push( group );
        }
    }

    return groups;
}

function parseElementsGroup( value: JsonValue ): UIElementsGroup | null {
    if ( !isObject( value ) ) {
        return null;
    }

    const name = asString( value[ "name" ] );
    const itemsValue = value[ "items" ];

    if ( !name || !Array.isArray( itemsValue ) ) {
        return null;
    }

    const rows: Array<UIElementsRow> = [];

    for ( const rowValue of itemsValue ) {
        const row = parseElementsRow( rowValue );
        if ( row.length > 0 ) {
            rows.push( row );
        }
    }

    return {
        name,
        items: rows,
    };
}

function parseElementsRow( value: JsonValue ): UIElementsRow {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const items: Array<UIElementItem> = [];

    for ( const itemValue of value ) {
        const item = parseElementItem( itemValue );
        if ( item ) {
            items.push( item );
        }
    }

    return items;
}

function parseElementItem( value: JsonValue ): UIElementItem | null {
    if ( !isObject( value ) ) {
        return null;
    }

    const element = asString( value[ "element" ] );
    const definitionValue = value[ "definition" ];

    if ( !element || !isObject( definitionValue ) ) {
        return null;
    }

    const definition = parseElementDefinition( definitionValue );
    if ( !definition ) {
        return null;
    }

    return {
        element,
        definition,
    };
}

function parseElementDefinition( value: JsonObject ): UIElementDefinition | null {
    const name = asString( value[ "name" ] );
    const elementType = asString( value[ "elementType" ] );
    const instanceType = asString( value[ "instanceType" ] );

    if ( !name || !elementType || ( instanceType !== "Static" && instanceType !== "Dynamic" ) ) {
        return null;
    }

    if ( elementType === "button" || elementType === "button-url" ) {
        const style = asString( value[ "style" ] );
        const label = asString( value[ "label" ] );
        const emoji = asString( value[ "emoji" ] );
        const url = asString( value[ "url" ] );
        const labelOmitted = asBoolean( value[ "labelOmitted" ] );

        return {
            name,
            elementType,
            instanceType,
            label: label ?? undefined,
            labelOmitted: labelOmitted ?? undefined,
            style: isButtonStyle( style ) ? style : undefined,
            emoji: emoji ?? undefined,
            url: url ?? undefined,
        };
    }

    if (
        elementType === "select-menu"
        || elementType === "user-select"
        || elementType === "channel-select"
        || elementType === "role-select"
    ) {
        const placeholder = asString( value[ "placeholder" ] );

        return {
            name,
            elementType,
            instanceType,
            placeholder: placeholder ?? undefined,
        };
    }

    return null;
}

function parseEmbedsGroups( value: JsonValue ): ReadonlyArray<UIEmbedsGroup> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const groups: Array<UIEmbedsGroup> = [];

    for ( const groupValue of value ) {
        const group = parseEmbedsGroup( groupValue );
        if ( group ) {
            groups.push( group );
        }
    }

    return groups;
}

function parseEmbedsGroup( value: JsonValue ): UIEmbedsGroup | null {
    if ( !isObject( value ) ) {
        return null;
    }

    const name = asString( value[ "name" ] );
    const itemsValue = value[ "items" ];

    if ( !name || !Array.isArray( itemsValue ) ) {
        return null;
    }

    const items: Array<UIEmbedItem> = [];

    for ( const itemValue of itemsValue ) {
        const item = parseEmbedItem( itemValue );
        if ( item ) {
            items.push( item );
        }
    }

    return {
        name,
        items,
    };
}

function parseEmbedItem( value: JsonValue ): UIEmbedItem | null {
    if ( !isObject( value ) ) {
        return null;
    }

    const embed = asString( value[ "embed" ] );
    if ( !embed ) {
        return null;
    }

    const definitionValue = value[ "definition" ];
    const definition = isObject( definitionValue ) ? parseEmbedDefinition( definitionValue ) : undefined;

    return {
        embed,
        definition,
    };
}

function parseEmbedDefinition( value: JsonObject ): UIEmbedDefinition {
    const title = asString( value[ "title" ] );
    const description = asString( value[ "description" ] );
    const color = asNumber( value[ "color" ] );
    const instanceType = asString( value[ "instanceType" ] );

    return {
        title: title ?? undefined,
        description: description ?? undefined,
        color: color ?? undefined,
        instanceType: instanceType === "Static" || instanceType === "Dynamic" ? instanceType : undefined,
    };
}

function isObject( value: JsonValue ): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray( value );
}

function asString( value: JsonValue ): string | null {
    return typeof value === "string" ? value : null;
}

function asNullableString( value: JsonValue ): string | null {
    if ( value === null ) {
        return null;
    }

    return asString( value );
}

function asBoolean( value: JsonValue ): boolean | null {
    return typeof value === "boolean" ? value : null;
}

function asNumber( value: JsonValue ): number | null {
    return typeof value === "number" ? value : null;
}

function isButtonStyle( value: string | null ): value is UIButtonStyle {
    return value === "primary"
        || value === "secondary"
        || value === "success"
        || value === "danger"
        || value === "link";
}

