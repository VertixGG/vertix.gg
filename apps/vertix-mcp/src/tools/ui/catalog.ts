import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

const DEFAULT_EXPORTS_DIR = path.resolve( __dirname, "../../../../../exports/ui" );

export interface ElementDefinitionExport {
    name: string;
    elementType: string;
    label?: string;
    style?: string;
    emoji?: string;
    url?: string;
    placeholder?: string;
    selectOptions?: { label?: string; value?: string; emoji?: string; description?: string }[];
}

export interface EmbedDefinitionExport {
    title?: string;
    description?: string;
    color?: unknown;
    image?: string;
    thumbnail?: string;
    footer?: string;
}

export interface ComponentExport {
    name: string;
    instanceType?: string;
    modules?: string[];
    elementsGroups?: { name?: string; items?: { element: string; definition?: ElementDefinitionExport }[][] }[];
    embedsGroups?: { name?: string; items?: { embed: string; definition?: EmbedDefinitionExport }[] }[];
    modalDefinitions?: unknown[];
    defaultElementsGroup?: string | null;
    defaultEmbedsGroup?: string | null;
}

export interface AdapterExport {
    name: string;
    adapterKind?: string;
    component?: string;
    module?: string;
    instanceType?: string;
    channelTypes?: string[];
    permissions?: string;
    executionSteps?: { key: string; elementsGroup?: string | null; embedsGroup?: string | null }[];
    bindings?: unknown[];
    modalTriggers?: unknown[];
    hooks?: { hook: string; handler: string }[];
}

interface Catalog {
    adapters: AdapterExport[];
    components: ComponentExport[];
    meta: Record<string, unknown>;
}

let catalog: Catalog | null = null;

function getExportsDir(): string {
    return process.env.VERTIX_UI_EXPORTS_DIR?.trim() || DEFAULT_EXPORTS_DIR;
}

function readJson<T>( fileName: string ): T {
    const filePath = path.join( getExportsDir(), fileName );

    if ( ! fs.existsSync( filePath ) ) {
        throw new Error( `UI export '${ fileName }' was not found at '${ filePath }'. Run the UI export command first.` );
    }

    return JSON.parse( fs.readFileSync( filePath, "utf-8" ) ) as T;
}

function getCatalog(): Catalog {
    if ( ! catalog ) {
        catalog = {
            adapters: readJson<AdapterExport[]>( "adapters.json" ),
            components: readJson<ComponentExport[]>( "components.json" ),
            meta: readJson<Record<string, unknown>>( "meta.json" )
        };
    }

    return catalog;
}

function getComponent( componentName?: string ): ComponentExport | null {
    if ( ! componentName ) {
        return null;
    }

    return getCatalog().components.find( ( component ) => component.name === componentName ) ?? null;
}

function flattenElements( component: ComponentExport | null ) {
    if ( ! component?.elementsGroups ) {
        return [];
    }

    return component.elementsGroups.map( ( group ) => ( {
        group: group.name,
        elements: ( group.items ?? [] ).flat().map( ( item ) => ( {
            name: item.element,
            type: item.definition?.elementType ?? "unknown",
            label: item.definition?.label,
            style: item.definition?.style,
            emoji: item.definition?.emoji,
            url: item.definition?.url,
            placeholder: item.definition?.placeholder,
            selectOptions: item.definition?.selectOptions
        } ) )
    } ) );
}

function flattenEmbeds( component: ComponentExport | null ) {
    if ( ! component?.embedsGroups ) {
        return [];
    }

    return component.embedsGroups.map( ( group ) => ( {
        group: group.name,
        embeds: ( group.items ?? [] ).map( ( item ) => ( {
            name: item.embed,
            title: item.definition?.title,
            description: item.definition?.description,
            color: item.definition?.color,
            image: item.definition?.image,
            thumbnail: item.definition?.thumbnail,
            footer: item.definition?.footer
        } ) )
    } ) );
}

export function listAdapters( filter: { module?: string; kind?: string; search?: string } = {} ) {
    const search = filter.search?.toLowerCase();

    const adapters = getCatalog().adapters.filter( ( adapter ) => {
        if ( filter.module && adapter.module !== filter.module ) {
            return false;
        }

        if ( filter.kind && adapter.adapterKind !== filter.kind ) {
            return false;
        }

        return ! search || adapter.name.toLowerCase().includes( search );
    } );

    return {
        total: adapters.length,
        adapters: adapters.map( ( adapter ) => ( {
            name: adapter.name,
            module: adapter.module,
            kind: adapter.adapterKind,
            instanceType: adapter.instanceType,
            channelTypes: adapter.channelTypes,
            component: adapter.component
        } ) )
    };
}

export function getAdapter( name: string ) {
    const adapter = getCatalog().adapters.find( ( item ) => item.name === name );

    if ( ! adapter ) {
        throw new Error( `Adapter '${ name }' was not found in the UI exports` );
    }

    const component = getComponent( adapter.component );

    return {
        name: adapter.name,
        module: adapter.module,
        kind: adapter.adapterKind,
        instanceType: adapter.instanceType,
        channelTypes: adapter.channelTypes,
        permissions: adapter.permissions,
        component: adapter.component,
        executionSteps: adapter.executionSteps ?? [],
        hooks: adapter.hooks ?? [],
        modalTriggers: adapter.modalTriggers ?? [],
        embeds: flattenEmbeds( component ),
        elements: flattenElements( component ),
        modals: component?.modalDefinitions ?? [],
        defaults: {
            elementsGroup: component?.defaultElementsGroup ?? null,
            embedsGroup: component?.defaultEmbedsGroup ?? null
        }
    };
}

export function searchUI( query: string, limit = 20 ) {
    const needle = query.toLowerCase();
    const matches: { adapter: string; matchedIn: string; text: string }[] = [];

    const push = ( adapter: string, matchedIn: string, text?: string ) => {
        if ( matches.length >= limit || ! text || ! text.toLowerCase().includes( needle ) ) {
            return;
        }

        matches.push( { adapter, matchedIn, text: text.slice( 0, 300 ) } );
    };

    for ( const adapter of getCatalog().adapters ) {
        push( adapter.name, "adapter-name", adapter.name );

        const component = getComponent( adapter.component );

        for ( const group of flattenEmbeds( component ) ) {
            for ( const embed of group.embeds ) {
                push( adapter.name, `embed:${ embed.name }`, embed.title );
                push( adapter.name, `embed:${ embed.name }`, embed.description );
            }
        }

        for ( const group of flattenElements( component ) ) {
            for ( const element of group.elements ) {
                push( adapter.name, `element:${ element.name }`, element.label );
                push( adapter.name, `element:${ element.name }`, element.placeholder );
            }
        }
    }

    return { total: matches.length, matches };
}

export function getCatalogMeta() {
    return getCatalog().meta;
}
