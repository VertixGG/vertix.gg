import * as React from "react";

import { DiscordButton } from "./discord-button";
import { DiscordEmbed } from "./discord-embed";
import { DISCORD_EMOJI_ICON_SRC_BY_UNICODE } from "./discord-emojis";

import { findUIEmbedDefinition, getUIComponentByName } from "./ui-definitions";

import type { UIButtonStyle, UIComponent, UIElementItem, UIEmbedDefinition } from "./ui-definitions";

type DiscordButtonVariant = "primary" | "secondary" | "success" | "danger" | "link" | "premium";

export interface UIElementOverride {
    label?: string;
    disabled?: boolean;
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
}

interface ResolvedEmbedDefinition {
    title?: string;
    description?: string;
    color?: number | string;
}

export function DiscordUIComponentRenderer( {
    componentName,
    elementOverrides,
    embedOverrides,
    variables,
    emojiIconSrcByUnicode,
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
                    const embedsGroup = selectEmbedsGroup( resolvedComponent );
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
    }, [ componentName, embedOverrides, variables ] );

    if ( isLoading ) {
        return null;
    }

    if ( !component ) {
        return null;
    }

    const elementsGroup = selectElementsGroup( component );

    return (
        <>
            { resolvedEmbeds.map( ( embed, index ) => (
                <DiscordEmbed
                    key={ `embed-${ index }` }
                    title={ embed.title }
                    description={ embed.description }
                    color={ embed.color }
                    emojiIconSrcByUnicode={ emojiIconSrcByUnicode }
                />
            ) ) }

            { elementsGroup && (
                <div className="discord-action-rows">
                    { renderElementRows( elementsGroup.items, {
                        elementOverrides: elementOverrides,
                        emojiIconSrcByUnicode,
                    } ) }
                </div>
            ) }
        </>
    );
}

function selectElementsGroup( component: UIComponent ) {
    const preferredName = component.defaultElementsGroup;
    if ( preferredName ) {
        const found = component.elementsGroups.find( ( group ) => group.name === preferredName );
        if ( found ) {
            return found;
        }
    }

    return component.elementsGroups[ 0 ] ?? null;
}

function selectEmbedsGroup( component: UIComponent ) {
    const preferredName = component.defaultEmbedsGroup;
    if ( preferredName ) {
        const found = component.embedsGroups.find( ( group ) => group.name === preferredName );
        if ( found ) {
            return found;
        }
    }

    return component.embedsGroups[ 0 ] ?? null;
}

function resolveEmbedDefinition(
    embedName: string,
    definition: UIEmbedDefinition | undefined,
    override: UIEmbedOverride | undefined,
    variables: Readonly<Record<string, string>> | undefined,
): ResolvedEmbedDefinition {
    const title = override?.title ?? definition?.title;
    const description = override?.description ?? definition?.description;
    const color = override?.color ?? definition?.color;

    const resolvedTitle = applyVariables( title, variables );
    const resolvedDescription = applyVariables( description, variables );

    return {
        title: resolvedTitle,
        description: resolvedDescription,
        color,
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
        elementOverrides: Readonly<Record<string, UIElementOverride>> | undefined;
        emojiIconSrcByUnicode: Readonly<Record<string, string>> | undefined;
    },
): React.ReactNode {
    const result: Array<React.ReactNode> = [];

    let rowIndex = 0;
    for ( const row of rows ) {
        const chunked = chunkBySize( row, 5 );

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

function renderElement(
    item: UIElementItem,
    context: {
        elementOverrides: Readonly<Record<string, UIElementOverride>> | undefined;
        emojiIconSrcByUnicode: Readonly<Record<string, string>> | undefined;
    },
): React.ReactNode {
    const override = context.elementOverrides?.[ item.element ];
    const definition = item.definition;

    if ( definition.elementType === "button" || definition.elementType === "button-url" ) {
        const label = override?.label ?? ( definition.labelOmitted ? undefined : definition.label );
        const disabled = override?.disabled;

        const variant = mapButtonStyleToVariant( definition.style );
        const icon = buildEmojiIcon( definition.emoji, context.emojiIconSrcByUnicode );
        const emoji = icon ? undefined : definition.emoji;

        return (
            <DiscordButton
                key={ item.element }
                label={ label }
                emoji={ emoji }
                icon={ icon }
                variant={ variant }
                disabled={ disabled }
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

    const src = emojiIconSrcByUnicode?.[ emoji ] ?? DISCORD_EMOJI_ICON_SRC_BY_UNICODE[ emoji ];
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

