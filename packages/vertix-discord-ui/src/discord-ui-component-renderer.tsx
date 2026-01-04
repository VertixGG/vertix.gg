import * as React from "react";

import { DiscordButton } from "./discord-button";
import { DiscordEmbed } from "./discord-embed";
import { DiscordSelectMenu } from "./discord-select-menu";
import { DISCORD_EMOJI_ICON_SRC_BY_NAME, DISCORD_EMOJI_ICON_SRC_BY_UNICODE } from "./discord-emojis";

import { findUIEmbedDefinition, getUIComponentByName } from "./ui-definitions";

import type { UIButtonStyle, UIComponent, UIElementItem, UIEmbedDefinition } from "./ui-definitions";

type DiscordButtonVariant = "primary" | "secondary" | "success" | "danger" | "link" | "premium";

export interface UIElementOverride {
    label?: string;
    disabled?: boolean;
    highlighted?: boolean;
    hidden?: boolean;
}

export interface UIEmbedOverride {
    title?: string;
    description?: string;
    color?: number | string;
    templateEmbedName?: string;
}

export interface DiscordUIComponentRendererProps {
    componentName: string;
    elementOverrides?: Readonly<Record<string, UIElementOverride>>;
    embedOverrides?: Readonly<Record<string, UIEmbedOverride>>;
    variables?: Readonly<Record<string, string>>;
    emojiIconSrcByUnicode?: Readonly<Record<string, string>>;
    preferredEmbedsGroup?: string;
    preferredElementsGroup?: string;
    hideElements?: boolean;
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
    elementOverrides,
    embedOverrides,
    variables,
    emojiIconSrcByUnicode,
    preferredEmbedsGroup,
    preferredElementsGroup,
    hideElements,
}: DiscordUIComponentRendererProps ) {
    const [ component, setComponent ] = React.useState<UIComponent | null>( null );
    const [ resolvedEmbeds, setResolvedEmbeds ] = React.useState<ReadonlyArray<ResolvedEmbedDefinition>>( [] );
    const [ isLoading, setIsLoading ] = React.useState<boolean>( true );

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
                    const embedsGroup = preferredEmbedsGroup
                        ? resolvedComponent.embedsGroups.find( ( g ) => g.name === preferredEmbedsGroup )
                            ?? selectGroupByDefaultName( resolvedComponent.embedsGroups, resolvedComponent.defaultEmbedsGroup )
                        : selectGroupByDefaultName( resolvedComponent.embedsGroups, resolvedComponent.defaultEmbedsGroup );
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

                            return resolveEmbedDefinition( item.embed, definition, override, variables );
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
    }, [ componentName, embedOverrides, variables, preferredEmbedsGroup ] );

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
                        emojiIconSrcByUnicode,
                    } ) }
                </div>
            ) }
        </>
    );
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
): ResolvedEmbedDefinition {
    const title = override?.title ?? definition?.title;
    const description = override?.description ?? definition?.description;
    const color = override?.color ?? definition?.color;
    const image = definition?.image;
    const thumbnail = definition?.thumbnail;
    const footer = definition?.footer;

    const resolvedTitle = applyVariables( title, variables );
    const resolvedDescription = applyVariables( description, variables );

    return {
        title: resolvedTitle,
        description: resolvedDescription,
        color,
        image,
        thumbnail,
        footer,
    };
}

function applyVariables( text: string | undefined, variables: Readonly<Record<string, string>> | undefined ): string | undefined {
    if ( !text ) {
        return text;
    }

    let result = text;
    if ( variables ) {
        for ( const [ key, value ] of Object.entries( variables ) ) {
            const regex = new RegExp( `{${ key }}`, "g" );
            result = result.replace( regex, value );
        }
    }

    // Clean up any remaining unreplaced variables like {title} or {description}
    // to avoid showing raw template strings if they are not provided
    result = result.replace( /{[a-zA-Z0-9_-]+}/g, "" );

    return result;
}

function renderElementRows(
    rows: ReadonlyArray<ReadonlyArray<UIElementItem>>,
    context: {
        variables: Readonly<Record<string, string>> | undefined;
        elementOverrides: Readonly<Record<string, UIElementOverride>> | undefined;
        emojiIconSrcByUnicode: Readonly<Record<string, string>> | undefined;
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
    },
): React.ReactNode {
    const override = context.elementOverrides?.[ item.element ];
    const definition = item.definition;

    if ( definition.elementType === "button" || definition.elementType === "button-url" ) {
        const label = override?.label ?? ( definition.labelOmitted ? undefined : definition.label );
        const resolvedLabel = applyVariables( label, context.variables );

        const disabled = override?.disabled;
        const highlighted = override?.highlighted;

        const variant = mapButtonStyleToVariant( definition.style );
        const icon = buildEmojiIcon( definition.emoji, context.emojiIconSrcByUnicode );
        const emoji = icon ? undefined : definition.emoji;

        return (
            <DiscordButton
                key={ item.element }
                label={ resolvedLabel }
                emoji={ emoji }
                icon={ icon }
                variant={ variant }
                disabled={ disabled }
                highlighted={ highlighted }
            />
        );
    }

    if (
        definition.elementType === "select-menu"
        || definition.elementType === "user-select"
        || definition.elementType === "channel-select"
        || definition.elementType === "role-select"
    ) {
        const placeholder = applyVariables( definition.placeholder, context.variables );

        return (
            <DiscordSelectMenu
                key={ item.element }
                placeholder={ placeholder }
                disabled={ override?.disabled }
                highlighted={ Boolean( override?.highlighted ) }
                emojiIconSrcByUnicode={ context.emojiIconSrcByUnicode }
            />
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

    let src = emojiIconSrcByUnicode?.[ emoji ] ?? DISCORD_EMOJI_ICON_SRC_BY_UNICODE[ emoji ];

    if ( !src ) {
        const match = emoji.match( /<:([^:]+):(\d+)>/ );
        if ( match ) {
            const name = match[ 1 ];
            src = DISCORD_EMOJI_ICON_SRC_BY_NAME[ name ];
        }
    }

    if ( !src ) {
        return undefined;
    }

    return <img src={ src } alt="" className="discord-emoji" />;
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

