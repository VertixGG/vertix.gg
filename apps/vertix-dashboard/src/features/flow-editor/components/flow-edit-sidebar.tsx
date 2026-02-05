import { useState, useEffect } from "react";
import { ArrowLeft, Type, FileText, Palette, Image, Grid3X3, MessageSquare, X, Smile, Link, Save, RotateCcw, Braces } from "lucide-react";

import zCore from "@zenflux/core";
import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";

import { getEmojiFromPreviewCache } from "@vertix.gg/utils/src/emoji-preview-cache";

import { useEditMode } from "@vertix.gg/dashboard/src/hooks/use-edit-mode";
import { useLanguageStore } from "@vertix.gg/dashboard/src/hooks/use-language-store";

import type { FlowEditorState } from "@vertix.gg/dashboard/src/features/flow-editor/commands/flow-editor-commands";
import type { ElementData } from "@vertix.gg/dashboard/src/features/flow-editor/lib/component-helpers";
import type { UIExportEmbedDefinition } from "@vertix.gg/definitions/src/ui-export-definitions";

const logger = zCore.modules.createLogger( "flow-edit-sidebar" );

interface FlowEditSidebarSelectedState {
    selectedNode: FlowEditorState[ "selectedNode" ];
    hasUnsavedChanges: FlowEditorState[ "hasUnsavedChanges" ];
}

interface EmbedData {
    title?: string;
    description?: string;
    color?: number;
    image?: { url: string };
    thumbnail?: { url: string };
}

// Parse Discord custom emoji format: <:name:id> or <a:name:id>
function parseDiscordEmoji( emojiString: string ): { animated: boolean; name: string; id: string } | null {
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

// Resolve emoji - handles Discord format <:name:id>, unicode emojis, and cache lookup
function resolveEmoji( emojiValue: string | undefined ): { markdown: string; url: string; name: string } | null {
    if ( !emojiValue ) {
        return null;
    }

    // If it's already in Discord format, parse and return it
    const parsed = parseDiscordEmoji( emojiValue );
    if ( parsed ) {
        const ext = parsed.animated ? "gif" : "png";
        return {
            markdown: emojiValue,
            url: `https://cdn.discordapp.com/emojis/${ parsed.id }.${ ext }`,
            name: parsed.name
        };
    }

    // Try to look up the emoji by name in the cache (for base names like "ChannelRename")
    const cached = getEmojiFromPreviewCache( emojiValue );
    if ( cached ) {
        const parsedCached = parseDiscordEmoji( cached.markdown );
        return {
            markdown: cached.markdown,
            url: cached.url,
            name: parsedCached?.name ?? emojiValue
        };
    }

    // Treat as unicode emoji or plain text - no URL needed
    return {
        markdown: emojiValue,
        url: "",
        name: emojiValue
    };
}

function EmojiPreview( { emoji }: { emoji: string } ) {
    if ( !emoji ) {
        return null;
    }

    const resolved = resolveEmoji( emoji );

    if ( resolved?.url ) {
        return (
            <img
                src={ resolved.url }
                alt={ `:${ resolved.name }:` }
                className="w-5 h-5"
            />
        );
    }

    // Unicode emoji or unresolved
    return <span className="text-base">{ emoji }</span>;
}

const BUTTON_STYLES = [
    { value: "primary", label: "Primary", color: "bg-blue-600" },
    { value: "secondary", label: "Secondary", color: "bg-zinc-600" },
    { value: "success", label: "Success", color: "bg-green-600" },
    { value: "danger", label: "Danger", color: "bg-red-600" },
    { value: "link", label: "Link", color: "bg-zinc-700" },
] as const;

// Extract variable placeholders from text (e.g., {varName})
function extractVariables( text: string | undefined ): string[] {
    if ( !text ) return [];
    const matches = text.match( /\{([a-zA-Z0-9_]+)\}/g );
    return matches ? [ ...new Set( matches.map( m => m.slice( 1, -1 ) ) ) ] : [];
}

// Strip template braces from a string: "{varName}" → "varName", leaves non-template strings unchanged.
function stripTemplateBraces( value: string ): string {
    const match = value.match( /^\{([a-zA-Z0-9_]+)\}$/ );
    return match ? match[ 1 ] : value;
}

// Normalize an option value: options can be a plain string or a Record<string, string>.
// Returns only Record<string, string> or undefined to simplify rendering.
function normalizeOptionValue( raw: unknown ): { asString?: string; asRecord?: Record<string, string> } | undefined {
    if ( !raw ) return undefined;
    if ( typeof raw === "string" ) return { asString: raw };
    if ( typeof raw === "object" && !Array.isArray( raw ) ) return { asRecord: raw as Record<string, string> };
    return undefined;
}

interface VarInfo {
    defaultValue?: string;
    previewValue?: string;
    optionString?: string;
    optionRecord?: Record<string, string>;
}

// Collect all variables from an embed definition with their default values and preview data
function collectEmbedVariables(
    embedDefinition: UIExportEmbedDefinition | undefined,
    embedPreviewVars?: Record<string, string>
): Map<string, VarInfo> {
    const allVars = new Map<string, VarInfo>();

    if ( !embedDefinition ) return allVars;

    // Extract vars from title and description
    const titleVars = extractVariables( embedDefinition.title );
    const descVars = extractVariables( embedDefinition.description );
    const footerVars = extractVariables( embedDefinition.footer );
    const allVarNames = [ ...new Set( [ ...titleVars, ...descVars, ...footerVars ] ) ];

    // Note: `vars` field contains template placeholders like "{varName}" — NOT actual values.
    // Only `defaultVars` contains real resolved default values from setDefaultVars() callback.
    // `embedPreviewVars` contains merged preview data (defaultVars + previewDefaultVars from state).
    allVarNames.forEach( varName => {

        const defaultValue = embedDefinition.defaultVars?.[ varName ];
        const previewValue = embedPreviewVars?.[ varName ];
        const normalized = normalizeOptionValue( embedDefinition.options?.[ varName ] );
        allVars.set( varName, { defaultValue, previewValue, optionString: normalized?.asString, optionRecord: normalized?.asRecord } );
    } );

    // Also add vars from defaultVars that might not be in title/description
    if ( embedDefinition.defaultVars ) {
        Object.entries( embedDefinition.defaultVars ).forEach( ( [ varName, value ] ) => {
            if ( !allVars.has( varName ) ) {
                const previewValue = embedPreviewVars?.[ varName ];
                const normalized = normalizeOptionValue( embedDefinition.options?.[ varName ] );
                allVars.set( varName, {
                    defaultValue: value,
                    previewValue,
                    optionString: normalized?.asString,
                    optionRecord: normalized?.asRecord
                } );
            }
        } );
    }

    // Add vars from preview that aren't already collected (preview-only vars from previewDefaultVars)
    if ( embedPreviewVars ) {
        Object.entries( embedPreviewVars ).forEach( ( [ varName, value ] ) => {
            if ( !allVars.has( varName ) ) {
                const normalized = normalizeOptionValue( embedDefinition.options?.[ varName ] );
                allVars.set( varName, {
                    previewValue: value,
                    optionString: normalized?.asString,
                    optionRecord: normalized?.asRecord
                } );
            }
        } );
    }

    // Add vars referenced in the vars field (template placeholders) without defaults
    if ( embedDefinition.vars ) {
        Object.keys( embedDefinition.vars ).forEach( varName => {
            if ( !allVars.has( varName ) ) {
                const previewValue = embedPreviewVars?.[ varName ];
                const normalized = normalizeOptionValue( embedDefinition.options?.[ varName ] );
                allVars.set( varName, {
                    // No defaultValue — vars field only contains {placeholder} strings
                    previewValue,
                    optionString: normalized?.asString,
                    optionRecord: normalized?.asRecord
                } );
            }
        } );
    }

    return allVars;
}

// Extract leading emoji from a string (handles unicode emojis at the start)
function extractLeadingEmoji( text: string ): { emoji: string; rest: string } | null {
    if ( !text ) {
        return null;
    }

    // Match unicode emoji at the start of the string
    // This regex matches most common emoji patterns including skin tones and ZWJ sequences
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u;
    const match = text.match( emojiRegex );

    if ( match && match[ 0 ] ) {
        const emoji = match[ 0 ];
        const rest = text.slice( emoji.length ).trim();
        return { emoji, rest };
    }

    return null;
}

function ElementEditPanel( {
    element,
    onClose,
    onUpdate
}: {
    element: ElementData;
    onClose: () => void;
    onUpdate: ( field: string, value: string | boolean ) => void;
} ) {
    const label = element.definition?.label ?? "";
    const definedEmoji = element.definition?.emoji ?? "";

    // If emoji field is empty but label starts with an emoji, extract it
    let displayLabel = label;
    let displayEmoji = definedEmoji;

    if ( !definedEmoji && label ) {
        const extracted = extractLeadingEmoji( label );
        if ( extracted ) {
            displayEmoji = extracted.emoji;
            displayLabel = extracted.rest;
        }
    }

    const handleLabelChange = ( newLabel: string ) => {
        // If we extracted emoji from label, recombine them when saving
        if ( !definedEmoji && displayEmoji ) {
            onUpdate( "label", `${ displayEmoji } ${ newLabel }`.trim() );
        } else {
            onUpdate( "label", newLabel );
        }
    };

    const handleEmojiChange = ( newEmoji: string ) => {
        if ( !definedEmoji && element.definition?.label ) {
            // Update the label with new emoji prefix
            const labelWithoutEmoji = displayLabel;
            onUpdate( "label", newEmoji ? `${ newEmoji } ${ labelWithoutEmoji }`.trim() : labelWithoutEmoji );
        } else {
            onUpdate( "emoji", newEmoji );
        }
    };

    return (
        <div className="mt-3 p-3 bg-zinc-800 border border-zinc-600 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-zinc-300">
                    { element.name.split( "/" ).pop() }
                </h4>
                <button
                    onClick={ onClose }
                    className="text-zinc-400 hover:text-white"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <Type className="w-3 h-3" />
                            Label
                        </label>
                        <input
                            type="text"
                            value={ displayLabel }
                            onChange={ ( e ) => handleLabelChange( e.target.value ) }
                            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="w-24">
                        <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <Smile className="w-3 h-3" />
                            Emoji
                        </label>
                        <div className="flex items-center gap-1">
                            <div className="w-6 h-6 flex items-center justify-center bg-zinc-900 border border-zinc-600 rounded">
                                <EmojiPreview emoji={ displayEmoji } />
                            </div>
                            <input
                                type="text"
                                value={ displayEmoji }
                                onChange={ ( e ) => handleEmojiChange( e.target.value ) }
                                placeholder="Emoji"
                                className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Style</label>
                    <div className="flex flex-wrap gap-1">
                        { BUTTON_STYLES.map( ( style ) => (
                            <button
                                key={ style.value }
                                onClick={ () => onUpdate( "style", style.value ) }
                                className={ `px-2 py-0.5 rounded text-xs transition-colors ${
                                    element.definition?.style === style.value
                                        ? `${ style.color } text-white ring-1 ring-white/50`
                                        : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                                }` }
                            >
                                { style.label }
                            </button>
                        ) ) }
                    </div>
                </div>
                { ( element.definition?.style === "link" || element.definition?.elementType === "button-url" ) && (
                    <div>
                        <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <Link className="w-3 h-3" />
                            URL
                        </label>
                        <input
                            type="text"
                            value={ element.definition?.url ?? "" }
                            onChange={ ( e ) => onUpdate( "url", e.target.value ) }
                            placeholder="https://..."
                            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                ) }
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="element-disabled"
                        checked={ element.definition?.disabled ?? false }
                        onChange={ ( e ) => onUpdate( "disabled", e.target.checked ) }
                        className="w-3 h-3 rounded border-zinc-600 bg-zinc-900 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="element-disabled" className="text-xs text-zinc-500">
                        Disabled
                    </label>
                </div>
            </div>
        </div>
    );
}

export function FlowEditSidebar() {
    const { editingFlowName, exitEditMode, customization, isLoadingCustomization } = useEditMode();
    const selectedLanguage = useLanguageStore( ( state ) => state.selectedLanguage );
    const translations = useLanguageStore( ( state ) => state.translations );
    const [ selectedElementIndex, setSelectedElementIndex ] = useState<{ row: number; col: number } | null>( null );
    const [ lastNodeId, setLastNodeId ] = useState<string | null>( null );
    const [ appliedCustomization, setAppliedCustomization ] = useState<string | null>( null );

    const [ state ] = useCommandState<FlowEditorState, FlowEditSidebarSelectedState>(
        "Dashboard/FlowEditor",
        ( state: FlowEditorState ): FlowEditSidebarSelectedState => ( {
            selectedNode: state.selectedNode,
            hasUnsavedChanges: state.hasUnsavedChanges
        } )
    );

    const updateNodeData = useCommand( "Dashboard/FlowEditor/UpdateNodeData" );
    const restoreNodeData = useCommand( "Dashboard/FlowEditor/RestoreNodeData" );
    const saveNodeChanges = useCommand( "Dashboard/FlowEditor/SaveNodeChanges" );

    const flowShortName = editingFlowName?.split( "/" ).pop() ?? "Flow";
    const selectedNode = state.selectedNode;

    // Clear selected element when node changes
    useEffect( () => {
        if ( selectedNode?.id !== lastNodeId ) {
            setSelectedElementIndex( null );
            setLastNodeId( selectedNode?.id ?? null );
            // Reset applied customization tracking when node changes
            setAppliedCustomization( null );
        }
    }, [ selectedNode?.id, lastNodeId ] );

    // Apply language translations + saved customizations to node data when customization/translations are loaded
    useEffect( () => {
        const customizationKey = selectedNode?.data?.customizationKey as string | undefined;
        const embedName = selectedNode?.data?.embedName as string | undefined;

        logger.debug( FlowEditSidebar, "Customization effect running", {
            isLoadingCustomization,
            hasCustomization: !!customization,
            hasSelectedNode: !!selectedNode,
            customizationKey,
            selectedLanguage
        } );

        if ( isLoadingCustomization ) {
            return;
        }

        if ( !selectedNode ) {
            return;
        }

        // Only apply once per node+language+translation combination to avoid infinite loops
        const translationKey = translations ? JSON.stringify( translations.embeds[ embedName ?? "" ] ?? null ) : "null";
        const langKey = customizationKey ? `${ customizationKey }::${ selectedLanguage }` : undefined;
        const componentCustomization = ( customization && customizationKey && langKey )
            ? ( customization.components[ langKey ] ?? customization.components[ customizationKey ] )
            : undefined;

        const appliedKey = `${ selectedNode.id }-${ selectedLanguage }-${ translationKey }-${ JSON.stringify( componentCustomization ) }`;
        if ( appliedCustomization === appliedKey ) {
            return;
        }

        // Apply base language translations first
        if ( translations && embedName ) {
            const embedTranslation = translations.embeds[ embedName ];
            if ( embedTranslation ) {
                if ( embedTranslation.title !== undefined ) {
                    updateNodeData.run( { path: "embed.title", value: embedTranslation.title, isInitialLoad: true } );
                }
                if ( embedTranslation.description !== undefined ) {
                    updateNodeData.run( { path: "embed.description", value: embedTranslation.description, isInitialLoad: true } );
                }
            }
        }

        // Then apply customization overrides on top
        if ( componentCustomization?.embedOverrides ) {
            logger.debug( FlowEditSidebar, "Applying saved customization to node", { customizationKey, langKey, embedOverrides: componentCustomization.embedOverrides } );

            const { color, title, description } = componentCustomization.embedOverrides;

            if ( color !== undefined ) {
                updateNodeData.run( { path: "embed.color", value: color, isInitialLoad: true } );
            }
            if ( title !== undefined ) {
                updateNodeData.run( { path: "embed.title", value: title, isInitialLoad: true } );
            }
            if ( description !== undefined ) {
                updateNodeData.run( { path: "embed.description", value: description, isInitialLoad: true } );
            }
        }

        setAppliedCustomization( appliedKey );
    }, [ customization, translations, selectedNode, isLoadingCustomization, appliedCustomization, selectedLanguage, updateNodeData ] );

    const nodeType = selectedNode?.data?.type as string | undefined;

    const embed = selectedNode?.data?.embed as EmbedData | undefined;
    const elementRows = selectedNode?.data?.elementRows as ElementData[][] | undefined;
    const embedDefinition = selectedNode?.data?.embedDefinition as UIExportEmbedDefinition | undefined;

    const isComponentNode = nodeType === "component";
    const previewVars = selectedNode?.data?.previewVars as Record<string, string> | undefined;
    const embedVariables = collectEmbedVariables( embedDefinition, previewVars );
    const varEntries = Array.from( embedVariables.entries() ).sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) );

    const selectedElement = selectedElementIndex && elementRows
        ? elementRows[ selectedElementIndex.row ]?.[ selectedElementIndex.col ]
        : null;

    const handleUpdateEmbed = ( field: string, value: string | number ) => {
        updateNodeData.run( { path: `embed.${ field }`, value } );
    };

    const handleColorChange = ( hexColor: string ) => {
        const colorNum = parseInt( hexColor.replace( "#", "" ), 16 );
        handleUpdateEmbed( "color", colorNum );
    };

    const handleUpdateElement = ( field: string, value: string | boolean ) => {
        if ( !selectedElementIndex ) return;
        const path = `elementRows.${ selectedElementIndex.row }.${ selectedElementIndex.col }.definition.${ field }`;
        updateNodeData.run( { path, value } );
    };

    const handleSelectElement = ( rowIndex: number, colIndex: number ) => {
        if ( selectedElementIndex?.row === rowIndex && selectedElementIndex?.col === colIndex ) {
            setSelectedElementIndex( null );
        } else {
            setSelectedElementIndex( { row: rowIndex, col: colIndex } );
        }
    };

    return (
        <aside className="h-full bg-zinc-800 border-r border-zinc-700 flex flex-col">
            <div className="p-4 border-b border-zinc-700">
                <button
                    onClick={ exitEditMode }
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-3"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Overview</span>
                </button>
                <h2 className="text-md font-semibold text-white">Edit Mode</h2>
                <p className="text-sm text-zinc-400 mt-1 truncate" title={ editingFlowName ?? undefined }>
                    { flowShortName }
                </p>
            </div>

            <div className="flex-1 overflow-y-auto">
                { isComponentNode && selectedNode ? (
                    <div key={ selectedNode.id } className="p-4 space-y-4">
                        { /* Embed Section */ }
                        { embed && (
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" />
                                    Embed
                                </h3>
                                <div className="space-y-2">
                                    { embed.title !== undefined && (
                                        <div className="bg-zinc-700/50 rounded-lg p-3">
                                            <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                                                <Type className="w-3 h-3" />
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={ embed.title ?? "" }
                                                onChange={ ( e ) => handleUpdateEmbed( "title", e.target.value ) }
                                                className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    ) }
                                    { embed.description !== undefined && (
                                        <div className="bg-zinc-700/50 rounded-lg p-3">
                                            <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                                                <FileText className="w-3 h-3" />
                                                Description
                                            </label>
                                            <textarea
                                                value={ embed.description ?? "" }
                                                onChange={ ( e ) => handleUpdateEmbed( "description", e.target.value ) }
                                                rows={ 8 }
                                                className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none resize-y"
                                            />
                                        </div>
                                    ) }
                                    { embed.color !== undefined && (
                                        <div className="bg-zinc-700/50 rounded-lg p-3">
                                            <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                                                <Palette className="w-3 h-3" />
                                                Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={ `#${ embed.color.toString( 16 ).padStart( 6, "0" ) }` }
                                                    onChange={ ( e ) => handleColorChange( e.target.value ) }
                                                    className="w-8 h-8 rounded border border-zinc-600 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={ `#${ embed.color.toString( 16 ).padStart( 6, "0" ) }` }
                                                    onChange={ ( e ) => handleColorChange( e.target.value ) }
                                                    className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    ) }
                                    { embed.image?.url && (
                                        <div className="bg-zinc-700/50 rounded-lg p-3">
                                            <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                                                <Image className="w-3 h-3" />
                                                Image URL
                                            </label>
                                            <input
                                                type="text"
                                                value={ embed.image.url }
                                                onChange={ ( e ) => updateNodeData.run( { path: "embed.image.url", value: e.target.value } ) }
                                                className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    ) }
                                </div>
                            </div>
                        ) }

                        { /* Elements Section */ }
                        { elementRows && elementRows.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Grid3X3 className="w-3 h-3" />
                                    Elements
                                </h3>
                                <div className="space-y-2">
                                    { elementRows.map( ( row, rowIndex ) => {
                                        const rowHasSelectedElement = selectedElementIndex?.row === rowIndex;

                                        return (
                                            <div key={ rowIndex } className="bg-zinc-700/50 rounded-lg p-2">
                                                <div className="text-xs text-zinc-500 mb-2">Row { rowIndex + 1 }</div>
                                                <div className="flex flex-wrap gap-1">
                                                    { row.map( ( element, colIndex ) => {
                                                        const elementType = element.definition?.elementType ?? "button";
                                                        const isButton = elementType === "button" || elementType === "button-url" || elementType === "link";
                                                        const isSelect = elementType.includes( "select" );
                                                        const isSelected = selectedElementIndex?.row === rowIndex && selectedElementIndex?.col === colIndex;

                                                        return (
                                                            <button
                                                                key={ colIndex }
                                                                onClick={ () => handleSelectElement( rowIndex, colIndex ) }
                                                                className={ `px-2 py-1 rounded text-xs transition-colors ${
                                                                    isSelected
                                                                        ? "ring-2 ring-blue-400 bg-blue-600 text-white"
                                                                        : isSelect
                                                                            ? "bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 border border-purple-500/50"
                                                                            : isButton
                                                                                ? "bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/50"
                                                                                : "bg-zinc-600/50 text-zinc-300 hover:bg-zinc-600 border border-zinc-500/50"
                                                                }` }
                                                                title={ element.name }
                                                            >
                                                                { element.name.split( "/" ).pop() }
                                                            </button>
                                                        );
                                                    } ) }
                                                </div>
                                                { rowHasSelectedElement && selectedElement && (
                                                    <ElementEditPanel
                                                        key={ selectedElement.name }
                                                        element={ selectedElement }
                                                        onClose={ () => setSelectedElementIndex( null ) }
                                                        onUpdate={ handleUpdateElement }
                                                    />
                                                ) }
                                            </div>
                                        );
                                    } ) }
                                </div>
                            </div>
                        ) }

                        { /* Variables Section */ }
                        { varEntries.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Braces className="w-3 h-3" />
                                    Variables ({ varEntries.length })
                                </h3>
                                <div className="space-y-2">
                                    { varEntries.map( ( [ varName, varInfo ] ) => {
                                        const hasOptionRecord = varInfo.optionRecord && Object.keys( varInfo.optionRecord ).length > 0;
                                        const displayDefault = varInfo.defaultValue || varInfo.optionString;
                                        const displayPreview = varInfo.previewValue;

                                        return (
                                            <div key={ varName } className="bg-zinc-700/50 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <code className="text-blue-400 text-xs font-mono bg-zinc-800 px-1.5 py-0.5 rounded truncate">
                                                        { `{${ varName }}` }
                                                    </code>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        { hasOptionRecord && (
                                                            <span className="text-[10px] text-purple-400 bg-purple-900/30 px-1.5 py-0.5 rounded">
                                                                options
                                                            </span>
                                                        ) }
                                                    </div>
                                                </div>
                                                { displayDefault && (
                                                    <div className="mt-1">
                                                        <span className="text-[10px] text-zinc-500">Default: </span>
                                                        <span className="text-[10px] text-zinc-400">{ displayDefault }</span>
                                                    </div>
                                                ) }
                                                { displayPreview && (
                                                    <div className="mt-1">
                                                        <span className="text-[10px] text-cyan-500 bg-cyan-900/30 px-1 py-0.5 rounded">preview</span>
                                                        <span className="text-[10px] text-cyan-400/70 ml-1">{ displayPreview }</span>
                                                    </div>
                                                ) }
                                                { hasOptionRecord && (
                                                    <div className="mt-1 space-y-0.5">
                                                        { Object.entries( varInfo.optionRecord! ).map( ( [ optKey, optValue ] ) => (
                                                            <div key={ optKey } className="text-[10px] text-zinc-500">
                                                                <span className="text-zinc-400">{ stripTemplateBraces( optKey ) }</span>: { optValue }
                                                            </div>
                                                        ) ) }
                                                    </div>
                                                ) }
                                            </div>
                                        );
                                    } ) }
                                </div>
                            </div>
                        ) }

                        { !embed && ( !elementRows || elementRows.length === 0 ) && (
                            <div className="text-zinc-500 text-sm text-center py-4">
                                No editable content
                            </div>
                        ) }
                    </div>
                ) : (
                    <div className="p-4 text-zinc-500 text-sm text-center mt-8">
                        { selectedNode
                            ? `Select a component to edit (current: ${ nodeType })`
                            : "Click a component to edit"
                        }
                    </div>
                ) }
            </div>

            <div className="p-4 border-t border-zinc-700 space-y-3">
                <div className="flex gap-2">
                    <button
                        onClick={ () => saveNodeChanges.run( {} ) }
                        disabled={ !state.hasUnsavedChanges }
                        className={ `flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                            state.hasUnsavedChanges
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                        }` }
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                    <button
                        onClick={ () => restoreNodeData.run( {} ) }
                        disabled={ !state.hasUnsavedChanges }
                        className={ `flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                            state.hasUnsavedChanges
                                ? "bg-zinc-600 hover:bg-zinc-500 text-white"
                                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                        }` }
                    >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                    </button>
                </div>
                { state.hasUnsavedChanges && (
                    <div className="text-xs text-amber-400 text-center">
                        You have unsaved changes
                    </div>
                ) }
            </div>
        </aside>
    );
}
