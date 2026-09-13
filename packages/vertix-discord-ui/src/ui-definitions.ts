import type { UIEmbedLogic, UIEmbedLogicSource } from "@vertix.gg/definitions/src/ui-export-definitions";

export type { UIEmbedLogic, UIEmbedLogicSource };

export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = { [ key: string ]: JsonValue };

export type JsonArray = ReadonlyArray<JsonValue>;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type UIInstanceType = "Static" | "Dynamic";

export type UIComponentType = "component";

export type UIElementType = "button" | "button-url" | "select-menu" | "user-select" | "channel-select" | "role-select";

export type UIButtonStyle = "primary" | "secondary" | "success" | "danger" | "link";

export function isUIButtonElementType( elementType: string ): elementType is UIButtonDefinition[ "elementType" ] {
    return elementType === "button" || elementType === "button-url";
}

export function isUISelectElementType( elementType: string ): elementType is UISelectMenuDefinition[ "elementType" ] {
    return elementType === "select-menu"
        || elementType === "user-select"
        || elementType === "channel-select"
        || elementType === "role-select";
}

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

export interface UISelectOptionDefinition {
    label?: string;
    value?: string;
    emoji?: string;
    description?: string;
}

export interface UISelectMenuDefinition extends UIElementDefinitionBase {
    elementType: "select-menu" | "user-select" | "channel-select" | "role-select";
    placeholder?: string;
    selectOptions?: ReadonlyArray<UISelectOptionDefinition>;
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

/**
 * What an embed says a variable stands for, in the two shapes it writes them.
 *
 * A map is a choice, keyed by the token the embed's own logic picks - `{ deliveryDisplay: {
 * "{deliveryDelivered}": "They have been sent a link to it.", … } }`. A plain string is a variable
 * with one fixed value, like `changedDisplay: "(__restored__)"`, which the embed then uses wherever
 * it wants those words. The picking is a function the export cannot carry; the words are right here.
 */
export type UIEmbedOptions = Readonly<Record<string, string | Readonly<Record<string, string>>>>;

export interface UIEmbedDefinition {
    instanceType?: UIInstanceType;
    title?: string;
    description?: string;
    color?: number;
    image?: string;
    thumbnail?: string;
    footer?: string;
    options?: UIEmbedOptions;
    /**
     * This embed's own working out, written out.
     *
     * What it decides about its arguments before printing them - which of its sentences applies,
     * how many of something there are, how long is left - is a function, and the exporter sends
     * the function rather than an answer. Running it is how a drawing here says what the bot
     * would have said instead of guessing at it.
     */
    logic?: UIEmbedLogic;
    /** The names the bot declares for this embed's variables, which its logic is written against. */
    vars?: Readonly<Record<string, string>>;
    /** How this embed writes out a variable that is a list rather than a single value. */
    arrayOptions?: Readonly<Record<string, UIEmbedArrayOption>>;
}

/** How one list-valued variable is written out - around each entry, and between them. */
export interface UIEmbedArrayOption {
    /** What wraps one entry, written against `{value}` and `{separator}`. */
    format: string;
    /** What goes between entries. */
    separator?: string;
    /** What goes between entries that are made of several pieces each. */
    multiSeparator?: string;
    /** How each field of such an entry reads, where an entry is more than a single value. */
    options?: Readonly<Record<string, string>>;
}

export interface UIEmbedItem {
    embed: string;
    definition?: UIEmbedDefinition;
}

export interface UIEmbedsGroup {
    name: string;
    items: ReadonlyArray<UIEmbedItem>;
}

/** One field of a modal, as the bot declares it on the input element. */
export interface UIModalInputDefinition {
    name: string;
    label: string;
    placeholder?: string;
    style: "short" | "paragraph";
    minLength?: number;
    maxLength?: number;
}

export interface UIModalDefinition {
    name: string;
    title: string;
    inputs: ReadonlyArray<UIModalInputDefinition>;
}

export interface UIComponent {
    name: string;
    type: UIComponentType;
    instanceType: UIInstanceType;
    elementsGroups: ReadonlyArray<UIElementsGroup>;
    embedsGroups: ReadonlyArray<UIEmbedsGroup>;
    modalDefinitions: ReadonlyArray<UIModalDefinition>;
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

/** The modal the bot would open, as it declared it - title, fields, labels and bounds and all. */
export async function getUIModalByName( modalName: string ): Promise<UIModalDefinition | null> {
    const components = await fetchUIComponents();

    for ( const component of components ) {
        for ( const modal of component.modalDefinitions ) {
            if ( modal.name === modalName ) {
                return modal;
            }
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
    const modalDefinitions = parseModalDefinitions( value[ "modalDefinitions" ] );

    return {
        name,
        type: "component",
        instanceType,
        elementsGroups,
        embedsGroups,
        modalDefinitions,
        defaultElementsGroup: asNullableString( value[ "defaultElementsGroup" ] ),
        defaultEmbedsGroup: asNullableString( value[ "defaultEmbedsGroup" ] ),
    };
}

function parseModalDefinitions( value: JsonValue ): ReadonlyArray<UIModalDefinition> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const modals: Array<UIModalDefinition> = [];

    for ( const item of value ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const name = asString( item[ "name" ] ),
            title = asString( item[ "title" ] );

        if ( !name || !title ) {
            continue;
        }

        modals.push( { name, title, inputs: parseModalInputs( item[ "inputs" ] ) } );
    }

    return modals;
}

function parseModalInputs( value: JsonValue ): ReadonlyArray<UIModalInputDefinition> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const inputs: Array<UIModalInputDefinition> = [];

    for ( const item of value ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const name = asString( item[ "name" ] ),
            label = asString( item[ "label" ] );

        if ( !name || !label ) {
            continue;
        }

        inputs.push( {
            name,
            label,
            placeholder: asString( item[ "placeholder" ] ) ?? undefined,
            style: "paragraph" === asString( item[ "style" ] ) ? "paragraph" : "short",
            minLength: asNumber( item[ "minLength" ] ) ?? undefined,
            maxLength: asNumber( item[ "maxLength" ] ) ?? undefined
        } );
    }

    return inputs;
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

    if ( isUIButtonElementType( elementType ) ) {
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

    if ( isUISelectElementType( elementType ) ) {
        const placeholder = asString( value[ "placeholder" ] );
        const selectOptions = parseSelectOptions( value[ "selectOptions" ] );

        return {
            name,
            elementType,
            instanceType,
            placeholder: placeholder ?? undefined,
            selectOptions: selectOptions.length > 0 ? selectOptions : undefined,
        };
    }

    return null;
}

function parseSelectOptions( value: JsonValue ): ReadonlyArray<UISelectOptionDefinition> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const options: Array<UISelectOptionDefinition> = [];

    for ( const optionValue of value ) {
        if ( !isObject( optionValue ) ) {
            continue;
        }

        const label = asString( optionValue[ "label" ] );
        const optValue = asString( optionValue[ "value" ] );
        const emoji = asString( optionValue[ "emoji" ] );
        const description = asString( optionValue[ "description" ] );

        options.push( {
            label: label ?? undefined,
            value: optValue ?? undefined,
            emoji: emoji ?? undefined,
            description: description ?? undefined,
        } );
    }

    return options;
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
    const image = asString( value[ "image" ] );
    const thumbnail = asString( value[ "thumbnail" ] );
    const footer = asString( value[ "footer" ] );

    return {
        title: title ?? undefined,
        description: description ?? undefined,
        color: color ?? undefined,
        instanceType: instanceType === "Static" || instanceType === "Dynamic" ? instanceType : undefined,
        image: image ?? undefined,
        thumbnail: thumbnail ?? undefined,
        footer: footer ?? undefined,
        options: parseEmbedOptions( value[ "options" ] ),
        logic: parseEmbedLogic( value[ "logic" ] ),
        vars: parseStringRecordOrUndefined( value[ "vars" ] ),
        arrayOptions: parseEmbedArrayOptions( value[ "arrayOptions" ] ),
    };
}

/** How this embed writes out each of its list-valued variables, where it says. */
function parseEmbedArrayOptions(
    value: JsonValue | undefined
): Record<string, UIEmbedArrayOption> | undefined {
    if ( undefined === value || !isObject( value ) ) {
        return undefined;
    }

    const parsed: Record<string, UIEmbedArrayOption> = {};

    for ( const [ name, raw ] of Object.entries( value ) ) {
        if ( !isObject( raw ) ) {
            continue;
        }

        const format = asString( raw[ "format" ] );

        if ( !format ) {
            continue;
        }

        parsed[ name ] = {
            format,
            separator: asString( raw[ "separator" ] ) ?? undefined,
            multiSeparator: asString( raw[ "multiSeparator" ] ) ?? undefined,
            options: parseStringRecordOrUndefined( raw[ "options" ] )
        };
    }

    return Object.keys( parsed ).length ? parsed : undefined;
}

/** The working out the exporter sent along with this embed, if it sent any. */
function parseEmbedLogic( value: JsonValue | undefined ): UIEmbedLogic | undefined {
    if ( undefined === value || !isObject( value ) || !Array.isArray( value[ "sources" ] ) ) {
        return undefined;
    }

    const sources: UIEmbedLogicSource[] = [];

    for ( const item of value[ "sources" ] ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const source = asString( item[ "source" ] );

        if ( !source ) {
            continue;
        }

        const binds = item[ "binds" ];

        sources.push( Array.isArray( binds )
            ? { source, binds: binds.filter( ( bind ): bind is string => "string" === typeof bind ) }
            : { source } );
    }

    if ( !sources.length ) {
        return undefined;
    }

    const endTime = value[ "endTime" ] ?? null;

    if ( isObject( endTime ) ) {
        const source = asString( endTime[ "source" ] );

        if ( source ) {
            return { sources, endTime: { source } };
        }
    }

    return { sources };
}

/** A flat bag of names, where the export carries one. */
function parseStringRecordOrUndefined( value: JsonValue | undefined ): Record<string, string> | undefined {
    if ( undefined === value || !isObject( value ) ) {
        return undefined;
    }

    const record: Record<string, string> = {};

    for ( const [ name, item ] of Object.entries( value ) ) {
        const text = asString( item );

        if ( null !== text ) {
            record[ name ] = text;
        }
    }

    return Object.keys( record ).length ? record : undefined;
}

function parseEmbedOptions( value: JsonValue | undefined ): UIEmbedOptions | undefined {
    if ( undefined === value || !isObject( value ) ) {
        return undefined;
    }

    const options: Record<string, string | Record<string, string>> = {};

    for ( const [ name, choices ] of Object.entries( value ) ) {
        const fixed = asString( choices );

        if ( null !== fixed ) {
            options[ name ] = fixed;

            continue;
        }

        if ( !isObject( choices ) ) {
            continue;
        }

        const mapped: Record<string, string> = {};

        for ( const [ token, text ] of Object.entries( choices ) ) {
            const resolved = asString( text );

            if ( null !== resolved ) {
                mapped[ token ] = resolved;
            }
        }

        if ( Object.keys( mapped ).length ) {
            options[ name ] = mapped;
        }
    }

    return Object.keys( options ).length ? options : undefined;
}

export function isObject( value: JsonValue ): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray( value );
}

export function asString( value: JsonValue ): string | null {
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

