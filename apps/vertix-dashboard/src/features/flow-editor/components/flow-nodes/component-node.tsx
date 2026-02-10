import { useMemo, useState } from "react";

import { Handle, Position, useStore } from "@xyflow/react";

import { DiscordMessage, DiscordEmbed, DiscordButton } from "@vertix.gg/discord-ui/src";
import { SELECT_MENU_ELEMENT_TYPES } from "@vertix.gg/definitions/src/ui-export-definitions";

import type { Node, NodeProps } from "@xyflow/react";
import type { UIExportElementDefinition } from "@vertix.gg/definitions/src/ui-export-definitions";

interface EmbedData {
    title?: string;
    description?: string;
    color?: number;
    image?: { url: string };
    thumbnail?: { url: string };
    defaultVars?: Record<string, string>;
}

interface ElementData {
    name: string;
    definition?: UIExportElementDefinition;
}

interface ButtonModalTrigger {
    buttonName: string;
    modalName: string;
    handlePosition?: "left" | "right" | "bottom" | "top";
}

interface ButtonFlowTrigger {
    buttonName: string;
    targetFlowName: string;
    handlePosition?: "left" | "right" | "bottom" | "top";
}

interface StateTransitionTrigger {
    elementName: string;
    handlePosition?: "left" | "right" | "bottom" | "top";
}

type ComponentNodeData = Record<
    string,
    string
        | number
        | boolean
        | EmbedData
        | ElementData[][]
        | ButtonModalTrigger[]
        | ButtonFlowTrigger[]
        | StateTransitionTrigger[]
        | undefined
> & {
    label: string;
    type: string;
    embed?: EmbedData;
    elementRows?: ElementData[][];
    buttonModalTriggers?: ButtonModalTrigger[];
    buttonFlowTriggers?: ButtonFlowTrigger[];
    stateTransitionTriggers?: StateTransitionTrigger[];
};

/**
 * Normalize an emoji that may be a string or Discord API object to a plain string.
 */
function normalizeEmoji( emoji: unknown ): string | undefined {
    if ( !emoji ) {
        return undefined;
    }

    if ( typeof emoji === "string" ) {
        return emoji;
    }

    if ( typeof emoji === "object" ) {
        const obj = emoji as { id?: string; name?: string; animated?: boolean };

        if ( obj.id && obj.name ) {
            const prefix = obj.animated ? "a" : "";
            return `<${ prefix }:${ obj.name }:${ obj.id }>`;
        }

        if ( obj.name ) {
            return obj.name;
        }
    }

    return undefined;
}

function formatElementFallbackLabel( elementName: string ): string {
    const lastSegment = elementName.split( "/" ).pop() ?? elementName;

    return lastSegment
        .replace( /[-_]+/g, " " )
        .replace( /([a-z0-9])([A-Z])/g, "$1 $2" )
        .trim();
}

function getElementLabel( element: ElementData ): string {
    if ( element.definition?.labelOmitted ) {
        return "";
    }

    if ( element.definition?.label ) {
        return element.definition.label;
    }

    const candidate = element.definition?.name ?? element.name;

    return formatElementFallbackLabel( candidate );
}

function getButtonVariant( element: ElementData ): "primary" | "secondary" | "success" | "danger" | "link" {
    if ( element.definition?.style ) {
        return element.definition.style;
    }
    if ( element.definition?.elementType === "button-url" ) {
        return "link";
    }

    return "secondary";
}

function getButtonEmoji( element: ElementData ): string | undefined {
    return element.definition?.emoji;
}

function isSelectMenu( element: ElementData ): boolean {
    const elementType = element.definition?.elementType;

    if ( elementType ) {
        return ( SELECT_MENU_ELEMENT_TYPES as readonly string[] ).includes( elementType );
    }

    return element.name.toLowerCase().includes( "selectmenu" ) || element.name.toLowerCase().includes( "select" );
}

function getSelectPlaceholder( element: ElementData ): string {
    if ( element.definition?.placeholder ) {
        return element.definition.placeholder;
    }

    return getElementLabel( element );
}

interface DiscordEmoji {
    animated: boolean;
    name: string;
    id: string;
}

function parseDiscordEmoji( emojiString: string ): DiscordEmoji | null {
    const match = emojiString.match( /<(a)?:([a-zA-Z0-9_]+):(\d+)>/ );
    if ( !match ) {
        return null;
    }

    const [ , animated, name, id ] = match;
    if ( !name || !id ) {
        return null;
    }

    return {
        animated: Boolean( animated ),
        name,
        id
    };
}

function renderDiscordEmojiHtml( emojiString: string ): string {
    const parsed = parseDiscordEmoji( emojiString );
    if ( !parsed ) {
        return emojiString;
    }

    const ext = parsed.animated ? "gif" : "png";
    const url = `https://cdn.discordapp.com/emojis/${ parsed.id }.${ ext }`;

    return `<img src="${ url }" alt=":${ parsed.name }:" width="16" height="16" style="vertical-align:middle;display:inline-block;" />`;
}

function applyDefaultVars( template: string, defaultVars: Record<string, string> | undefined ): string {
    if ( !defaultVars ) {
        return template;
    }

    return template.replace( /\{([a-zA-Z0-9_]+)\}/g, ( full, key: string ) => defaultVars[ key ] ?? full );
}

function replaceInlineDiscordEmojis( input: string ): string {
    return input.replace( /<(a)?:([a-zA-Z0-9_]+):(\d+)>/g, ( match ) => renderDiscordEmojiHtml( match ) );
}

function renderButtonEmoji( emoji: string | undefined ): { emoji?: string; icon?: JSX.Element } {
    if ( !emoji ) {
        return {};
    }

    const parsed = parseDiscordEmoji( emoji );
    if ( !parsed ) {
        return { emoji };
    }

    const ext = parsed.animated ? "gif" : "png";
    const url = `https://cdn.discordapp.com/emojis/${ parsed.id }.${ ext }`;

    return {
        icon: (
            <img
                className="w-[22px] h-[22px] inline-block align-middle"
                src={ url }
                alt={ `:${ parsed.name }:` }
                onError={ ( event ) => {
                    event.currentTarget.style.display = "none";
                } }
            />
        )
    };
}

type ComponentNodeType = Node<ComponentNodeData, "componentNode">;

export function ComponentNode( props: NodeProps<ComponentNodeType> ) {
    const { data, selected } = props;
    const { label, embed, elementRows, buttonModalTriggers, buttonFlowTriggers, stateTransitionTriggers } = data;

    // Merge embedDefinition.defaultVars over embed.defaultVars so sidebar edits
    // and restore operations are always reflected in the preview.
    const embedDefVars = ( data as Record<string, unknown> ).embedDefinition
        ? ( ( data as Record<string, unknown> ).embedDefinition as Record<string, unknown> ).defaultVars as Record<string, string> | undefined
        : undefined;
    const mergedDefaultVars = embed?.defaultVars || embedDefVars
        ? { ...( embed?.defaultVars ?? {} ), ...( embedDefVars ?? {} ) }
        : undefined;
    const selectedClass = selected ? "ring-4 ring-white ring-opacity-80" : "";

    const edges = useStore( state => state.edges );
    const nodes = useStore( state => state.nodes );

    const [ selectedSelectValues, setSelectedSelectValues ] = useState<Record<string, string>>( {} );

    const nodeLabelById = useMemo( () => {
        const map = new Map<string, string>();

        nodes.forEach( ( node ) => {
            const labelCandidate = ( node.data as { label?: string } | undefined )?.label;

            if ( typeof labelCandidate === "string" && labelCandidate.length > 0 ) {
                map.set( node.id, labelCandidate );

                return;
            }

            map.set( node.id, node.id );
        } );

        return map;
    }, [ nodes ] );

    const selectOptionsByElementName = useMemo( () => {
        const map = new Map<string, Array<{ value: string; label: string }>>();

        edges.forEach( ( edge ) => {
            if ( edge.source !== props.id ) {
                return;
            }

            const sourceHandle = edge.sourceHandle;

            if ( typeof sourceHandle !== "string" || !sourceHandle.startsWith( "btn-" ) ) {
                return;
            }

            const elementName = sourceHandle.slice( "btn-".length );

            const edgeLabel = typeof edge.label === "string"
                ? edge.label
                : nodeLabelById.get( edge.target ) ?? edge.target;

            const existing = map.get( elementName ) ?? [];

            map.set( elementName, [
                ...existing,
                {
                    value: edge.id,
                    label: edgeLabel
                }
            ] );
        } );

        return map;
    }, [ edges, nodeLabelById, props.id ] );

    const positionMap = {
        left: Position.Left,
        right: Position.Right,
        top: Position.Top,
        bottom: Position.Bottom
    };

    const getModalTrigger = ( elementName: string ) => {
        return buttonModalTriggers?.find( t => t.buttonName === elementName );
    };

    const getFlowTrigger = ( elementName: string ) => {
        return buttonFlowTriggers?.find( t => t.buttonName === elementName );
    };

    const getStateTransitionTrigger = ( elementName: string ) => {
        return stateTransitionTriggers?.find( t => t.elementName === elementName );
    };

    return (
        <div className="min-w-[380px] max-w-[520px] relative">
            <Handle type="target" position={ Position.Top } className="bg-purple-400! w-2! h-2!" />
            <Handle type="target" position={ Position.Left } id="left" className="bg-emerald-400! w-2! h-2!" />
            <Handle type="target" position={ Position.Right } id="right" className="bg-emerald-400! w-2! h-2!" />

            <div className={ `bg-zinc-900 rounded-lg border border-purple-500/50 shadow-lg shadow-purple-500/20 overflow-hidden transition-all ${ selectedClass }` }>
                <div className="px-3 py-2 bg-purple-600/20 border-b border-purple-500/30">
                    <span className="text-[9px] text-purple-300 uppercase tracking-wider">Component</span>
                    <div className="text-white font-semibold text-sm whitespace-pre-line">{ label }</div>
                </div>

                <div className="bg-[#313338] p-4">
                    <DiscordMessage author="Vertix" app timestamp="">
                        <DiscordEmbed
                            title={ replaceInlineDiscordEmojis( applyDefaultVars( embed?.title || label, mergedDefaultVars ) ) }
                            description={ embed
                                ? embed.description
                                    ? replaceInlineDiscordEmojis( applyDefaultVars( embed.description, mergedDefaultVars ) )
                                    : undefined
                                : "Component preview"
                            }
                            color={ embed?.color || 0x5865f2 }
                            image={ embed?.image }
                            thumbnail={ embed?.thumbnail }
                            size="full"
                        />
                        { elementRows && elementRows.length > 0 && (
                            <div className="discord-action-rows mt-2">
                                { elementRows.map( ( row, rowIndex ) => (
                                    <div key={ rowIndex } className="discord-embed-button-row">
                                        { row.map( ( element ) => {
                                            if ( isSelectMenu( element ) ) {
                                                const stateTrigger = getStateTransitionTrigger( element.name );
                                                const flowTrigger = getFlowTrigger( element.name );
                                                const edgeOptions = selectOptionsByElementName.get( element.name ) ?? [];

                                                // Prefer options from element definition (selectOptions), fall back to edge-derived options
                                                const definitionOptions = element.definition?.selectOptions?.map( opt => {
                                                    const emojiStr = normalizeEmoji( opt.emoji );
                                                    const label = opt.label ?? opt.value ?? "";
                                                    // Only prepend unicode emojis to label — skip custom Discord emoji strings (<:name:id>)
                                                    const isUnicodeEmoji = emojiStr && !emojiStr.startsWith( "<" );
                                                    return {
                                                        value: opt.value ?? "",
                                                        label: isUnicodeEmoji ? `${ emojiStr } ${ label }` : label
                                                    };
                                                } ) ?? [];

                                                const options = definitionOptions.length > 0 ? definitionOptions : edgeOptions;
                                                const selectedValue = selectedSelectValues[ element.name ] ?? "";

                                                const hasHandle = stateTrigger || flowTrigger;
                                                const handlePosition = stateTrigger?.handlePosition ?? flowTrigger?.handlePosition ?? "bottom";

                                                return (
                                                    <div key={ element.name } className="relative flex-1 min-w-[180px]">
                                                        <div className="relative">
                                                            <select
                                                                value={ selectedValue }
                                                                disabled={ element.definition?.disabled }
                                                                onChange={ ( e ) => {
                                                                    setSelectedSelectValues( prev => ( {
                                                                        ...prev,
                                                                        [ element.name ]: e.target.value
                                                                    } ) );
                                                                } }
                                                                className="w-full appearance-none px-3 py-2 pr-10 bg-[#1e1f22] border border-[#3f4147] rounded text-[#949ba4] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                                            >
                                                                <option value="" disabled>
                                                                    { getSelectPlaceholder( element ) }
                                                                </option>
                                                                { options.length > 0 ? options.map( ( option ) => (
                                                                    <option key={ option.value } value={ option.value }>
                                                                        { option.label }
                                                                    </option>
                                                                ) ) : (
                                                                    <option value="__empty" disabled>
                                                                        No options
                                                                    </option>
                                                                ) }
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            </div>
                                                        </div>

                                                        { hasHandle && (
                                                            <Handle
                                                                type="source"
                                                                position={ positionMap[ handlePosition ] }
                                                                id={ `btn-${ element.name }` }
                                                                className={ flowTrigger ? "bg-blue-400! w-2! h-2!" : "bg-emerald-400! w-2! h-2!" }
                                                            />
                                                        ) }
                                                    </div>
                                                );
                                            }

                                            const variant = getButtonVariant( element );
                                            const emoji = getButtonEmoji( element );
                                            const renderedEmoji = renderButtonEmoji( emoji );
                                            const modalTrigger = getModalTrigger( element.name );
                                            const flowTrigger = getFlowTrigger( element.name );
                                            const stateTrigger = getStateTransitionTrigger( element.name );

                                            const button = (
                                                <DiscordButton
                                                    variant={ variant }
                                                    label={ getElementLabel( element ) }
                                                    emoji={ renderedEmoji.emoji }
                                                    icon={ renderedEmoji.icon }
                                                    trailingIcon={ variant === "link" ? (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M10 5V3H5.375C4.06519 3 3 4.06519 3 5.375V18.625C3 19.936 4.06519 21 5.375 21H18.625C19.936 21 21 19.936 21 18.625V14H19V19H5V5H10Z" />
                                                            <path d="M21 2.99902H14V4.99902H17.586L9.29297 13.292L10.707 14.706L19 6.41302V9.99902H21V2.99902Z" />
                                                        </svg>
                                                    ) : undefined }
                                                />
                                            );

                                            if ( modalTrigger ) {
                                                const handlePos = positionMap[ modalTrigger.handlePosition ?? "bottom" ];

                                                return (
                                                    <div key={ element.name } className="relative">
                                                        { button }
                                                        <Handle
                                                            type="source"
                                                            position={ handlePos }
                                                            id={ `btn-${ element.name }` }
                                                            className="bg-pink-400! w-2! h-2!"
                                                        />
                                                    </div>
                                                );
                                            }

                                            if ( flowTrigger ) {
                                                const handlePos = positionMap[ flowTrigger.handlePosition ?? "bottom" ];

                                                return (
                                                    <div key={ element.name } className="relative">
                                                        { button }
                                                        <Handle
                                                            type="source"
                                                            position={ handlePos }
                                                            id={ `btn-${ element.name }` }
                                                            className="bg-amber-400! w-2! h-2!"
                                                        />
                                                    </div>
                                                );
                                            }

                                            if ( stateTrigger ) {
                                                const handlePos = positionMap[ stateTrigger.handlePosition ?? "bottom" ];

                                                return (
                                                    <div key={ element.name } className="relative">
                                                        { button }
                                                        <Handle
                                                            type="source"
                                                            position={ handlePos }
                                                            id={ `btn-${ element.name }` }
                                                            className="bg-emerald-400! w-2! h-2!"
                                                        />
                                                    </div>
                                                );
                                            }

                                            return <div key={ element.name }>{ button }</div>;
                                        } ) }
                                    </div>
                                ) ) }
                            </div>
                        ) }
                    </DiscordMessage>
                </div>
            </div>

            <Handle type="source" position={ Position.Bottom } id="bottom" className="bg-purple-400! w-2! h-2!" />
        </div>
    );
}
