import * as React from "react";

import { DiscordButton } from "./discord-button";
import { DiscordEmbed } from "./discord-embed";
import { DiscordSelectMenu } from "./discord-select-menu";
import { DiscordSelectMenuDropdown } from "./discord-select-menu-dropdown";
import { getDiscordEmojiIconSrc, isDiscordMarkup } from "./discord-emojis";

import { findUIEmbedDefinition, getUIComponentByName } from "./ui-definitions";

import type { UIButtonStyle, UIComponent, UIElementItem, UIEmbedArrayOption, UIEmbedDefinition, UIEmbedOptions, UISelectMenuDefinition } from "./ui-definitions";

type DiscordButtonVariant = "primary" | "secondary" | "success" | "danger" | "link" | "premium";

export interface UIElementOverride {
    label?: string;
    /**
     * What this one's own wording is written against, for an element the bot draws several of.
     *
     * A vote message carries a button per candidate, every one of them built from the same
     * declaration - "Vote {displayName}" - and told apart only by what that name resolves to.
     */
    variables?: Readonly<Record<string, string>>;
    disabled?: boolean;
    highlighted?: boolean;
    selectedLabel?: string;
    highlightedCaret?: boolean;
    hidden?: boolean;
    emoji?: string;
}

export interface UIEmbedOverride {
    title?: string;
    description?: string;
    color?: number | string;
    templateEmbedName?: string;
}

export interface ExpandedSelectMenuOption {
    // Set when the icon has already been resolved to an asset - `buildOptionIcon()` returns one or
    // the other, never both, so an option carrying this must not be resolved a second time.
    icon?: string;
    iconEmoji?: string;
    label: string;
    description?: string;
    selected?: boolean;
    highlighted?: boolean;
}

export interface ExpandedSelectMenuConfig {
    elementName: string;
    options?: ReadonlyArray<ExpandedSelectMenuOption>;
    highlightedValue?: string;
    selectedValues?: ReadonlyArray<string>;
}

/** One menu, or a panel's worth of them - a surface can put several side by side. */
export type ExpandedSelectMenus = ExpandedSelectMenuConfig | ReadonlyArray<ExpandedSelectMenuConfig>;

function asSelectMenuList( value: ExpandedSelectMenus | undefined ): ReadonlyArray<ExpandedSelectMenuConfig> {
    if ( !value ) {
        return [];
    }

    return Array.isArray( value ) ? value : [ value as ExpandedSelectMenuConfig ];
}

export interface DiscordUIComponentRendererProps {
    componentName: string;
    /**
     * Called with the element's name when one of the rendered buttons is pressed. Without it the
     * buttons are inert, the way a screenshot of Discord is.
     */
    onElementClick?: ( elementName: string ) => void;
    elementOverrides?: Readonly<Record<string, UIElementOverride>>;
    embedOverrides?: Readonly<Record<string, UIEmbedOverride>>;
    variables?: Readonly<Record<string, string>>;
    /**
     * Placeholders the bot declared for previewing this state, which lose to everything else.
     *
     * They are there so a preview is not full of raw tokens, not because they are what this
     * drawing says - so the embed's own working out, and anything the caller states, beat them.
     */
    defaultVariables?: Readonly<Record<string, string>>;
    emojiIconSrcByUnicode?: Readonly<Record<string, string>>;
    preferredEmbedsGroup?: string;
    preferredElementsGroup?: string;
    hideElements?: boolean;
    expandedSelectMenu?: ExpandedSelectMenus;
    /**
     * Called with the menu and the option picked from it. Without it a dropdown stays a picture,
     * which is all a page showing one wants; with it, the menu is one a person can actually use.
     */
    onSelectOption?: ( elementName: string, optionIndex: number ) => void;
}

interface ResolvedEmbedDefinition {
    title?: string;
    description?: string;
    color?: number | string;
    image?: string;
    thumbnail?: string;
    footer?: string;
}

export function DiscordUIComponentRenderer( {
    componentName,
    onElementClick,
    elementOverrides,
    embedOverrides,
    variables,
    defaultVariables,
    emojiIconSrcByUnicode,
    preferredEmbedsGroup,
    preferredElementsGroup,
    hideElements,
    expandedSelectMenu,
    onSelectOption,
}: DiscordUIComponentRendererProps ) {
    const selectMenus = asSelectMenuList( expandedSelectMenu );

    const [ component, setComponent ] = React.useState<UIComponent | null>( null );
    const [ resolvedEmbeds, setResolvedEmbeds ] = React.useState<ReadonlyArray<ResolvedEmbedDefinition>>( [] );
    const [ isLoading, setIsLoading ] = React.useState<boolean>( true );
    /*
     * A menu somebody can actually use starts closed, the way Discord hands it to you - you open it
     * yourself. A menu with no handler is not a menu, it is a picture of one, and a page showing a
     * single dropdown open is showing it open on purpose.
     */
    const [ expandedElementName, setExpandedElementName ] = React.useState<string | null>(
        !onSelectOption && 1 === selectMenus.length ? selectMenus[ 0 ]!.elementName : null
    );

    /**
     * An embed that counts down, kept counting.
     *
     * Nothing here knows how one counts. That is the embed's own working out, and it happens where
     * every other thing an embed works out happens - further down, as the message is resolved. All
     * this does is see that it is asked again a second later, because the answer it gave was only
     * true at the moment it was asked.
     */
    const endsAt = React.useMemo(
        () => embedCountdownOf( component, preferredEmbedsGroup, variables ),
        [ component, preferredEmbedsGroup, variables ]
    );

    const [ now, setNow ] = React.useState( () => Date.now() );

    React.useEffect( () => {
        if ( undefined === endsAt ) {
            return;
        }

        setNow( Date.now() );

        const tick = window.setInterval( () => {
            const at = Date.now();

            setNow( at );

            // Nothing left to count, and nothing it could say differently from here.
            if ( at >= endsAt ) {
                window.clearInterval( tick );
            }
        }, COUNTDOWN_TICK_MS );

        return () => window.clearInterval( tick );
    }, [ endsAt ] );

    React.useEffect( () => {
        let isMounted = true;

        void ( async() => {
            try {
                const resolvedComponent = await getUIComponentByName( componentName );

                if ( !isMounted ) {
                    return;
                }

                setComponent( resolvedComponent );

                if ( resolvedComponent ) {
                    const embedsGroup = selectEmbedsGroup( resolvedComponent, preferredEmbedsGroup );

                    if ( embedsGroup ) {
                        const promises = embedsGroup.items.map( async( item ) => {
                            let definition = item.definition;

                            const override = embedOverrides?.[ item.embed ];

                            if ( !definition && override?.templateEmbedName ) {
                                definition = await findUIEmbedDefinition( override.templateEmbedName ) ?? undefined;
                            }

                            if ( !definition ) {
                                // Fallback: try to find any definition for this embed name in the exports
                                definition = await findUIEmbedDefinition( item.embed ) ?? undefined;
                            }

                            return resolveEmbedDefinition( item.embed, definition, override, variables, defaultVariables );
                        } );

                        const resolved = await Promise.all( promises );
                        setResolvedEmbeds( resolved.filter( ( def ) => Boolean( def.title || def.description ) ) );
                    } else {
                        setResolvedEmbeds( [] );
                    }
                }
            } finally {
                if ( isMounted ) {
                    setIsLoading( false );
                }
            }
        } )();

        return () => {
            isMounted = false;
        };
    // `now` is in here because an embed that counts gave an answer true only when it was asked.
    }, [ componentName, embedOverrides, variables, defaultVariables, preferredEmbedsGroup, now ] );

    if ( isLoading ) {
        return null;
    }

    if ( !component ) {
        return null;
    }

    const elementsGroup = selectElementsGroup( component, preferredElementsGroup, hideElements );

    const hasSelectMenus = Boolean(
        elementsGroup?.items.some(
            ( row ) => row.some( ( item ) =>
                item.definition.elementType === "select-menu"
                || item.definition.elementType === "user-select"
                || item.definition.elementType === "channel-select"
                || item.definition.elementType === "role-select"
            )
        )
    );

    return (
        <>
            { resolvedEmbeds.map( ( embed, index ) => (
                <DiscordEmbed
                    key={ `embed-${ index }` }
                    title={ embed.title }
                    description={ embed.description }
                    thumbnail={ embed.thumbnail ? { url: embed.thumbnail } : undefined }
                    image={ embed.image ? { url: embed.image } : undefined }
                    color={ embed.color }
                    footer={ embed.footer ? { text: embed.footer } : undefined }
                    emojiIconSrcByUnicode={ emojiIconSrcByUnicode }
                />
            ) ) }

            { elementsGroup && (
                <div className={ hasSelectMenus ? "discord-action-rows discord-action-rows-has-select" : "discord-action-rows" }>
                    { renderElementRows( elementsGroup.items, {
                        variables: variables,
                        elementOverrides: elementOverrides,
                        onElementClick,
                        emojiIconSrcByUnicode,
                        // Kept with the embeds: a label that names the clock agrees with the text.
                        selectMenus,
                        expandedElementName,
                        onToggleExpand: ( elementName ) => {
                            setExpandedElementName( ( prev ) => prev === elementName ? null : elementName );
                        },
                        onSelectOption: onSelectOption
                            ? ( elementName, optionIndex ) => {
                                setExpandedElementName( null );
                                onSelectOption( elementName, optionIndex );
                            }
                            : undefined,
                    } ) }
                </div>
            ) }
        </>
    );
}

const COUNTDOWN_TICK_MS = 1000;

/**
 * Function formatEmbedArrays() :: A list, written out the way the embed writes lists.
 *
 * An embed that prints a list declares how - what wraps each entry, what goes between them, and for
 * entries that are more than a single value, how each of their fields reads. The bot walks that in
 * `UITemplateBase.parseLogicInternal()`; this is the same walk, so a list arrives here as a list
 * and leaves as the sentence the bot would have printed.
 */
function formatEmbedArrays(
    values: Readonly<Record<string, unknown>>,
    arrayOptions: Readonly<Record<string, UIEmbedArrayOption>> | undefined
): Record<string, string> {
    const formatted: Record<string, string> = {};

    for ( const [ name, option ] of Object.entries( arrayOptions ?? {} ) ) {
        const list = values[ name ];

        if ( !Array.isArray( list ) ) {
            continue;
        }

        const entry = ( value: unknown, separator: string ) =>
            applyVariables( option.format, { value: String( value ), separator } ) ?? "";

        formatted[ name ] = list
            .map( ( value, index ) => {
                const separator = index < list.length - 1 ? option.separator ?? "," : "";

                // An entry that is more than a single value has its own fields to read, and the
                // pieces are put together with the same separator before the entries are.
                if ( value && "object" === typeof value && !Array.isArray( value ) ) {
                    const fields = Object.values( option.options ?? {} )
                        .map( ( template ) => applyVariables( template, value as Record<string, string> ) ?? "" );

                    return fields
                        .map( ( field, at ) => entry( field, at < fields.length - 1 ? option.separator ?? "," : "" ) )
                        .join( "" ) + ( index < list.length - 1 ? option.multiSeparator ?? "" : "" );
                }

                return entry( value, separator );
            } )
            .join( "" );
    }

    return formatted;
}

/**
 * Function logicArgs() :: The arguments as the bot's own code expects to be handed them.
 *
 * Inside the bot an embed is given real values - a moment is a number, a count is a number - and
 * its working out is written for that: `new Date( args.timeEnd )` means one thing given a number
 * and something else entirely given the digits as text. Everything reaching a drawing out here is
 * text, because that is what a template gets filled in with, so a number written as one is handed
 * over as a number.
 */
function logicArgs( variables: Readonly<Record<string, string>> | undefined ): Record<string, unknown> {
    const args: Record<string, unknown> = {};

    for ( const [ name, value ] of Object.entries( variables ?? {} ) ) {
        args[ name ] = asLogicValue( value );
    }

    return args;
}

function asLogicValue( value: string ): unknown {
    if ( "true" === value || "false" === value ) {
        return "true" === value;
    }

    const asNumber = Number( value );

    if ( "" !== value.trim() && Number.isFinite( asNumber ) ) {
        return asNumber;
    }

    /*
     * A list or a bag of them, for the arguments that are one inside the bot - the users on a
     * channel's allow list, the votes a claim has counted. Only something already written as one
     * is read as one, so an ordinary sentence that happens to start with a bracket stays a
     * sentence when it turns out not to parse.
     */
    if ( value.startsWith( "[" ) || value.startsWith( "{" ) ) {
        try {
            return JSON.parse( value ) as unknown;
        } catch {
            return value;
        }
    }

    return value;
}

/** Where a countdown in this component runs out, where one of its embeds counts down. */
function embedCountdownOf(
    component: UIComponent | null,
    preferredEmbedsGroup: string | undefined,
    variables: Readonly<Record<string, string>> | undefined
): number | undefined {
    for ( const item of selectEmbedsGroup( component, preferredEmbedsGroup )?.items ?? [] ) {
        const endsAt = embedEndsAt( item.definition, variables );

        if ( undefined !== endsAt ) {
            return endsAt;
        }
    }

    return undefined;
}

/** The moment this embed counts down to, asked of the embed's own handler for it. */
function embedEndsAt(
    definition: UIEmbedDefinition | undefined,
    variables: Readonly<Record<string, string>> | undefined
): number | undefined {
    const endTime = definition?.logic?.endTime;

    if ( !endTime ) {
        return undefined;
    }

    try {
        const at = compileLogic( endTime.source, endTime.binds ?? [], definition?.vars )?.call(
            {},
            logicArgs( variables ),
            definition?.vars
        );

        const time = ( at as Date | undefined )?.getTime?.();

        return "number" === typeof time && Number.isFinite( time ) ? time : undefined;
    } catch {
        return undefined;
    }
}

/**
 * Compiled once per body, and there are far fewer bodies than embeds drawing them.
 *
 * Two shapes arrive. A `setLogic()` body is an expression and goes straight back in; the countdown
 * is a method - `name( args ) { … }` - which is only valid inside an object literal, so it goes back
 * through one and the first method on it is the one. Anything the body closed over is handed back
 * as a parameter of that name, which the exporter checked against the real thing before saying so.
 */
const compiledLogic = new Map<string, ( ( ...args: unknown[] ) => unknown ) | null>();

function compileLogic( source: string, binds: ReadonlyArray<string>, bound: unknown ) {
    const key = `${ binds.join( "," ) }|${ source }`;

    if ( !compiledLogic.has( key ) ) {
        try {
            const body = /^\s*(async\s+)?(function\b|\()/.test( source )
                ? `return ( ${ source } );`
                : `return Object.values( { ${ source } } )[ 0 ];`;

            compiledLogic.set( key, new Function( ...binds, body )( ...binds.map( () => bound ) ) as
                ( ...args: unknown[] ) => unknown );
        } catch {
            compiledLogic.set( key, null );
        }
    }

    return compiledLogic.get( key ) ?? null;
}

/**
 * Function runEmbedLogic() :: What an embed works out for itself, worked out by the embed.
 *
 * Every function behind it in turn, each one's answer laid over the last, exactly as the bot lays
 * them. What comes back comes back as it is - a word, a number, or a list still in pieces, because
 * a list has its own writing out to go through afterwards. A body that will not run says nothing at
 * all rather than half of something.
 */
function runEmbedLogic(
    definition: UIEmbedDefinition | undefined,
    variables: Readonly<Record<string, string>> | undefined
): { answers: Record<string, unknown>; read: ReadonlySet<string> } {
    const answers: Record<string, unknown> = {};

    /*
     * What the body asked for, which is what decides whose answer stands later.
     *
     * A name is often both a question and its answer - an embed is handed `userLimit` as a number
     * and prints `userLimit` as a word, having decided which word - and one it was never asked is
     * something it is filling in blind. Watching which it reaches for is the only way to tell the
     * two apart, and it costs one wrapper.
     */
    const read = new Set<string>();

    const args = new Proxy( logicArgs( variables ), {
        get: ( target, key ) => {
            if ( "string" === typeof key ) {
                read.add( key );
            }

            return Reflect.get( target, key ) as unknown;
        }
    } );

    const endsAt = embedEndsAt( definition, variables );

    // The one way everything here is called: arguments, vars, and an end time to hand whether or
    // not this particular body wants one.
    const context = { getEndTime: () => new Date( endsAt ?? Date.now() ) };

    for ( const { source, binds } of definition?.logic?.sources ?? [] ) {
        try {
            const answered = compileLogic( source, binds ?? [], definition?.vars )?.call(
                context,
                args,
                definition?.vars
            );

            for ( const [ name, value ] of Object.entries( answered as Record<string, unknown> ?? {} ) ) {
                if ( null !== value && undefined !== value ) {
                    answers[ name ] = value;
                }
            }
        } catch {
            continue;
        }
    }

    return { answers, read };
}

/** The answers a sentence can hold as they are - the rest has its own writing out to go through. */
function embedScalars( answers: Readonly<Record<string, unknown>> ): Record<string, string> {
    const scalars: Record<string, string> = {};

    for ( const [ name, value ] of Object.entries( answers ) ) {
        if ( "string" === typeof value || "number" === typeof value || "boolean" === typeof value ) {
            scalars[ name ] = String( value );
        }
    }

    return scalars;
}

/** Which embeds group is drawn, asked in one place rather than inline where it is needed. */
function selectEmbedsGroup( component: UIComponent | null, preferredEmbedsGroup: string | undefined ) {
    if ( !component ) {
        return null;
    }

    if ( preferredEmbedsGroup ) {
        const found = component.embedsGroups.find( ( group ) => group.name === preferredEmbedsGroup );

        if ( found ) {
            return found;
        }
    }

    return selectGroupByDefaultName( component.embedsGroups, component.defaultEmbedsGroup );
}

function selectElementsGroup(
    component: UIComponent,
    preferredElementsGroup: string | undefined,
    hideElements: boolean | undefined,
) {
    if ( hideElements ) {
        return null;
    }

    return selectGroupByDefaultName(
        component.elementsGroups,
        preferredElementsGroup ?? component.defaultElementsGroup
    );
}

function selectGroupByDefaultName<TGroup extends { name: string }>(
    groups: ReadonlyArray<TGroup>,
    preferredName: string | null,
): TGroup | null {
    if ( preferredName ) {
        const found = groups.find( ( group ) => group.name === preferredName );
        if ( found ) {
            return found;
        }
    }

    return groups[ 0 ] ?? null;
}

function resolveEmbedDefinition(
    _embedName: string,
    definition: UIEmbedDefinition | undefined,
    override: UIEmbedOverride | undefined,
    variables: Readonly<Record<string, string>> | undefined,
    defaultVariables: Readonly<Record<string, string>> | undefined,
): ResolvedEmbedDefinition {
    const title = override?.title ?? definition?.title;
    const description = override?.description ?? definition?.description;
    const color = override?.color ?? definition?.color;
    const image = definition?.image;
    const thumbnail = definition?.thumbnail;
    const footer = definition?.footer;

    /*
     * Four things want to fill the same names in, and they are worth this much each.
     *
     * A declared default is a placeholder, put there so a preview of this state is not full of raw
     * tokens, and is the weakest thing in the room. Above it sits what the embed worked out for a
     * name nobody gave it - a gap it can fill, but only a guess if the caller knew better. Above
     * that is what the caller passed, because the caller stands in for the service that decided it.
     *
     * Last comes what the embed made of an argument it was actually handed. A name is often both
     * the question and its answer - `userLimit` goes in a number and comes out a word - and there
     * the caller's value was the question, so the embed has the last word on the answer.
     */
    const given = { ...defaultVariables, ...variables };

    const { answers, read } = runEmbedLogic( definition, given );

    const asked = Object.fromEntries( Object.entries( answers ).filter( ( [ name ] ) => read.has( name ) ) ),
        unasked = Object.fromEntries( Object.entries( answers ).filter( ( [ name ] ) => !read.has( name ) ) );

    // A list is still in pieces at this point, from whichever side had it, and is written out the
    // way the embed writes lists.
    const lists = formatEmbedArrays( { ...logicArgs( given ), ...answers }, definition?.arrayOptions );

    const derived = {
        ...defaultVariables,
        ...embedScalars( unasked ),
        ...variables,
        ...embedScalars( asked ),
        ...lists
    };

    const resolved = expandEmbedOptions( derived, definition?.options );

    const resolvedTitle = applyVariables( title, resolved );
    const resolvedDescription = applyVariables( description, resolved );
    // The footer is written the same way the rest of the embed is and can carry variables of its
    // own, so it is resolved too rather than handed over as it was authored.
    const resolvedFooter = applyVariables( footer, resolved );

    return {
        title: resolvedTitle,
        description: resolvedDescription,
        color,
        image,
        thumbnail,
        footer: resolvedFooter,
    };
}

/**
 * Function expandEmbedOptions() :: Turns a variable standing at a token into the words it stands for.
 *
 * An embed that has several things it might say for one variable names them: `deliveryDisplay` is
 * either "they have been sent a link" or "their messages are closed". Which one is chosen is a
 * function of the arguments and cannot be exported; the choosing is done by whoever is drawing, and
 * this turns their answer - the token - into the sentence the bot would have printed.
 *
 * A value that is not one of the tokens is left exactly as it is, which is every ordinary variable.
 */
function expandEmbedOptions(
    variables: Readonly<Record<string, string>> | undefined,
    options: UIEmbedOptions | undefined
): Readonly<Record<string, string>> | undefined {
    if ( !variables || !options ) {
        return variables;
    }

    const expanded: Record<string, string> = { ...variables };

    for ( const [ name, choices ] of Object.entries( options ) ) {
        // A variable the embed gives one fixed value: it defines it, so whoever is drawing can
        // point at it by name instead of repeating the words.
        if ( "string" === typeof choices ) {
            expanded[ name ] = expanded[ name ] ?? choices;

            continue;
        }

        const chosen = expanded[ name ];

        if ( undefined !== chosen && Object.prototype.hasOwnProperty.call( choices, chosen ) ) {
            expanded[ name ] = choices[ chosen ]!;
        }
    }

    return expanded;
}

function applyVariables( text: string | undefined, variables: Readonly<Record<string, string>> | undefined ): string | undefined {
    if ( !text ) {
        return text;
    }

    let result = text;

    const ESCAPED_OPEN_BRACE = "\u0000OPEN\u0000";
    const ESCAPED_CLOSE_BRACE = "\u0000CLOSE\u0000";

    result = result.replace( /\\{/g, ESCAPED_OPEN_BRACE );
    result = result.replace( /\\}/g, ESCAPED_CLOSE_BRACE );

    if ( variables ) {
        let hasChanges = true;
        let iterations = 0;
        const maxIterations = 10;

        while ( hasChanges && iterations < maxIterations ) {
            hasChanges = false;
            iterations += 1;

            for ( const [ key, value ] of Object.entries( variables ) ) {
                const regex = new RegExp( `\\{${ key }\\}`, "g" );
                const newResult = result.replace( regex, value );

                if ( newResult !== result ) {
                    hasChanges = true;
                    result = newResult;
                }
            }
        }
    }

    result = result.replace( new RegExp( ESCAPED_OPEN_BRACE, "g" ), "{" );
    result = result.replace( new RegExp( ESCAPED_CLOSE_BRACE, "g" ), "}" );

    return result;
}

function renderElementRows(
    rows: ReadonlyArray<ReadonlyArray<UIElementItem>>,
    context: {
        variables: Readonly<Record<string, string>> | undefined;
        elementOverrides: Readonly<Record<string, UIElementOverride>> | undefined;
        emojiIconSrcByUnicode: Readonly<Record<string, string>> | undefined;
        selectMenus: ReadonlyArray<ExpandedSelectMenuConfig>;
        expandedElementName: string | null;
        onToggleExpand: ( elementName: string ) => void;
        onSelectOption?: ( elementName: string, optionIndex: number ) => void;
        onElementClick?: ( elementName: string ) => void;
    },
): React.ReactNode {
    const result: Array<React.ReactNode> = [];

    let rowIndex = 0;
    for ( const row of rows ) {
        const expandedRow = expandDynamicElementInstances( row, context.elementOverrides );
        const visibleRow = expandedRow.filter( ( item ) => !context.elementOverrides?.[ item.element ]?.hidden );
        if ( !visibleRow.length ) {
            continue;
        }

        const chunked = chunkBySize( visibleRow, 5 );

        for ( const chunk of chunked ) {
            result.push(
                <div key={ `row-${ rowIndex }` } className="discord-embed-button-row">
                    { chunk.map( ( item ) => renderElement( item, context ) ) }
                </div>
            );

            rowIndex += 1;
        }
    }

    return result;
}

function expandDynamicElementInstances(
    row: ReadonlyArray<UIElementItem>,
    overrides: Readonly<Record<string, UIElementOverride>> | undefined,
): Array<UIElementItem> {
    if ( !overrides ) {
        return [ ...row ];
    }

    const expanded: Array<UIElementItem> = [];

    for ( const item of row ) {
        const prefix = `${ item.element }:`;
        const instanceKeys = Object.keys( overrides ).filter( ( key ) => key.startsWith( prefix ) );

        if ( !instanceKeys.length ) {
            expanded.push( item );
            continue;
        }

        instanceKeys.forEach( ( key ) => {
            expanded.push( {
                element: key,
                definition: item.definition,
            } );
        } );
    }

    return expanded;
}

function renderElement(
    item: UIElementItem,
    context: {
        variables: Readonly<Record<string, string>> | undefined;
        elementOverrides: Readonly<Record<string, UIElementOverride>> | undefined;
        emojiIconSrcByUnicode: Readonly<Record<string, string>> | undefined;
        selectMenus: ReadonlyArray<ExpandedSelectMenuConfig>;
        expandedElementName: string | null;
        onToggleExpand: ( elementName: string ) => void;
        onSelectOption?: ( elementName: string, optionIndex: number ) => void;
        onElementClick?: ( elementName: string ) => void;
    },
): React.ReactNode {
    const override = context.elementOverrides?.[ item.element ];
    const definition = item.definition;

    // One copy of an element says what it is for itself, over what the message says for all of it.
    const variables = override?.variables
        ? { ...context.variables, ...override.variables }
        : context.variables;

    if ( definition.elementType === "button" || definition.elementType === "button-url" ) {
        const label = override?.label ?? ( definition.labelOmitted ? undefined : definition.label );
        const resolvedLabel = applyVariables( label, variables );

        const disabled = override?.disabled;
        const highlighted = override?.highlighted;

        const variant = mapButtonStyleToVariant( definition.style );
        const icon = buildEmojiIcon( override?.emoji ?? definition.emoji, context.emojiIconSrcByUnicode );
        const emoji = icon ? undefined : ( override?.emoji ?? definition.emoji );

        const onElementClick = context.onElementClick;

        return (
            <DiscordButton
                key={ item.element }
                label={ resolvedLabel }
                emoji={ emoji }
                icon={ icon }
                variant={ variant }
                disabled={ disabled }
                highlighted={ highlighted }
                onClick={ onElementClick ? () => onElementClick( item.element ) : undefined }
            />
        );
    }

    if (
        definition.elementType === "select-menu"
        || definition.elementType === "user-select"
        || definition.elementType === "channel-select"
        || definition.elementType === "role-select"
    ) {
        const placeholder = applyVariables( definition.placeholder, variables );
        const expandedConfig = context.selectMenus.find( ( menu ) => menu.elementName === item.element );
        const isInteractive = undefined !== expandedConfig;
        const isExpanded = isInteractive && context.expandedElementName === item.element;

        let dropdownOptions: ReadonlyArray<ExpandedSelectMenuOption> | undefined;

        if ( isExpanded && expandedConfig ) {
            if ( expandedConfig.options ) {
                dropdownOptions = expandedConfig.options;
            } else {
                const selectDef = definition as UISelectMenuDefinition;
                if ( selectDef.selectOptions ) {
                    dropdownOptions = selectDef.selectOptions.map( ( opt ) => ( {
                        ...buildOptionIcon( opt.emoji, context.emojiIconSrcByUnicode ),
                        label: opt.label ?? "",
                        description: opt.description,
                        selected: expandedConfig.selectedValues?.includes( opt.value ?? "" ),
                        highlighted: expandedConfig.highlightedValue === opt.value,
                    } ) );
                }
            }
        }

        const handleClick = isInteractive
            ? () => context.onToggleExpand( item.element )
            : undefined;

        return (
            <React.Fragment key={ item.element }>
                <DiscordSelectMenu
                    placeholder={ placeholder }
                    disabled={ override?.disabled }
                    highlighted={ Boolean( override?.highlighted ) }
                    selectedLabel={ override?.selectedLabel }
                    highlightedCaret={ Boolean( override?.highlightedCaret ) }
                    expanded={ isExpanded }
                    emojiIconSrcByUnicode={ context.emojiIconSrcByUnicode }
                    onClick={ handleClick }
                />
                { isExpanded && dropdownOptions && (
                    <DiscordSelectMenuDropdown
                        absolute={ true }
                        onSelect={ context.onSelectOption
                            ? ( optionIndex ) => context.onSelectOption?.( item.element, optionIndex )
                            : undefined }
                        options={ dropdownOptions.map( ( opt ) => ( {
                            ...( opt.icon
                                ? { icon: opt.icon }
                                : buildOptionIcon( opt.iconEmoji, context.emojiIconSrcByUnicode ) ),
                            label: opt.label,
                            description: opt.description,
                            selected: opt.selected,
                            highlighted: opt.highlighted,
                        } ) ) }
                    />
                ) }
            </React.Fragment>
        );
    }

    return null;
}

function mapButtonStyleToVariant( style: UIButtonStyle | undefined ): DiscordButtonVariant {
    if ( style === "primary" ) {
        return "primary";
    }

    if ( style === "success" ) {
        return "success";
    }

    if ( style === "danger" ) {
        return "danger";
    }

    if ( style === "link" ) {
        return "link";
    }

    return "secondary";
}

function buildEmojiIcon(
    emoji: string | undefined,
    emojiIconSrcByUnicode: Readonly<Record<string, string>> | undefined,
): React.ReactNode | undefined {
    if ( !emoji ) {
        return undefined;
    }

    const src = getDiscordEmojiIconSrc( emoji, emojiIconSrcByUnicode );

    if ( !src ) {
        return undefined;
    }

    return <img src={ src } alt="" className="discord-emoji" />;
}

/**
 * Function buildOptionIcon() :: Splits an option emoji into the two shapes a dropdown can show.
 *
 * Anything that resolves to an icon becomes `icon`, and only a plain unicode emoji stays as
 * `iconEmoji` text. Discord markup - custom emoji markdown or an `<emoji name='...'>` token - is
 * dropped rather than printed, since it is markup and not something a reader should see.
 */
function buildOptionIcon(
    emoji: string | undefined,
    emojiIconSrcByUnicode: Readonly<Record<string, string>> | undefined,
): { icon?: string; iconEmoji?: string } {
    if ( !emoji ) {
        return {};
    }

    const src = getDiscordEmojiIconSrc( emoji, emojiIconSrcByUnicode );

    if ( src ) {
        return { icon: src };
    }

    return isDiscordMarkup( emoji ) ? {} : { iconEmoji: emoji };
}

function chunkBySize<T>( items: ReadonlyArray<T>, chunkSize: number ): ReadonlyArray<ReadonlyArray<T>> {
    if ( items.length <= chunkSize ) {
        return [ items ];
    }

    const result: Array<Array<T>> = [];

    for ( let index = 0; index < items.length; index += chunkSize ) {
        result.push( items.slice( index, index + chunkSize ) );
    }

    return result;
}

