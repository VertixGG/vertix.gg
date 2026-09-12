import { useMemo, useState } from "react";

import { Handle, Position, useStore } from "@xyflow/react";

import { DiscordMessage, DiscordEmbed, DiscordButton } from "@vertix.gg/discord-ui/src";

import {
    getElementLabel,
    isSelectMenu,
    COMPONENT_NODE_MAX_WIDTH
} from "@vertix.gg/dashboard/src/features/flow-editor/lib/element-metrics";

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
    /** The same elements in this generator's rows, when the editor is scoped to one. */
    previewElementRows?: ElementData[][];
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

function getSelectPlaceholder( element: ElementData, defaultVars: Record<string, string> | undefined ): string {
    if ( element.definition?.placeholder ) {
        return applyDefaultVars( element.definition.placeholder, defaultVars );
    }

    return resolveElementLabel( element, defaultVars );
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

// Discord draws an emoji at 18px in body text and at 1.375em - 22px against a 16px title - in a
// heading, both sitting on the line's bottom edge so they never stretch the line box.
const EMOJI_PIXELS = { body: 18, title: 22 } as const;

function renderDiscordEmojiHtml( emojiString: string, context: keyof typeof EMOJI_PIXELS ): string {
    const parsed = parseDiscordEmoji( emojiString );
    if ( !parsed ) {
        return emojiString;
    }

    const ext = parsed.animated ? "gif" : "png";
    const url = `https://cdn.discordapp.com/emojis/${ parsed.id }.${ ext }`;
    const size = EMOJI_PIXELS[ context ];

    return `<img src="${ url }" alt=":${ parsed.name }:" width="${ size }" height="${ size }" style="vertical-align:bottom;display:inline-block;" />`;
}

function applyDefaultVars( template: string, defaultVars: Record<string, string> | undefined ): string {
    if ( !defaultVars ) {
        return template;
    }

    return template.replace( /\{([a-zA-Z0-9_]+)\}/g, ( full, key: string ) => defaultVars[ key ] ?? full );
}

/** A variable can name another - `{displayText}` resolves to `{privateText}` before it reads "Private". */
const VAR_RESOLVE_PASSES = 4;

/**
 * Function resolveElementLabel() :: An element's label with the templates in it filled in.
 *
 * An element that names itself at runtime carries a template rather than words, and what fills it
 * in is the element's own options - so those are read first, under the embed's variables. Resolved
 * repeatedly because one variable can name another, and stops as soon as nothing changes.
 */
function resolveElementLabel( element: ElementData, defaultVars: Record<string, string> | undefined ): string {
    const label = getElementLabel( element );

    if ( ! label.includes( "{" ) ) {
        return label;
    }

    const options = element.definition?.options as Record<string, string> | undefined;
    const vars = { ...defaultVars, ...options };

    let resolved = label;

    for ( let pass = 0; pass < VAR_RESOLVE_PASSES; pass++ ) {
        const next = applyDefaultVars( resolved, vars );

        if ( next === resolved ) {
            break;
        }

        resolved = next;
    }

    return resolved;
}

function replaceInlineDiscordEmojis( input: string, context: keyof typeof EMOJI_PIXELS = "body" ): string {
    return input.replace( /<(a)?:([a-zA-Z0-9_]+):(\d+)>/g, ( match ) => renderDiscordEmojiHtml( match, context ) );
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
                className="w-[1.375em] h-[1.375em] inline-block align-middle"
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
    const { label, embed, buttonModalTriggers, buttonFlowTriggers, stateTransitionTriggers } = data;

    // What a channel will actually draw: the generator's arrangement when the editor is scoped to
    // one, and the component's own rows otherwise.
    const elementRows = data.previewElementRows ?? data.elementRows;

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
        // Sized the way discord sizes a message: the browser lays the content out and the box
        // shrinks to fit it - the embed caps itself, the buttons take the width their labels need,
        // and a row wraps only when it genuinely runs out of room.
        <div className="min-w-[380px] relative" style={ { maxWidth: COMPONENT_NODE_MAX_WIDTH } }>
            <Handle type="target" position={ Position.Top } className="bg-purple-400! w-2! h-2!" />
            <Handle type="target" position={ Position.Left } id="left" className="bg-emerald-400! w-2! h-2!" />
            <Handle type="target" position={ Position.Right } id="right" className="bg-emerald-400! w-2! h-2!" />

            <div className={ `bg-zinc-900 rounded-lg border border-purple-500/50 shadow-lg shadow-purple-500/20 overflow-hidden transition-all ${ selectedClass }` }>
                <div className="px-3 py-2 bg-purple-600/20 border-b border-purple-500/30">
                    <span className="text-[9px] text-purple-300 uppercase tracking-wider">Component</span>
                    <div className="text-white font-semibold text-sm whitespace-pre-line">{ label }</div>
                </div>

                <div className="bg-[#313338] p-4">
                    <DiscordMessage author="VoiceChannels" app timestamp="" avatar="/vc.png">
                        <DiscordEmbed
                            title={ replaceInlineDiscordEmojis( applyDefaultVars( embed?.title || label, mergedDefaultVars ), "title" ) }
                            description={ embed
                                ? embed.description
                                    ? replaceInlineDiscordEmojis( applyDefaultVars( embed.description, mergedDefaultVars ) )
                                    : undefined
                                : "Component preview"
                            }
                            color={ embed?.color || 0x5865f2 }
                            // The legend is fetched by url, and that url carries the buttons it is
                            // a legend for - so it needs its variables filled in like any other
                            // part of the embed, or it renders every button the bot ships.
                            image={ embed?.image
                                ? { ...embed.image, url: applyDefaultVars( embed.image.url, mergedDefaultVars ) }
                                : undefined }
                            thumbnail={ embed?.thumbnail }
                        />
                        { elementRows && elementRows.length > 0 && (
                            <div className="discord-action-rows">
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
                                                    <div key={ element.name } className="relative w-[400px] max-w-full">
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
                                                                // Discord's own select box: 400px wide unless the column is narrower, 40px
                                                                // tall, 8px radius, and 12px/42px of padding around a 16px label.
                                                                className="w-full h-10 appearance-none pl-3 pr-[42px] bg-[#1e1f22] border border-[#3f4147] rounded-lg text-[#949ba4] text-base focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                                            >
                                                                <option value="" disabled>
                                                                    { getSelectPlaceholder( element, mergedDefaultVars ) }
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
                                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                                                    label={ resolveElementLabel( element, mergedDefaultVars ) }
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
